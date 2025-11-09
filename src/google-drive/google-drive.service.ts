import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleDriveService {
  private driveClient: drive_v3.Drive;
  private oauth?: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_OAUTH_REDIRECT_URI');

    if (clientId && clientSecret && redirectUri) {
      this.oauth = new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
      const tokensJSON = this.configService.get<string>('GOOGLE_OAUTH_TOKENS');
      if (tokensJSON) {
        try { this.oauth.setCredentials(JSON.parse(tokensJSON)); } catch {
          Logger.warn('Error parsing GOOGLE_OAUTH_TOKENS');
        }
      }
      this.driveClient = google.drive({ version: 'v3', auth: this.oauth });
    } else {
      const client_email = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
      const private_key = this.configService.get<string>('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      if (!client_email || !private_key) {
        throw new Error('Configure OAuth (CLIENT/SECRET/REDIRECT_URI) o Service Account (EMAIL/KEY)');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: { client_email, private_key },
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      this.driveClient = google.drive({ version: 'v3', auth });
    }
  }

  getAuthUrl(scopes = ['https://www.googleapis.com/auth/drive']): string {
    if (!this.oauth) throw new InternalServerErrorException('OAuth no configurado');
    return this.oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes });
  }

  async exchangeCodeForTokens(code: string) {
    if (!this.oauth) throw new InternalServerErrorException('OAuth no configurado');
    const { tokens } = await this.oauth.getToken(code);
    this.oauth.setCredentials(tokens);
    return tokens;
  }

  private ensureAuthorized() {
    if (!this.oauth) return; // usando Service Account
    const creds = this.oauth.credentials || {};
    if (!creds.access_token && !creds.refresh_token) {
      const url = this.getAuthUrl();
      throw new InternalServerErrorException(`Google OAuth no configurado. Autoriza la app visitando: ${url}`);
    }
  }

  async uploadFile(file: Express.Multer.File, parentFolderId?: string) {
    this.ensureAuthorized();
    try {
      const folderId = parentFolderId ?? this.configService.get('GOOGLE_DRIVE_FOLDER_ID');

      const name = file?.filename ?? file?.originalname ?? `upload-${Date.now()}`;
      const bodyStream = file?.path
        ? fs.createReadStream(file.path)
        : file?.buffer
        ? Readable.from(file.buffer)
        : undefined;

      if (!bodyStream) {
        throw new InternalServerErrorException('Archivo sin contenido para subir');
      }

      const resp = await this.driveClient.files.create({
        requestBody: { name, parents: folderId ? [folderId] : undefined },
        media: { mimeType: file.mimetype, body: bodyStream },
        fields: 'id, name, mimeType, webViewLink, webContentLink, parents',
        supportsAllDrives: true,
      });

      const fileId = resp.data.id!;
      await this.setPublic(fileId);
      try { if (file?.path) fs.unlinkSync(file.path); } catch { 
        Logger.debug('Error unlinkSync');
      }

      return {
        id: fileId,
        name: resp.data.name,
        url: `https://drive.google.com/uc?id=${fileId}`,
      };
    } catch (e) {
      try { if (file?.path) fs.unlinkSync(file.path); } catch {
        Logger.debug('Error unlinkSync');
      }
      Logger.error(e);
      throw new InternalServerErrorException('Error subiendo el archivo a Google Drive');
    }
  }

  async setPublic(fileId: string) {
    this.ensureAuthorized();
    await this.driveClient.permissions.create({
      fileId,
      requestBody: { type: 'anyone', role: 'reader' },
    });
  }

  async getFileById(fileId: string) {
    this.ensureAuthorized();
    const resp = await this.driveClient.files.get({
      fileId,
      fields: 'id, name, mimeType, parents, webViewLink, webContentLink, size, createdTime, modifiedTime',
      supportsAllDrives: true,
    });
    return resp.data;
  }

  async searchFilesByName(name: string, opts?: { mimeContains?: string; inFolderId?: string; pageSize?: number; pageToken?: string }) {
    this.ensureAuthorized();
    const qParts: string[] = [`name contains '${name.replace(/'/g, "\\'")}'`, 'trashed = false'];
    if (opts?.mimeContains) qParts.push(`mimeType contains '${opts.mimeContains}'`);
    if (opts?.inFolderId) qParts.push(`'${opts.inFolderId}' in parents`);

    const resp = await this.driveClient.files.list({
      q: qParts.join(' and '),
      fields: 'nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)',
      pageSize: opts?.pageSize ?? 50,
      pageToken: opts?.pageToken,
      orderBy: 'modifiedTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives',
    });

    return { files: resp.data.files ?? [], nextPageToken: resp.data.nextPageToken };
  }

  async listFilesInFolder(folderId: string, opts?: { pageSize?: number; pageToken?: string }) {
    this.ensureAuthorized();
    const resp = await this.driveClient.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)',
      pageSize: opts?.pageSize ?? 100,
      pageToken: opts?.pageToken,
      orderBy: 'folder,name',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives',
    });
    return { files: resp.data.files ?? [], nextPageToken: resp.data.nextPageToken };
  }

  async createFolder(name: string, parentFolderId?: string) {
    this.ensureAuthorized();
    const resp = await this.driveClient.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      },
      fields: 'id, name, parents',
    });
    return resp.data;
  }

  async getOrCreateFolderByName(name: string, parentFolderId?: string, createIfMissing = true) {
    this.ensureAuthorized();
    const q: string[] = [
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
      `name = '${name.replace(/'/g, "\\'")}'`,
    ];
    if (parentFolderId) q.push(`'${parentFolderId}' in parents`);

    const list = await this.driveClient.files.list({
      q: q.join(' and '),
      fields: 'files(id, name, parents)',
      pageSize: 1,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives',
    });

    if (list.data.files && list.data.files.length > 0) {
      return list.data.files[0];
    }

    if (!createIfMissing) return null;
    return this.createFolder(name, parentFolderId);
  }

  async ensureFolderPath(path: string, rootFolderId?: string) {
    const parts = path.split('/').map(p => p.trim()).filter(Boolean);
    let currentParent = rootFolderId ?? this.configService.get('GOOGLE_DRIVE_FOLDER_ID') ?? undefined;

    for (const part of parts) {
      const folder = await this.getOrCreateFolderByName(part, currentParent, true);
      currentParent = folder!.id!;
    }
    return currentParent!;
  }
}



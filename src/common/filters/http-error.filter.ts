import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };
    const body =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, any>);

    const expose = this.resolveExpose(status, body);
    const message = this.resolveMessage(body);

    response.status(status).json({
      statusCode: status,
      error: body.error ?? (isHttpException ? exception.name : 'InternalError'),
      code: body.code ?? 'GENERIC_ERROR',
      message: message ?? (isHttpException ? exception.message : 'Internal server error'),
      expose,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveExpose(status: number, body: Record<string, any>): boolean {
    if (typeof body.expose === 'boolean') {
      return body.expose;
    }

    if (status === HttpStatus.BAD_REQUEST) {
      if (Array.isArray(body.message)) {
        const hasForbiddenProperty = body.message.some(
          (msg: any) =>
            typeof msg === 'string' && msg.toLowerCase().includes('should not exist'),
        );
        return !hasForbiddenProperty;
      }
      return true;
    }

    return false;
  }

  private resolveMessage(body: Record<string, any>): string | undefined {
    if (Array.isArray(body.message)) {
      return body.message.filter((msg) => typeof msg === 'string').join('\n');
    }

    if (typeof body.message === 'string') {
      return body.message;
    }

    return undefined;
  }
}

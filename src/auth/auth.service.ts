import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      this.handleDbErrorExceptions(error);
    }

    return {
      user: this.stripPassword(user),
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        roles: true,
        password: true,
        phone: true,
        birthDate: true,
        deletedAt: true,
      },
    });

    if (!user || !bcrypt.compareSync(loginUserDto.password, user.password))
      throw new UnauthorizedException({
        message:
          'Usuario y/o contraseña incorrectos. Si aún no tienes una cuenta, puedes registrarte',
        code: 'AUTH_INVALID_CREDENTIALS',
        expose: true,
      });

    return {
      user: this.stripPassword(user),
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  checkStatus(user: User) {
    return {
      user: this.stripPassword(user),
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  handleDbErrorExceptions(error: unknown) {
    if (this.isPostgresError(error) && error.code === '23505') {
      const detail = error.detail ?? 'El dato ya existe';
      const isEmailDuplicate = typeof detail === 'string' && detail.toLowerCase().includes('email');
      throw new BadRequestException({
        message: isEmailDuplicate
          ? 'Ya existe una cuenta con ese correo. Si olvidaste la contraseña puedes restablecerla.'
          : detail,
        code: 'AUTH_CONFLICT',
        expose: true,
      });
    }

    console.error(error);
    throw new InternalServerErrorException({
      message: 'Ocurrió un error inesperado. Por favor, verifica los logs.',
      code: 'AUTH_UNEXPECTED_ERROR',
      expose: false,
    });
  }

  private stripPassword(user: User) {
    const { password: _password, ...rest } = user;
    void _password;
    return rest;
  }

  private isPostgresError(error: unknown): error is { code?: string; detail?: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }
}

import { Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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
    await this.userRepository.save(user);

    const { password: _ , ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
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
      throw new UnauthorizedException('Las credenciales no son validas');

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  checkStatus(user: User) {
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  handleDbErrorExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado. Por favor, verifica los logs.',
    );
  }
}

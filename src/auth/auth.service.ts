import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { validate as isUUId } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

    return {
      ...user,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email }
    });

    if (!user || !bcrypt.compareSync(loginUserDto.password, user.password))
      throw new UnauthorizedException('Las credenciales no son validas');

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  async getAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.userRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async checkStatus(user: User) {
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  async findOne(param: string) {
    let user: User | null;
    if (isUUId(param)) {
      user = await this.userRepository.findOneBy({ id: param });
    } else {
      user = await this.userRepository.findOneBy({ email: param });
    }

    if (!user) {
      throw new NotFoundException('No existe el usuario solicitado');
    }

    return user;
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  async deleteAllUsers() {
    const query = this.userRepository.createQueryBuilder('user');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbErrorExceptions(error);
    }
  }

  handleDbErrorExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado. Por favor, verifica los logs.',
    );
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

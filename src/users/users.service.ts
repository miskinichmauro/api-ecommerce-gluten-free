import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { validate as isUUId } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.userRepository.find({
      take: limit,
      skip: offset,
    });
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
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
}


import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  async getProfile(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('No existe el usuario solicitado');
    }

    return this.stripPassword(user);
  }

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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('No existe el usuario solicitado');
    }

    if (
      updateProfileDto.email &&
      updateProfileDto.email.toLowerCase().trim() !== user.email
    ) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateProfileDto.email.toLowerCase().trim() },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('El email ya esta siendo utilizado');
      }
    }

    Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(user);
    return this.stripPassword(updatedUser);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }
  
  async removeAll() {
    const query = this.userRepository.createQueryBuilder('user');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbErrorExceptions(error);
    }
  }

  private stripPassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  handleDbErrorExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado. Por favor, verifica los logs.',
    );
  }
}


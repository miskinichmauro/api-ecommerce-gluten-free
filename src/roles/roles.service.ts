import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    return await this.roleRepository.remove(role);
  }
  
  handleDBException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
  }

  async removeAll() {
    const query = this.roleRepository.createQueryBuilder('role');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}

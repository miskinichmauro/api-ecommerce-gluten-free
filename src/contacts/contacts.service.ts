import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll() {
    return await this.contactRepository.find();
  }

  async findOne(id: string) {
    const contact = await this.contactRepository.findOneBy({ id });
    if (!contact)
      throw new NotFoundException({
        message: `Contacto con id ${id} no encontrado`,
        code: 'CONTACT_NOT_FOUND',
        expose: true,
      });
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.findOne(id);
    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async remove(id: string) {
    const contact = await this.findOne(id);
    return await this.contactRepository.remove(contact);
  }

  async removeAll() {
    const query = this.contactRepository.createQueryBuilder('contact');
    return await query.delete().where({}).execute();
  }
}

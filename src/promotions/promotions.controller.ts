import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva promoción' })
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las promociones ordenadas por prioridad' })
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una promoción por ID' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza una promoción por ID' })
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una promoción por ID' })
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}

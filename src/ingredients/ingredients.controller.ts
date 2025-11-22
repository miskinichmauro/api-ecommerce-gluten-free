import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un ingrediente' })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos los ingredientes' })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca ingredientes por texto' })
  search(@Query('query') query: string) {
    return this.ingredientsService.search(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un ingrediente por ID' })
  update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un ingrediente por ID' })
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}

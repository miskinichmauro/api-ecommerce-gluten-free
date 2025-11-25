import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchRecipesDto } from './dto/search-recipes.dto';

@Controller('recipes')
@ApiTags('Recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva receta' })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todas las recetas' })
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca recetas por ingredientes' })
  search(@Query() searchRecipesDto: SearchRecipesDto) {
    return this.recipesService.filterByIngredients(searchRecipesDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una receta por ID' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza una receta por ID' })
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una receta por ID' })
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}

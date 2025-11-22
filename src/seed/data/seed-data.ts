import { CreateUserDto } from 'src/auth/dto';
import { CreateContactDto } from 'src/contacts/dto/create-contact.dto';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { CreateRecipeDto } from 'src/recipes/dto/create-recipe.dto';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';

type SeedProduct = Omit<CreateProductDto, 'categoryId' | 'tagIds'> & {
  categoryName: string;
  tagNames?: string[];
};

export const initialCategories: CreateCategoryDto[] = [
  {
    name: 'Panificados sin gluten',
    description: 'Panes, tortillas y bases listas libres de gluten.',
    isFeatured: true,
  },
  {
    name: 'Harinas y premezclas',
    description: 'Harinas alternativas y mixes listos para hornear.',
    isFeatured: true,
  },
  {
    name: 'Snacks saludables',
    description: 'Opciones rápidas, crocantes y nutritivas.',
    isFeatured: true,
  },
  {
    name: 'Bebidas sin gluten',
    description: 'Cervezas, bebidas y opciones libres de gluten.',
    isFeatured: true,
  },
  {
    name: 'Pastas y granos',
    description: 'Pastas y granos aptos para celíacos.',
    isFeatured: false,
  },
  {
    name: 'Reposteria sin gluten',
    description: 'Dulces y postres pensados para intolerancias.',
    isFeatured: false,
  },
  {
    name: 'Desayunos y cereales',
    description: 'Cereales, granolas y opciones para empezar el día.',
    isFeatured: false,
  },
];

export const initialTags: CreateTagDto[] = [
  { name: 'Apto celiacos' },
  { name: 'Vegano' },
  { name: 'Sin lactosa' },
  { name: 'Sin azucar' },
  { name: 'Alto en proteina' },
  { name: 'Rico en fibra' },
  { name: 'Snack saludable' },
  { name: 'Listo para hornear' },
  { name: 'Desayuno' },
  { name: 'Gourmet' },
];

export const initialProducts: SeedProduct[] = [
  {
    title: 'Pan sin gluten de arroz',
    price: 25000,
    description: 'Pan artesanal hecho con harina de arroz, apto para celíacos.',
    slug: 'pan_sin_gluten_arroz',
    stock: 50,
    isFeatured: true,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Apto celiacos', 'Vegano', 'Sin lactosa'],
  },
  {
    title: 'Pan de mandioca sin gluten',
    price: 22000,
    description: 'Pan casero elaborado con fécula de mandioca.',
    slug: 'pan_mandioca_sin_gluten',
    stock: 40,
    isFeatured: true,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Apto celiacos', 'Rico en fibra'],
  },
  {
    title: 'Galletas de maíz sin azúcar',
    price: 18000,
    description: 'Crujientes galletas de maíz libres de gluten y azúcar.',
    slug: 'galletas_maiz_sin_azucar',
    stock: 70,
    isFeatured: true,
    categoryName: 'Snacks saludables',
    tagNames: ['Apto celiacos', 'Sin azucar', 'Snack saludable'],
  },
  {
    title: 'Harina de arroz',
    price: 20000,
    description: 'Harina 100% de arroz, ideal para panificados y repostería.',
    slug: 'harina_arroz',
    stock: 100,
    isFeatured: true,
    categoryName: 'Harinas y premezclas',
    tagNames: ['Vegano', 'Listo para hornear'],
  },
  {
    title: 'Harina de almendras',
    price: 45000,
    description: 'Harina fina de almendras, ideal para repostería sin gluten.',
    slug: 'harina_almendras',
    stock: 60,
    isFeatured: true,
    categoryName: 'Harinas y premezclas',
    tagNames: ['Alto en proteina', 'Listo para hornear'],
  },
  {
    title: 'Tortillas de maíz sin gluten',
    price: 15000,
    description: 'Tortillas frescas hechas con maíz, libres de gluten.',
    slug: 'tortillas_maiz_sin_gluten',
    stock: 80,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Vegano', 'Listo para hornear'],
  },
  {
    title: 'Pizza base sin gluten',
    price: 30000,
    description:
      'Base de pizza lista para hornear, hecha con harina sin gluten.',
    slug: 'pizza_base_sin_gluten',
    stock: 45,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Listo para hornear', 'Apto celiacos'],
  },
  {
    title: 'Brownie sin gluten',
    price: 20000,
    description: 'Brownie de chocolate sin gluten ni azúcar.',
    slug: 'brownie_sin_gluten',
    stock: 55,
    categoryName: 'Reposteria sin gluten',
    tagNames: ['Sin azucar', 'Gourmet'],
  },
  {
    title: 'Cerveza sin gluten',
    price: 18000,
    description: 'Cerveza artesanal apta para celíacos.',
    slug: 'cerveza_sin_gluten',
    stock: 90,
    categoryName: 'Bebidas sin gluten',
    tagNames: ['Gourmet'],
  },
  {
    title: 'Pasta de arroz sin gluten',
    price: 25000,
    description: 'Pasta elaborada con arroz, libre de gluten.',
    slug: 'pasta_arroz_sin_gluten',
    stock: 75,
    categoryName: 'Pastas y granos',
    tagNames: ['Apto celiacos', 'Vegano'],
  },
  {
    title: 'Fideos de quinoa sin gluten',
    price: 28000,
    description: 'Fideos saludables hechos con quinoa.',
    slug: 'fideos_quinoa_sin_gluten',
    stock: 60,
    categoryName: 'Pastas y granos',
    tagNames: ['Alto en proteina', 'Vegano'],
  },
  {
    title: 'Galletas de coco sin gluten',
    price: 19000,
    description: 'Galletas dulces a base de coco, libres de gluten.',
    slug: 'galletas_coco_sin_gluten',
    stock: 80,
    categoryName: 'Snacks saludables',
    tagNames: ['Snack saludable', 'Sin lactosa'],
  },
  {
    title: 'Cereal inflado de arroz sin gluten',
    price: 15000,
    description: 'Cereal crocante a base de arroz inflado.',
    slug: 'cereal_arroz_sin_gluten',
    stock: 100,
    categoryName: 'Desayunos y cereales',
    tagNames: ['Desayuno', 'Snack saludable'],
  },
  {
    title: 'Muffin de banana sin gluten',
    price: 22000,
    description:
      'Muffin casero elaborado con harina sin gluten y banana madura.',
    slug: 'muffin_banana_sin_gluten',
    stock: 40,
    categoryName: 'Reposteria sin gluten',
    tagNames: ['Desayuno', 'Sin lactosa'],
  },
  {
    title: 'Barra de granola sin gluten',
    price: 12000,
    description: 'Barra energética con granola y miel, libre de gluten.',
    slug: 'barra_granola_sin_gluten',
    stock: 200,
    categoryName: 'Snacks saludables',
    tagNames: ['Desayuno', 'Snack saludable', 'Rico en fibra'],
  },
  {
    title: 'Pan de quinoa sin gluten',
    price: 27000,
    description: 'Pan integral elaborado con harina de quinoa.',
    slug: 'pan_quinoa_sin_gluten',
    stock: 30,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Alto en proteina', 'Rico en fibra'],
  },
  {
    title: 'Galletas de avena certificada sin gluten',
    price: 21000,
    description: 'Galletas dulces con avena certificada sin gluten.',
    slug: 'galletas_avena_sin_gluten',
    stock: 60,
    categoryName: 'Snacks saludables',
    tagNames: ['Sin azucar', 'Rico en fibra'],
  },
  {
    title: 'Cerveza artesanal de quinoa sin gluten',
    price: 20000,
    description: 'Cerveza especial elaborada con quinoa.',
    slug: 'cerveza_quinoa_sin_gluten',
    stock: 70,
    categoryName: 'Bebidas sin gluten',
    tagNames: ['Gourmet', 'Alto en proteina'],
  },
  {
    title: 'Snacks de mandioca sin gluten',
    price: 15000,
    description: 'Crujientes chips de mandioca horneados.',
    slug: 'snacks_mandioca_sin_gluten',
    stock: 90,
    categoryName: 'Snacks saludables',
    tagNames: ['Snack saludable', 'Vegano'],
  },
  {
    title: 'Pan de sarraceno sin gluten',
    price: 30000,
    description: 'Pan integral elaborado con harina de trigo sarraceno.',
    slug: 'pan_sarraceno_sin_gluten',
    stock: 50,
    categoryName: 'Panificados sin gluten',
    tagNames: ['Apto celiacos', 'Rico en fibra'],
  },
];

export const initialUsers: CreateUserDto[] = [
  {
    email: 'admin-egf@gmail.com',
    password: 'Admin@123.',
    fullName: 'Administrador',
    roles: ['Admin'],
  },
  {
    email: 'user-egf@gmail.com',
    password: 'User@123.',
    fullName: 'Usuario',
    roles: ['User'],
  },
];

export const initialRecipes: CreateRecipeDto[] = [
  {
    title: 'Ensalada Mediterránea sin gluten',
    text: `Lava y corta en mitades 200 g de tomates cherry y 1 pepino en rodajas finas. Añade 100 g de aceitunas negras, 80 g de queso feta en cubos y media cebolla morada en julianas. 
      Aliña con 3 cucharadas de aceite de oliva, el jugo de medio limón, sal y orégano seco al gusto. 
      Mezcla suavemente y sirve fresca. Es una receta ligera, rápida y naturalmente libre de gluten.`
  },
  {
    title: 'Pollo al horno con especias',
    text: `Coloca 4 pechugas de pollo en un recipiente y marínalas con 3 dientes de ajo picados, 1 cucharada de pimentón dulce, 1 cucharadita de comino, sal, pimienta, el jugo de 1 limón y 3 cucharadas de aceite de oliva. 
      Deja reposar al menos 30 minutos (idealmente 2 horas). 
      Precalienta el horno a 200°C y hornea durante 25-30 minutos, hasta que el pollo esté dorado por fuera y jugoso por dentro. 
      Se puede acompañar con vegetales asados o una ensalada fresca.`
  },
  {
    title: 'Brownies de harina de almendra',
    text: `Precalienta el horno a 180°C. En un bol, mezcla 1 taza de harina de almendra, 1/2 taza de cacao en polvo sin azúcar, 1/2 cucharadita de polvo de hornear y una pizca de sal. 
      En otro recipiente, bate 3 huevos con 1/2 taza de miel o sirope de agave y 1/3 taza de aceite de coco derretido. 
      Une ambas mezclas hasta obtener una masa homogénea y vierte en un molde engrasado. 
      Hornea durante 25 minutos. Deja enfriar antes de cortar en cuadrados. ¡Un postre esponjoso y sin gluten!`
  },
];

export const initialContacts: CreateContactDto[] = [
  {
    title: 'Administrador',
    phone: '+595981012345',
    email: 'administrador@egf.com'
  },
  {
    title: 'Delivery',
    phone: '+595981012345',
    email: 'delivery@egf.com'
  },
  {
    title: 'Atención al cliente',
    phone: '+595981012345',
    email: 'atc@egf.com'
  }
];

export const initialRoles: CreateRoleDto[] = [
  {
    name: 'Admin',
    description: 'Administrador de la aplicación',
  },
  {
    name: 'User',
    description: 'Usuario que utiliza la aplicación',
  },
  {
    name: 'Delivery',
    description: 'Encargado de repartir los pedidos',
  }
];

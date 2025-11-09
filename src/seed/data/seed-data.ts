import { CreateUserDto } from 'src/auth/dto';
import { CreateContactDto } from 'src/contacts/dto/create-contact.dto';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { CreateRecipeDto } from 'src/recipes/dto/create-recipe.dto';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';

export const initialProducts: CreateProductDto[] = [
  {
    title: 'Pan sin gluten de arroz',
    price: 25000,
    unitOfMeasure: 'unidad',
    description: 'Pan artesanal hecho con harina de arroz, apto para celíacos.',
    slug: 'pan_sin_gluten_arroz',
    stock: 50,
    isFeatured: true,
  },
  {
    title: 'Pan de mandioca sin gluten',
    price: 22000,
    unitOfMeasure: 'unidad',
    description: 'Pan casero elaborado con fécula de mandioca.',
    slug: 'pan_mandioca_sin_gluten',
    stock: 40,
    isFeatured: true,
  },
  {
    title: 'Galletas de maíz sin azúcar',
    price: 18000,
    unitOfMeasure: 'paquete',
    description: 'Crujientes galletas de maíz libres de gluten y azúcar.',
    slug: 'galletas_maiz_sin_azucar',
    stock: 70,
    isFeatured: true,
  },
  {
    title: 'Harina de arroz',
    price: 20000,
    unitOfMeasure: 'kg',
    description: 'Harina 100% de arroz, ideal para panificados y repostería.',
    slug: 'harina_arroz',
    stock: 100,
    isFeatured: true,
  },
  {
    title: 'Harina de almendras',
    price: 45000,
    unitOfMeasure: 'kg',
    description: 'Harina fina de almendras, ideal para repostería sin gluten.',
    slug: 'harina_almendras',
    stock: 60,
    isFeatured: true,
  },
  {
    title: 'Tortillas de maíz sin gluten',
    price: 15000,
    unitOfMeasure: 'paquete',
    description: 'Tortillas frescas hechas con maíz, libres de gluten.',
    slug: 'tortillas_maiz_sin_gluten',
    stock: 80,
  },
  {
    title: 'Pizza base sin gluten',
    price: 30000,
    unitOfMeasure: 'unidad',
    description:
      'Base de pizza lista para hornear, hecha con harina sin gluten.',
    slug: 'pizza_base_sin_gluten',
    stock: 45,
  },
  {
    title: 'Brownie sin gluten',
    price: 20000,
    unitOfMeasure: 'unidad',
    description: 'Brownie de chocolate sin gluten ni azúcar.',
    slug: 'brownie_sin_gluten',
    stock: 55,
  },
  {
    title: 'Cerveza sin gluten',
    price: 18000,
    unitOfMeasure: 'botella',
    description: 'Cerveza artesanal apta para celíacos.',
    slug: 'cerveza_sin_gluten',
    stock: 90,
  },
  {
    title: 'Pasta de arroz sin gluten',
    price: 25000,
    unitOfMeasure: 'paquete',
    description: 'Pasta elaborada con arroz, libre de gluten.',
    slug: 'pasta_arroz_sin_gluten',
    stock: 75,
  },
  {
    title: 'Fideos de quinoa sin gluten',
    price: 28000,
    unitOfMeasure: 'paquete',
    description: 'Fideos saludables hechos con quinoa.',
    slug: 'fideos_quinoa_sin_gluten',
    stock: 60,
  },
  {
    title: 'Galletas de coco sin gluten',
    price: 19000,
    unitOfMeasure: 'paquete',
    description: 'Galletas dulces a base de coco, libres de gluten.',
    slug: 'galletas_coco_sin_gluten',
    stock: 80,
  },
  {
    title: 'Cereal inflado de arroz sin gluten',
    price: 15000,
    unitOfMeasure: 'bolsa',
    description: 'Cereal crocante a base de arroz inflado.',
    slug: 'cereal_arroz_sin_gluten',
    stock: 100,
  },
  {
    title: 'Muffin de banana sin gluten',
    price: 22000,
    unitOfMeasure: 'unidad',
    description:
      'Muffin casero elaborado con harina sin gluten y banana madura.',
    slug: 'muffin_banana_sin_gluten',
    stock: 40,
  },
  {
    title: 'Barra de granola sin gluten',
    price: 12000,
    unitOfMeasure: 'unidad',
    description: 'Barra energética con granola y miel, libre de gluten.',
    slug: 'barra_granola_sin_gluten',
    stock: 200,
  },
  {
    title: 'Pan de quinoa sin gluten',
    price: 27000,
    unitOfMeasure: 'unidad',
    description: 'Pan integral elaborado con harina de quinoa.',
    slug: 'pan_quinoa_sin_gluten',
    stock: 30,
  },
  {
    title: 'Galletas de avena certificada sin gluten',
    price: 21000,
    unitOfMeasure: 'paquete',
    description: 'Galletas dulces con avena certificada sin gluten.',
    slug: 'galletas_avena_sin_gluten',
    stock: 60,
  },
  {
    title: 'Cerveza artesanal de quinoa sin gluten',
    price: 20000,
    unitOfMeasure: 'botella',
    description: 'Cerveza especial elaborada con quinoa.',
    slug: 'cerveza_quinoa_sin_gluten',
    stock: 70,
  },
  {
    title: 'Snacks de mandioca sin gluten',
    price: 15000,
    unitOfMeasure: 'paquete',
    description: 'Crujientes chips de mandioca horneados.',
    slug: 'snacks_mandioca_sin_gluten',
    stock: 90,
  },
  {
    title: 'Pan de sarraceno sin gluten',
    price: 30000,
    unitOfMeasure: 'unidad',
    description: 'Pan integral elaborado con harina de trigo sarraceno.',
    slug: 'pan_sarraceno_sin_gluten',
    stock: 50,
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

import { CreateUserDto } from 'src/auth/dto';
import { CreateContactDto } from 'src/contacts/dto/create-contact.dto';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { CreateRecipeDto } from 'src/recipes/dto/create-recipe.dto';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { CreateIngredientDto } from 'src/ingredients/dto/create-ingredient.dto';

type SeedProduct = Omit<CreateProductDto, 'categoryId' | 'tagIds'> & {
  categoryName: string;
  tagNames?: string[];
  imageFileNames?: string[];
};

type SeedRecipe = Omit<CreateRecipeDto, 'ingredientIds'> & {
  ingredientNames?: string[];
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
    name: 'Repostería sin gluten',
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
  { name: 'Sin azúcar' },
  { name: 'Alto en proteína' },
  { name: 'Rico en fibra' },
  { name: 'Snack saludable' },
  { name: 'Listo para hornear' },
  { name: 'Desayuno' },
  { name: 'Gourmet' },
];

export const initialProducts: SeedProduct[] = [
  {
    title: 'Fideos de arroz sin gluten',
    price: 25000,
    description:
      'Fideos elaborados 100% con arroz, libre de gluten y con textura suave al cocinarse. Ideal para preparaciones ligeras, salteados, ensaladas frías o platos tradicionales sin perder consistencia.',
    slug: 'fideos-de-arroz-sin-gluten',
    stock: 5,
    isFeatured: true,
    categoryName: 'Pastas y granos',
    imageFileNames: ['fideos-de-arroz-sin-gluten-1763615492352-4692.png'],
    tagNames: ['Apto celiacos', 'Vegano'],
  },
  {
    title: 'Pan sin gluten de arroz',
    price: 10000,
    description:
      'Pan artesanal hecho con harina de arroz, apto para celíacos. Textura suave, miga blanca y corteza dorada. Ideal para desayunos, meriendas o tostadas',
    slug: 'pan-sin-gluten-de-arroz',
    stock: 5,
    isFeatured: true,
    categoryName: 'Panificados sin gluten',
    imageFileNames: ['pan-sin-gluten-de-arroz-1763612629597-3833.png'],
    tagNames: ['Apto celiacos', 'Sin lactosa'],
  },
  {
    title: 'Galletitas de maíz sin azúcar',
    price: 18000,
    description:
      'Crujientes galletitas elaboradas con harina de maíz, totalmente libres de gluten y sin azúcar añadida. Ligeras, doradas y perfectas como snack saludable para cualquier momento del día.',
    slug: 'galletitas-de-maz-sin-azcar',
    stock: 5,
    isFeatured: true,
    categoryName: 'Panificados sin gluten',
    imageFileNames: ['galletas-de-ma-a-z-sin-az-a-car-1763613460738-8537.png'],
    tagNames: ['Apto celiacos', 'Sin azúcar', 'Snack saludable'],
  },
  {
    title: 'Harina de arroz',
    price: 20000,
    description:
      'Harina fina elaborada 100% a base de arroz. Ideal para panificados, repostería y recetas sin gluten. Textura suave, sabor neutro y excelente para preparaciones livianas.',
    slug: 'harina-de-arroz',
    stock: 5,
    isFeatured: true,
    categoryName: 'Harinas y premezclas',
    imageFileNames: ['harina-de-arroz-1763613787009-8595.png'],
    tagNames: ['Vegano', 'Listo para hornear'],
  },
  {
    title: 'Harina de almendras',
    price: 45000,
    description:
      'Harina fina obtenida de almendras molidas, ideal para repostería sin gluten. Aporta sabor suave, textura húmeda y un perfil nutritivo alto en proteínas y grasas saludables. Perfecta para brownies, muffins, panqueques y masas gourmet.',
    slug: 'harina-de-almendras',
    stock: 5,
    isFeatured: true,
    categoryName: 'Harinas y premezclas',
    imageFileNames: ['harina-de-almendras-1763613983691-5588.png'],
    tagNames: ['Alto en proteína', 'Listo para hornear'],
  },
  {
    title: 'Brownie sin gluten',
    price: 20000,
    description:
      'Brownie de chocolate húmedo y esponjoso, elaborado con harina sin gluten y endulzado sin azúcar añadida. Textura densa, sabor intenso a cacao y perfecto para quienes buscan un postre apto para celíacos sin perder el toque gourmet.',
    slug: 'brownie-sin-gluten',
    stock: 10,
    isFeatured: true,
    categoryName: 'Repostería sin gluten',
    imageFileNames: ['brownie-sin-gluten-1763614504178-847.png'],
    tagNames: ['Sin azúcar', 'Gourmet'],
  },
  {
    title: 'Cereal inflado de arroz sin gluten',
    price: 15000,
    description:
      'Cereal crocante elaborado con arroz inflado, ligero y naturalmente libre de gluten. Ideal para desayunos, mezclas con yogur o como snack saludable. Textura suave, sabor neutro y perfecto para personas celíacas o quienes buscan alternativas más livianas.',
    slug: 'cereal-inflado-de-arroz-sin-gluten',
    stock: 5,
    isFeatured: true,
    categoryName: 'Desayunos y cereales',
    imageFileNames: ['cereal-inflado-de-arroz-sin-gluten-1763615763708-482.png'],
    tagNames: ['Desayuno', 'Snack saludable'],
  },
  {
    title: 'Michelob Ultra Sin Gluten',
    price: 5500,
    description:
      'Michelob Ultra Sin Gluten es una cerveza ligera, refrescante y baja en calorías, perteneciente al estilo American Lager. Se elabora con malta de cebada y lúpulo de alta calidad, pero utiliza una enzima en el proceso de producción para reducir el contenido de gluten. Su sabor es suave y su color es rubio característico.',
    slug: 'michelob-ultra-sin-gluten',
    stock: 24,
    isFeatured: true,
    categoryName: 'Bebidas sin gluten',
    imageFileNames: ['michelob-ultra-1763909020962-5112.png'],
    tagNames: [],
  },
  {
    title: 'Alfajorcitos tipo macaron sin gluten',
    price: 10000,
    description:
      'Delicados alfajorcitos estilo macaron, elaborados con harina de almendra y completamente libres de gluten. Rellenos con una suave crema sabor vainilla, tienen una textura crocante por fuera y suave por dentro. Ideales para acompañar el café, regalar o disfrutar en una merienda gourmet.',
    slug: 'alfajorcitos-tipo-macaron-sin-gluten',
    stock: 10,
    isFeatured: true,
    categoryName: 'Repostería sin gluten',
    imageFileNames: ['alfajorcitos-tipo-macaron-sin-gluten-1763616056107-5255.png'],
    tagNames: ['Gourmet', 'Sin lactosa'],
  },
  {
    title: 'Combo 15 % de descuento',
    price: 143000,
    description:
      'Pack con todos los productos disponibles: fideos de arroz, pan sin gluten de arroz, galletitas de maiz sin azucar, harina de arroz, harina de almendras, brownie sin gluten, cereal inflado de arroz, cerveza Michelob Ultra sin gluten y alfajorcitos tipo macaron. Ideal para probar toda la tienda con 15 % de ahorro.',
    slug: 'combo-15-descuento',
    stock: 5,
    isFeatured: true,
    categoryName: 'Snacks saludables',
    imageFileNames: [
      'fideos-de-arroz-sin-gluten-1763615492352-4692.png',
      'pan-sin-gluten-de-arroz-1763612629597-3833.png',
      'galletas-de-ma-a-z-sin-az-a-car-1763613460738-8537.png',
      'harina-de-arroz-1763613787009-8595.png',
      'harina-de-almendras-1763613983691-5588.png',
      'brownie-sin-gluten-1763614504178-847.png',
      'cereal-inflado-de-arroz-sin-gluten-1763615763708-482.png',
      'michelob-ultra-1763909020962-5112.png',
      'alfajorcitos-tipo-macaron-sin-gluten-1763616056107-5255.png',
    ],
    tagNames: [
      'Apto celiacos',
      'Vegano',
      'Sin lactosa',
      'Sin azúcar',
      'Alto en proteína',
      'Rico en fibra',
      'Snack saludable',
      'Listo para hornear',
      'Desayuno',
      'Gourmet',
    ],
  },
];

export const initialUsers: CreateUserDto[] = [
  {
    email: 'admin-egf@gmail.com',
    password: 'Admin@123.',
    fullName: 'Administrador',
    phone: '+595981000000',
    roles: ['Admin'],
  },
  {
    email: 'user-egf@gmail.com',
    password: 'User@123.',
    fullName: 'Usuario',
    phone: '+595981000001',
    roles: ['User'],
  },
];

export const initialRecipes: SeedRecipe[] = [
  {
    title: 'Ensalada Mediterránea sin gluten',
    text: `Lava y corta en mitades 200 g de tomates cherry y 1 pepino en rodajas finas. Añade 100 g de aceitunas negras, 80 g de queso feta en cubos y media cebolla morada en julianas. 
      Aliña con 3 cucharadas de aceite de oliva, el jugo de medio limón, sal y orégano seco al gusto. 
      Mezcla suavemente y sirve fresca. Es una receta ligera, rápida y naturalmente libre de gluten.`,
    ingredientNames: [
      'Tomate cherry',
      'Pepino',
      'Aceitunas negras',
      'Queso feta',
      'Cebolla morada',
      'Aceite de oliva',
      'Limón',
      'Sal',
      'Oregano seco',
    ],
  },
  {
    title: 'Pollo al horno con especias',
    text: `Coloca 4 pechugas de pollo en un recipiente y marínalas con 3 dientes de ajo picados, 1 cucharada de pimentón dulce, 1 cucharadita de comino, sal, pimienta, el jugo de 1 limón y 3 cucharadas de aceite de oliva. 
      Deja reposar al menos 30 minutos (idealmente 2 horas). 
      Precalienta el horno a 200°C y hornea durante 25-30 minutos, hasta que el pollo esté dorado por fuera y jugoso por dentro. 
      Se puede acompañar con vegetales asados o una ensalada fresca.`,
    ingredientNames: [
      'Pechuga de pollo',
      'Ajo',
      'Pimentón dulce',
      'Comino',
      'Sal',
      'Pimienta',
      'Limón',
      'Aceite de oliva',
    ],
  },
  {
    title: 'Brownies de harina de almendra',
    text: `Precalienta el horno a 180°C. En un bol, mezcla 1 taza de harina de almendra, 1/2 taza de cacao en polvo sin azúcar, 1/2 cucharadita de polvo de hornear y una pizca de sal. 
      En otro recipiente, bate 3 huevos con 1/2 taza de miel o sirope de agave y 1/3 taza de aceite de coco derretido. 
      Une ambas mezclas hasta obtener una masa homogénea y vierte en un molde engrasado. 
      Hornea durante 25 minutos. Deja enfriar antes de cortar en cuadrados. ¡Un postre esponjoso y sin gluten!`,
    ingredientNames: [
      'Harina de almendra',
      'Cacao en polvo',
      'Polvo de hornear',
      'Sal',
      'Huevos',
      'Miel',
      'Aceite de coco',
    ],
  },

  {
    title: 'Bowl de quinoa asada y vegetales',
    text: `Lava 1 taza de quinoa y cocinala en 2 tazas de agua con sal hasta que se vuelva esponjosa; deja reposar 5 minutos. Mezcla 150 g de calabaza, 2 zanahorias y 1 pimiento rojo en cubos con aceite de oliva, ajo picado, sal y pimienta. Asa los vegetales a 220 durante 25 minutos, combina con la quinoa y corona con hojas de espinaca y un chorrito de limón.`,
    ingredientNames: [
      'Quinoa',
      'Calabaza',
      'Zanahoria',
      'Pimiento rojo',
      'Aceite de oliva',
      'Ajo',
      'Sal',
      'Pimienta',
      'Espinaca',
      'Limón',
    ],
  },
  {
    title: 'Tostadas de aguacate y tomate',
    text: `Tuesta dos rebanadas de pan sin gluten. Unta cada una con aguacate machacado, cubre con tomates cherry laminados y termina con sal, pimienta y unas gotas de limón. Añade un hilo de aceite de oliva y semillas de chia para un extra de textura crujiente.`,
    ingredientNames: [
      'Pan sin gluten',
      'Aguacate',
      'Tomate cherry',
      'Aceite de oliva',
      'Sal',
      'Pimienta',
      'Limón',
      'Chia',
    ],
  },
  {
    title: 'Smoothie energético de frutos rojos',
    text: `Combina 1 taza de frutos rojos congelados con 1 banana, 250 ml de leche de almendras y 1 cucharada de miel. Licua hasta obtener una mezcla cremosa y agrega 1 cucharadita de chia. Sirve frío con más frutos rojos si quieres un extra de color.`,
    ingredientNames: [
      'Frutos rojos',
      'Banana',
      'Leche de almendras',
      'Miel',
      'Chia',
    ],
  },
  {
    title: 'Sopa cremosa de calabaza y coco',
    text: `Saltea media cebolla morada y 2 dientes de ajo en aceite de coco. Añade 400 g de calabaza picada, cubre con caldo de verduras y cocina 20 minutos. Licua con 200 ml de leche de almendras, ajusta sal y pimienta y sirve con un chorrito extra de aceite de coco.`,
    ingredientNames: [
      'Cebolla morada',
      'Ajo',
      'Calabaza',
      'Aceite de coco',
      'Caldo de verduras',
      'Leche de almendras',
      'Sal',
      'Pimienta',
    ],
  },
  {
    title: 'Muffins de avena, manzana y canela',
    text: `Mezcla 1 taza de avena molida con 1 cucharadita de canela, 1 cucharadita de polvo de hornear y una pizca de sal. Bate 2 huevos con 1/4 taza de miel, 1/4 taza de aceite de coco y 1 manzana rallada. Integra las preparaciones, hornea a 180 C por 20 minutos y deja enfriar antes de servir.`,
    ingredientNames: [
      'Avena',
      'Manzana',
      'Canela',
      'Polvo de hornear',
      'Sal',
      'Huevos',
      'Miel',
      'Aceite de coco',
    ],
  },
  {
    title: 'Crema de garbanzos y espinacas',
    text: `Procesa 400 g de garbanzos cocidos con 1 taza de espinaca, 1 diente de ajo, 2 cucharadas de aceite de oliva y el jugo de 1 limón. Tritura hasta obtener un dip suave, ajusta con sal y pimienta y sirve con más aceite de oliva por encima.`,
    ingredientNames: [
      'Garbanzos',
      'Espinaca',
      'Ajo',
      'Aceite de oliva',
      'Limón',
      'Sal',
      'Pimienta',
    ],
  },
  {
    title: 'Crumble de peras y nueces',
    text: `Mezcla 3 peras cortadas en cubos con 1 cucharada de miel, canela y unas gotas de limón. En otra fuente combina 1 taza de harina de almendra, 1/2 taza de nueces picadas y 2 cucharadas de aceite de coco. Cubre las peras y hornea a 180 C por 25 minutos hasta que la capa está dorada.`,
    ingredientNames: [
      'Peras',
      'Harina de almendra',
      'Nueces',
      'Canela',
      'Aceite de coco',
      'Miel',
      'Limón',
    ],
  },

];

export const initialContacts: CreateContactDto[] = [
  {
    title: 'Administrador',
    phone: '+595981012345',
    email: 'administrador@glutenfree.com',
  },
  {
    title: 'Atención al cliente',
    phone: '+595981012345',
    email: 'atc@glutenfree.com',
  },
  {
    title: 'Delivery',
    phone: '+595981012345',
    email: 'delivery@glutenfree.com',
  },
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
  },
];

export const initialIngredients: CreateIngredientDto[] = [
  { name: 'Aceite de coco' },
  { name: 'Aceite de oliva' },
  { name: 'Aceitunas negras' },
  { name: 'Ajo' },
  { name: 'Cacao en polvo' },
  { name: 'Cebolla morada' },
  { name: 'Comino' },
  { name: 'Harina de almendra' },
  { name: 'Huevos' },
  { name: 'Limón' },
  { name: 'Miel' },
  { name: 'Oregano seco' },
  { name: 'Pimienta' },
  { name: 'Pechuga de pollo' },
  { name: 'Pepino' },
  { name: 'Pimentón dulce' },
  { name: 'Polvo de hornear' },
  { name: 'Queso feta' },
  { name: 'Sal' },
  { name: 'Tomate cherry' },
  { name: 'Pan sin gluten' },
  { name: 'Aguacate' },
  { name: 'Quinoa' },
  { name: 'Calabaza' },
  { name: 'Zanahoria' },
  { name: 'Pimiento rojo' },
  { name: 'Chia' },
  { name: 'Frutos rojos' },
  { name: 'Banana' },
  { name: 'Leche de almendras' },
  { name: 'Caldo de verduras' },
  { name: 'Espinaca' },
  { name: 'Garbanzos' },
  { name: 'Avena' },
  { name: 'Manzana' },
  { name: 'Canela' },
  { name: 'Peras' },
  { name: 'Nueces' },
];


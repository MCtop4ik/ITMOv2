export type Product = {
  id: string
  name: string
  nameRu?: string
  price: number
  currency: 'EUR' | 'USD' | 'GBP'
  description?: string
  descriptionRu?: string
  image?: string
  category?: 'sweet' | 'savory' | 'seasonal'
  tags?: string[]
  allergens?: string[]
}

// Seasonal & trend menu (LTO)
const products: Product[] = [
  {
    id: 'pumpkin-spice',
    name: 'Pumpkin Spice',
    nameRu: 'Тыквенный',
    price: 5.40,
    currency: 'EUR',
    description: 'Spiced pumpkin crème, cinnamon finish; cozy autumn layers.',
    descriptionRu: 'Крем из тыквы с пряностями, коричный финиш; уютные осенние слои.',
    image: '/images/croissant-pumpkin-spice.png',
    category: 'seasonal',
    tags: ['sweet', 'autumn'],
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 'cube',
    name: 'Cube Croissant',
    nameRu: 'Круассан-куб',
    price: 5.90,
    currency: 'EUR',
    description: 'Geometric laminated cube, filled with vanilla or matcha crème.',
    descriptionRu: 'Геометрический ламинированный куб, начинка ванильным или матча-кремом.',
    image: '/images/croissant-cube.png',
    category: 'sweet',
    tags: ['signature'],
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 'supreme',
    name: 'Supreme Roll',
    nameRu: 'Ролл «Суприм»',
    price: 6.20,
    currency: 'EUR',
    description: 'NY-style spiral roll with glossy cream and crisp layers.',
    descriptionRu: 'Нью-йоркский спиральный рулет с глянцевым кремом и хрустящими слоями.',
    image: '/images/croissant-supreme.png',
    category: 'sweet',
    tags: ['trend'],
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 'flat-smashed',
    name: 'Flat Smashed',
    nameRu: 'Плоский',
    price: 4.90,
    currency: 'EUR',
    description: 'Pressed, caramelized croissant; extra crunch, dip in chocolate.',
    descriptionRu: 'Прессованный, карамелизированный круассан; дополнительная хрусткость, окунуть в шоколад.',
    image: '/images/croissant-flat-smashed.png',
    category: 'sweet',
    tags: ['crunchy'],
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: 'mushroom-brie',
    name: 'Mushroom & Brie',
    nameRu: 'Грибы и бри',
    price: 6.00,
    currency: 'EUR',
    description: 'Warm sandwich: sautéed mushrooms, Brie, thyme, a cranberry hint.',
    descriptionRu: 'Тёплый сэндвич: обжаренные грибы, бри, тимьян и нотка клюквы.',
    image: '/images/croissant-mushroom-brie.png',
    category: 'savory',
    tags: ['warm', 'sandwich'],
    allergens: ['gluten', 'dairy'],
  },
  {
    id: 'capre-pesto',
    name: 'Caprese Pesto',
    nameRu: 'Капрезе песто',
    price: 6.10,
    currency: 'EUR',
    description: 'Tomato, mozzarella, basil pesto in a savory croissant.',
    descriptionRu: 'Томат, моцарелла, базиликовый песто в сытном круассане.',
    image: '/images/croissant-caprese-pesto.png',
    category: 'savory',
    tags: ['savory'],
    allergens: ['gluten', 'dairy', 'nuts'],
  },
  {
    id: 'maple-pecan',
    name: 'Maple Pecan',
    nameRu: 'Кленовый пекан',
    price: 5.80,
    currency: 'EUR',
    description: 'Maple glaze with toasted pecans for a sweet, nutty finish.',
    descriptionRu: 'Кленовая глазурь и поджаренный пекан для сладкого орехового послевкусия.',
    image: '/images/croissant-maple-pecan.png',
    category: 'sweet',
    tags: ['sweet'],
    allergens: ['gluten', 'dairy', 'nuts'],
  },
  {
    id: 'salmon-avocado',
    name: 'Salmon & Avocado',
    nameRu: 'Лосось и авокадо',
    price: 6.50,
    currency: 'EUR',
    description: 'Smoked salmon, avocado, lemon-dill crème in a savory croissant.',
    descriptionRu: 'Копчёный лосось, авокадо, крем с лимоном и укропом в сытном круассане.',
    image: '/images/croissant-salmon-avocado.png',
    category: 'savory',
    tags: ['savory'],
    allergens: ['gluten', 'fish', 'dairy'],
  },
]

export default products

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import User from '../models/User.js';
// import Product from '../models/Product.js';
// import Cart from '../models/Cart.js';
// import Order from '../models/Order.js';

// // Setup environment variables
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const MONGO_URI =
//   process.env.MONGO_URI ||
//   'mongodb://admin:password123@mongodb:27017/cloudcart?authSource=admin';

// const seedDatabase = async () => {
//   try {
//     console.log('[Seed] Connecting to MongoDB...');
//     await mongoose.connect(MONGO_URI);
//     console.log('[Seed] Connected to MongoDB');

//     // 1. Clear existing collections
//     console.log('[Seed] Clearing existing database collections...');
//     await Promise.all([
//       User.deleteMany({}),
//       Product.deleteMany({}),
//       Cart.deleteMany({}),
//       Order.deleteMany({})
//     ]);
//     console.log('[Seed] Cleared collections: Users, Products, Carts, Orders');

//     // 2. Hash passwords for seed users
//     const salt = await bcrypt.genSalt(10);
//     const adminHashedPassword = await bcrypt.hash('admin123', salt);
//     const userHashedPassword = await bcrypt.hash('user123', salt);

//     // 3. Create initial users
//     console.log('[Seed] Creating initial users...');
//     const users = await User.create([
//       {
//         name: 'Admin CloudCart',
//         email: 'admin@cloudcart.com',
//         password: adminHashedPassword,
//         role: 'admin',
//         address: {
//           street: '100 Innovation Way',
//           city: 'San Francisco',
//           state: 'CA',
//           zipCode: '94105',
//           country: 'United States'
//         }
//       },
//       {
//         name: 'Jane Customer',
//         email: 'user@cloudcart.com',
//         password: userHashedPassword,
//         role: 'user',
//         address: {
//           street: '456 Market St',
//           city: 'Seattle',
//           state: 'WA',
//           zipCode: '98101',
//           country: 'United States'
//         }
//       }
//     ]);
//     console.log(`[Seed] Created ${users.length} users (1 Admin, 1 Regular user)`);

//     // 4. Seed 50 dummy products for each of the 8 categories

// // 4. Seed 50 products for each of the 8 categories

// const CATEGORIES = [
//   'Electronics',
//   'Clothing',
//   'Books',
//   'Home & Kitchen',
//   'Sports',
//   'Beauty',
//   'Toys',
//   'Grocery'
// ];

// const randomNumber = (min, max, decimals = 0) => {
//   const factor = Math.pow(10, decimals);

//   return Math.round(
//     Math.random() * (max - min) * factor + min * factor
//   ) / factor;
// };

// const seedProducts = [];

// CATEGORIES.forEach((category, categoryIndex) => {
//   for (let i = 0; i < 50; i++) {

//     // Unique, deterministic image for each product
//     const imageSeed = `cloudcart-${categoryIndex}-${i + 1}`;

//     const product = {
//       name: `${category} Item ${i + 1}`,

//       description: `Premium quality ${category.toLowerCase()} product with excellent features and value.`,

//       price: randomNumber(5, 500, 2),

//       category,

//       imageUrl: `https://picsum.photos/seed/${imageSeed}/600/600`,

//       stock: randomNumber(0, 200),

//       rating: randomNumber(3, 5, 1),

//       numReviews: randomNumber(0, 200),

//       featured: Math.random() < 0.2
//     };

//     seedProducts.push(product);
//   }
// });

// console.log(`[Seed] Generated ${seedProducts.length} products`);

// // IMPORTANT: Store inserted products for sample cart creation
// const createdProducts = await Product.insertMany(seedProducts);

// console.log(
//   `[Seed] Successfully inserted ${createdProducts.length} products`
// );


// /* Removed static seed data
//       {
//         name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
//         description:
//           'Industry-leading noise canceling with two processors and 8 microphones. Magnificent sound engineered to perfection with the new Integrated Processor V1.',
//         price: 399.99,
//         category: 'Electronics',
//         imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
//         stock: 35,
//         rating: 4.8,
//         numReviews: 124,
//         featured: true
//       },
//       {
//         name: 'Apple iPad Air 11-inch M2 Chip 128GB',
//         description:
//           'Supercharged by the Apple M2 chip. Stunning Liquid Retina display with True Tone, P3 wide color, and ultralow reflectivity.',
//         price: 599.0,
//         category: 'Electronics',
//         imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
//         stock: 20,
//         rating: 4.9,
//         numReviews: 89,
//         featured: true
//       },
//       {
//         name: 'Logitech MX Master 3S Wireless Performance Mouse',
//         description:
//           'Quiet clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling, and ergonomic design for supreme precision and comfort.',
//         price: 99.99,
//         category: 'Electronics',
//         imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
//         stock: 50,
//         rating: 4.7,
//         numReviews: 215,
//         featured: false
//       },

//       // Category 2: Clothing
//       {
//         name: 'Classic Vintage Denim Sherpa Trucker Jacket',
//         description:
//           'A timeless staple built from heavyweight 100% cotton denim with soft sherpa lining on body and collar for enduring warmth.',
//         price: 89.5,
//         category: 'Clothing',
//         imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
//         stock: 40,
//         rating: 4.6,
//         numReviews: 76,
//         featured: true
//       },
//       {
//         name: 'Organic Combed Cotton Crewneck T-Shirt',
//         description:
//           'Ultra-soft premium heavyweight organic cotton crewneck tee. Pre-shrunk for the ideal tailored drape and everyday durability.',
//         price: 28.0,
//         category: 'Clothing',
//         imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
//         stock: 120,
//         rating: 4.5,
//         numReviews: 48,
//         featured: false
//       },
//       {
//         name: 'Slim-Fit Stretch Chino Trousers',
//         description:
//           'Versatile stretch cotton twill chinos designed with a comfortable modern tapered leg, ideal for both casual and smart occasions.',
//         price: 54.99,
//         category: 'Clothing',
//         imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80',
//         stock: 65,
//         rating: 4.4,
//         numReviews: 35,
//         featured: false
//       },

//       // Category 3: Books
//       {
//         name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
//         description:
//           'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Master software craftsmanship with Robert C. Martin.',
//         price: 44.95,
//         category: 'Books',
//         imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=500&q=80',
//         stock: 45,
//         rating: 4.9,
//         numReviews: 310,
//         featured: true
//       },
//       {
//         name: 'Designing Data-Intensive Applications by Martin Kleppmann',
//         description:
//           'The definitive guide to the architecture, storage engines, distributed consensus, and replication patterns behind reliable and scalable systems.',
//         price: 52.99,
//         category: 'Books',
//         imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
//         stock: 30,
//         rating: 5.0,
//         numReviews: 198,
//         featured: true
//       },
//       {
//         name: 'Atomic Habits by James Clear',
//         description:
//           'No matter your goals, Atomic Habits offers a proven framework for improving every day from world-renowned habits expert James Clear.',
//         price: 21.99,
//         category: 'Books',
//         imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
//         stock: 80,
//         rating: 4.9,
//         numReviews: 540,
//         featured: false
//       },

//       // Category 4: Home & Kitchen
//       {
//         name: 'Nespresso Vertuo Next Coffee and Espresso Machine',
//         description:
//           'Centrifusion technology brews delicious coffee with a rich natural crema at the touch of a button. Reads barcode on capsule for optimal cup results.',
//         price: 169.95,
//         category: 'Home & Kitchen',
//         imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80',
//         stock: 25,
//         rating: 4.7,
//         numReviews: 142,
//         featured: true
//       },
//       {
//         name: 'Enameled Cast Iron Dutch Oven 6-Quart',
//         description:
//           'Cast iron core delivers superior heat retention and even cooking. Vibrant enamel finish resists chipping and cleans effortlessly.',
//         price: 79.99,
//         category: 'Home & Kitchen',
//         imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80',
//         stock: 35,
//         rating: 4.8,
//         numReviews: 95,
//         featured: false
//       },
//       {
//         name: 'Smart 8-in-1 Digital Air Fryer XL 5.8 Qt',
//         description:
//           'Rapid 360-degree hot air circulation gives fried flavor with up to 85% less oil. Includes 8 one-touch cooking presets and dishwasher safe basket.',
//         price: 119.99,
//         category: 'Home & Kitchen',
//         imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80',
//         stock: 40,
//         rating: 4.6,
//         numReviews: 83,
//         featured: false
//       },

//       // Category 5: Sports
//       {
//         name: 'Adjustable Quick-Select Dumbbell Pair 50 lbs',
//         description:
//           'Rapid weight selector dial allows adjusting from 5 to 50 lbs per dumbbell in 5-lb increments. Replaces 10 pairs of traditional dumbbells.',
//         price: 249.99,
//         category: 'Sports',
//         imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80',
//         stock: 18,
//         rating: 4.8,
//         numReviews: 64,
//         featured: true
//       },
//       {
//         name: 'Pro Non-Slip Yoga Mat with Laser Alignment System',
//         description:
//           'High-density eco-friendly natural tree rubber with non-slip polyurethane top coat provides unparalleled grip even during intense hot yoga.',
//         price: 49.95,
//         category: 'Sports',
//         imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
//         stock: 55,
//         rating: 4.7,
//         numReviews: 42,
//         featured: false
//       },
//       {
//         name: 'Hydro Flask 32 oz Wide Mouth Vacuum Insulated Bottle',
//         description:
//           'TempShield double-wall vacuum insulation keeps beverages cold up to 24 hours or piping hot up to 12 hours. Pro-grade 18/8 stainless steel.',
//         price: 44.95,
//         category: 'Sports',
//         imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
//         stock: 90,
//         rating: 4.9,
//         numReviews: 110,
//         featured: false
//       },

//       // Category 6: Beauty
//       {
//         name: 'Hyaluronic Acid Hydrating Face Plumping Serum 50ml',
//         description:
//           'Formulated with multi-molecular weight hyaluronic acid and Vitamin B5 to deeply replenish moisture and visibly plump fine lines.',
//         price: 29.5,
//         category: 'Beauty',
//         imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
//         stock: 75,
//         rating: 4.8,
//         numReviews: 153,
//         featured: true
//       },
//       {
//         name: 'Vitamin C + E Antioxidant Daily Glow Moisturizer',
//         description:
//           'A brightening daily cream packed with stable 15% Vitamin C, ferulic acid, and squalane to restore radiance and defend against environmental stressors.',
//         price: 36.0,
//         category: 'Beauty',
//         imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80',
//         stock: 60,
//         rating: 4.6,
//         numReviews: 87,
//         featured: false
//       },
//       {
//         name: 'Natural Rose Quartz Facial Roller & Gua Sha Sculpting Set',
//         description:
//           '100% authentic mined Brazilian rose quartz stone tools designed to reduce facial puffiness, stimulate lymph drainage, and relieve muscle tension.',
//         price: 22.99,
//         category: 'Beauty',
//         imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80',
//         stock: 85,
//         rating: 4.5,
//         numReviews: 73,
//         featured: false
//       },

//       // Category 7: Toys
//       {
//         name: 'LEGO Creator Expert NASA Apollo Saturn V Rocket Set',
//         description:
//           '1,969-piece authentic meter-high replica of the iconic Apollo Saturn V with removable rocket stages and lunar lander module.',
//         price: 119.99,
//         category: 'Toys',
//         imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&q=80',
//         stock: 22,
//         rating: 4.9,
//         numReviews: 180,
//         featured: true
//       },
//       {
//         name: 'Magnetic Tiles Building Blocks 100-Piece Deluxe Set',
//         description:
//           'STEM-approved translucent geometric magnetic construction tiles for developing motor skills, 3D spatial thinking, and creative imaginative play.',
//         price: 49.99,
//         category: 'Toys',
//         imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80',
//         stock: 50,
//         rating: 4.7,
//         numReviews: 92,
//         featured: false
//       },
//       {
//         name: 'Remote Controlled 4WD High-Speed Monster Truck 1:16',
//         description:
//           'Equipped with 390 high-speed motor achieving speeds up to 36 km/h. All-terrain rubber shock-absorbing tires and 2.4GHz proportional control.',
//         price: 59.95,
//         category: 'Toys',
//         imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&q=80',
//         stock: 35,
//         rating: 4.6,
//         numReviews: 61,
//         featured: false
//       },

//       // Category 8: Grocery
//       {
//         name: 'Pure Raw New Zealand Manuka Honey MGO 400+ 250g',
//         description:
//           'Certified non-GMO raw monofloral Manuka honey harvested sustainably from native forests in New Zealand. Rich in natural bioactive compounds.',
//         price: 38.5,
//         category: 'Grocery',
//         imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80',
//         stock: 45,
//         rating: 4.9,
//         numReviews: 114,
//         featured: true
//       },
//       {
//         name: 'Artisanal Organic Ethiopian Yirgacheffe Whole Bean Coffee 12oz',
//         description:
//           'Single-origin fair trade light roast boasting delicate floral jasmine aromas and bright bergamot and lemon citrus tasting notes.',
//         price: 18.99,
//         category: 'Grocery',
//         imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
//         stock: 70,
//         rating: 4.8,
//         numReviews: 88,
//         featured: false
//       },
//       {
//         name: 'Cold-Pressed Extra Virgin Olive Oil 1 Liter Estate Bottled',
//         description:
//           'First cold-pressed single estate Koroneiki olives from southern Greece. Acidity below 0.3% with vibrant grassy and peppery finish.',
//         price: 24.95,
//         category: 'Grocery',
//         imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80',
//         stock: 80,
//         rating: 4.7,
//         numReviews: 65,
//         featured: false
//       }
//     ];

//     console.log('[Seed] Seeding products...');
//     const createdProducts = await Product.insertMany(seedProducts);
//     console.log(`[Seed] Seeded ${createdProducts.length} products across 8 categories`);
// */

//     // 5. Seed a sample cart for the regular user
//     console.log('[Seed] Seeding sample cart for regular user...');
//     await Cart.create({
//       user: users[1]._id,
//       items: [
//         {
//           product: createdProducts[0]._id,
//           quantity: 1
//         },
//         {
//           product: createdProducts[6]._id,
//           quantity: 2
//         }
//       ]
//     });
//     console.log('[Seed] Seeded sample cart');

//     console.log('----------------------------------------------------');
//     console.log('[Seed] Database seeding completed successfully!');
//     console.log('Credentials:');
//     console.log('  Admin User  : admin@cloudcart.com / admin123');
//     console.log('  Regular User: user@cloudcart.com / user123');
//     console.log('----------------------------------------------------');

//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (error) {
//     console.error(`[Seed Error] Seeding failed: ${error.message}`);
//     console.error(error.stack);
//     await mongoose.disconnect();
//     process.exit(1);
//   }
// };

// seedDatabase();







import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://admin:password123@mongodb:27017/cloudcart?authSource=admin';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Grocery'
];

/*
  10 relevant images per category.
  These are direct Unsplash CDN image URLs.
*/
const CATEGORY_IMAGES = {
  Electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80'
  ],
  Clothing: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80'
  ],
  Books: [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=900&q=80'
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80'
  ],
  Sports: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80'
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'
  ],
  Toys: [
    'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=80'
  ],
  Grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80'
  ]
};

const PRODUCT_TEMPLATES = {
  Electronics: [
    'Wireless Noise-Canceling Headphones',
    'Smart Fitness Watch',
    'Portable Bluetooth Speaker',
    '4K Action Camera',
    'Mechanical Gaming Keyboard',
    'Fast Wireless Charging Pad',
    'Ultra-Slim Laptop Stand',
    'Noise-Isolating Earbuds',
    'Smart Home Security Camera',
    'USB-C Multiport Hub'
  ],
  Clothing: [
    'Classic Denim Jacket',
    'Premium Cotton T-Shirt',
    'Slim-Fit Chino Trousers',
    'Cozy Knit Sweater',
    'Water-Resistant Windbreaker',
    'Everyday Casual Sneakers',
    'Linen Summer Shirt',
    'Leather Crossbody Bag',
    'Merino Wool Beanie',
    'Tailored Blazer'
  ],
  Books: [
    'The Art of Clear Thinking',
    'Modern Web Development Guide',
    'Designing Scalable Systems',
    'Mindful Productivity Handbook',
    'Classic Adventure Novel',
    'Beginner’s Cooking Cookbook',
    'History of Ancient Civilizations',
    'Creative Photography Essentials',
    'Personal Finance Made Simple',
    'Science Fiction Anthology'
  ],
  'Home & Kitchen': [
    'Enameled Cast Iron Dutch Oven',
    'Digital Air Fryer',
    'Espresso Coffee Machine',
    'Modern Ceramic Dinner Set',
    'Scandinavian Table Lamp',
    'Memory Foam Pillow Set',
    'Stainless Steel Cookware Set',
    'Compact Robot Vacuum',
    'Aromatherapy Diffuser',
    'Marble Kitchen Organizer'
  ],
  Sports: [
    'Adjustable Dumbbell Set',
    'Non-Slip Yoga Mat',
    'Insulated Water Bottle',
    'Resistance Bands Kit',
    'Running Shoes',
    'Foam Roller for Recovery',
    'Jump Rope',
    'Cycling Helmet',
    'Camping Backpack',
    'Basketball'
  ],
  Beauty: [
    'Hyaluronic Acid Serum',
    'Vitamin C Moisturizer',
    'Rose Quartz Facial Roller',
    'Matte Liquid Lipstick',
    'Silk Pillowcase',
    'Charcoal Face Mask',
    'Hair Repair Oil',
    'Broad-Spectrum Sunscreen',
    'Makeup Brush Set',
    'Perfume Eau de Parfum'
  ],
  Toys: [
    'STEM Building Blocks Set',
    'Remote Control Monster Truck',
    'Wooden Puzzle Set',
    'Plush Teddy Bear',
    'Art & Craft Kit',
    'Board Game for Families',
    'Toy Kitchen Playset',
    'Dinosaur Figure Collection',
    'RC Racing Car',
    'Educational Robot Kit'
  ],
  Grocery: [
    'Organic Arabica Coffee Beans',
    'Extra Virgin Olive Oil',
    'Raw Wildflower Honey',
    'Dark Chocolate Bar',
    'Mixed Nuts Gift Tin',
    'Green Tea Bags',
    'Granola Breakfast Cereal',
    'Pasta Gift Set',
    'Dried Fruit Mix',
    'Spice Starter Kit'
  ]
};

const randomNumber = (min, max, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return (
    Math.round(Math.random() * (max - min) * factor + min * factor) /
    factor
  );
};

const buildProducts = () => {
  const products = [];

  CATEGORIES.forEach((category, categoryIndex) => {
    const names = PRODUCT_TEMPLATES[category];
    const images = CATEGORY_IMAGES[category];

    for (let i = 0; i < 10; i++) {
      products.push({
        name: names[i],
        description: `Premium ${category.toLowerCase()} product: ${names[i]}. Carefully selected for quality, everyday usability, and excellent value.`,
        price: randomNumber(5, 500, 2),
        category,
        imageUrl: images[i],
        stock: randomNumber(10, 200),
        rating: randomNumber(3.5, 5, 1),
        numReviews: randomNumber(5, 250),
        featured: i < 2
      });
    }
  });

  return products;
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({})
    ]);
    console.log('[Seed] Cleared Users, Products, Carts, and Orders');

    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('admin123', salt);
    const userHashedPassword = await bcrypt.hash('user123', salt);

    console.log('[Seed] Creating users...');
    const users = await User.create([
      {
        name: 'Admin CloudCart',
        email: 'admin@cloudcart.com',
        password: adminHashedPassword,
        role: 'admin',
        address: {
          street: '100 Innovation Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States'
        }
      },
      {
        name: 'Jane Customer',
        email: 'user@cloudcart.com',
        password: userHashedPassword,
        role: 'user',
        address: {
          street: '456 Market St',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'United States'
        }
      }
    ]);

    console.log(`[Seed] Created ${users.length} users`);

    const seedProducts = buildProducts();
    console.log(`[Seed] Generated ${seedProducts.length} products`);

    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`[Seed] Inserted ${createdProducts.length} products`);

    console.log('[Seed] Creating sample cart...');
    await Cart.create({
      user: users[1]._id,
      items: [
        {
          product: createdProducts[0]._id,
          quantity: 1
        },
        {
          product: createdProducts[10]._id,
          quantity: 2
        }
      ]
    });

    console.log('----------------------------------------------------');
    console.log('[Seed] Database seeding completed successfully!');
    console.log('[Seed] 8 categories, 10 products each, 80 total products');
    console.log('Credentials:');
    console.log('  Admin: admin@cloudcart.com / admin123');
    console.log('  User:  user@cloudcart.com / user123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    console.error(error.stack);

    try {
      await mongoose.disconnect();
    } catch (_) {}

    process.exit(1);
  }
};

seedDatabase();
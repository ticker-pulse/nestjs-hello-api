const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (respecting foreign key constraints)
  await prisma.userFavorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0101',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1-555-0102',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '+1-555-0103',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        phone: '+1-555-0104',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Robert Brown',
        email: 'robert@example.com',
        phone: '+1-555-0105',
        isActive: false,
      },
    }),
  ]);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        description: 'High-performance laptop for developers and designers',
        price: '2499.99',
        stock: 12,
        sku: 'LAPTOP-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dell XPS 13',
        description: 'Ultra-portable laptop with stunning display',
        price: '1299.99',
        stock: 18,
        sku: 'LAPTOP-002',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Logitech MX Master 3S',
        description: 'Advanced wireless mouse with precision scrolling',
        price: '99.99',
        stock: 45,
        sku: 'MOUSE-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connection',
        price: '49.99',
        stock: 60,
        sku: 'MOUSE-002',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard - RGB',
        description: 'Premium RGB mechanical keyboard with blue switches',
        price: '149.99',
        stock: 25,
        sku: 'KEYBOARD-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Keychron K2 Pro',
        description: 'Wireless mechanical keyboard with hot-swap switches',
        price: '99.99',
        stock: 35,
        sku: 'KEYBOARD-002',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: '4K Monitor',
        description: '27" 4K IPS monitor for professional work',
        price: '399.99',
        stock: 8,
        sku: 'MONITOR-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub',
        description: 'Multi-port USB-C hub with HDMI and card reader',
        price: '79.99',
        stock: 52,
        sku: 'HUB-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Noise-Cancelling Headphones',
        description: 'Premium wireless headphones with active noise cancellation',
        price: '349.99',
        stock: 22,
        sku: 'AUDIO-001',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam 4K',
        description: '4K ultra HD webcam for streaming and video calls',
        price: '129.99',
        stock: 30,
        sku: 'CAMERA-001',
        isActive: true,
      },
    }),
  ]);

  // Create user favorites
  await Promise.all([
    // John's favorites
    prisma.userFavorite.create({
      data: {
        userId: users[0].id,
        productId: products[0].id,
        notes: 'Need this for work',
      },
    }),
    prisma.userFavorite.create({
      data: {
        userId: users[0].id,
        productId: products[2].id,
        notes: 'Upgrade from current mouse',
      },
    }),
    // Jane's favorites
    prisma.userFavorite.create({
      data: {
        userId: users[1].id,
        productId: products[1].id,
        notes: 'Considering for next laptop',
      },
    }),
    prisma.userFavorite.create({
      data: {
        userId: users[1].id,
        productId: products[4].id,
      },
    }),
    prisma.userFavorite.create({
      data: {
        userId: users[1].id,
        productId: products[8].id,
        notes: 'For Zoom calls',
      },
    }),
    // Michael's favorites
    prisma.userFavorite.create({
      data: {
        userId: users[2].id,
        productId: products[6].id,
        notes: 'Perfect for dual monitor setup',
      },
    }),
    prisma.userFavorite.create({
      data: {
        userId: users[2].id,
        productId: products[7].id,
      },
    }),
    // Sarah's favorites
    prisma.userFavorite.create({
      data: {
        userId: users[3].id,
        productId: products[5].id,
        notes: 'Great reviews online',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`✓ Created ${users.length} users`);
  console.log(`✓ Created ${products.length} products`);
  console.log(`✓ Created 8 user favorites`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

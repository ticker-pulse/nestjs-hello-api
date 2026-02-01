const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      isActive: true,
    },
  });

  // Create products
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop',
      description: 'High-performance laptop for developers',
      price: '1299.99',
      stock: 15,
      sku: 'LAPTOP-001',
      isActive: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: '49.99',
      stock: 50,
      sku: 'MOUSE-001',
      isActive: true,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: '149.99',
      stock: 30,
      sku: 'KEYBOARD-001',
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${2} users and ${3} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

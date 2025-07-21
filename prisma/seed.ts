import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autopaint.com' },
    update: {},
    create: {
      email: 'admin@autopaint.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create employee user
  const empPassword = await bcrypt.hash('emp123', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@autopaint.com' },
    update: {},
    create: {
      email: 'employee@autopaint.com',
      name: 'John Smith',
      password: empPassword,
      role: 'EMPLOYEE',
    },
  });

  // Create sample products
  const products = [
    {
      name: 'Premium Base Coat',
      color: 'White',
      brand: 'AutoPro',
      size: '1 Gallon',
      price: 89.99,
      stockQty: 15,
      category: 'Base Coats',
      description: 'High-quality white base coat for automotive painting',
    },
    {
      name: 'Metallic Clear Coat',
      color: 'Clear',
      brand: 'ProFinish',
      size: '1 Quart',
      price: 45.5,
      stockQty: 25,
      category: 'Clear Coats',
      description: 'Professional clear coat with UV protection',
    },
    {
      name: 'Racing Red Paint',
      color: 'Red',
      brand: 'SpeedCoat',
      size: '1 Gallon',
      price: 125.0,
      stockQty: 8,
      category: 'Color Coats',
      description: 'Vibrant racing red automotive paint',
    },
    {
      name: 'Midnight Black',
      color: 'Black',
      brand: 'AutoPro',
      size: '1 Gallon',
      price: 95.75,
      stockQty: 12,
      category: 'Color Coats',
      description: 'Deep midnight black finish paint',
    },
    {
      name: 'Primer Sealer',
      color: 'Gray',
      brand: 'BaseMax',
      size: '1 Quart',
      price: 32.99,
      stockQty: 20,
      category: 'Primers',
      description: 'High-build primer sealer for smooth finish',
    },
    {
      name: 'Pearl White',
      color: 'Pearl White',
      brand: 'LuxuryCoat',
      size: '1 Gallon',
      price: 155.0,
      stockQty: 6,
      category: 'Color Coats',
      description: 'Elegant pearl white with subtle shimmer',
    },
    {
      name: 'Thinner Solution',
      color: 'Clear',
      brand: 'ChemPro',
      size: '1 Gallon',
      price: 28.5,
      stockQty: 30,
      category: 'Thinners',
      description: 'Professional paint thinner for automotive use',
    },
    {
      name: 'Metal Prep',
      color: 'Clear',
      brand: 'RustGuard',
      size: '1 Quart',
      price: 24.99,
      stockQty: 18,
      category: 'Prep Materials',
      description: 'Metal preparation solution for optimal adhesion',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        name: product.name,
      },
      update: {},
      create: product,
    });
  }

  console.log('Database has been seeded!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

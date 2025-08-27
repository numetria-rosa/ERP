import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.project.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'admin' } }),
    prisma.role.create({ data: { name: 'manager' } }),
    prisma.role.create({ data: { name: 'employee' } })
  ]);

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering' } }),
    prisma.department.create({ data: { name: 'Sales' } }),
    prisma.department.create({ data: { name: 'Marketing' } }),
    prisma.department.create({ data: { name: 'HR' } }),
    prisma.department.create({ data: { name: 'Finance' } }),
    prisma.department.create({ data: { name: 'Operations' } })
  ]);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0101',
        position: 'Senior Software Engineer',
        role: 'Developer',
        salary: 85000,
        status: 'active',
        hireDate: new Date('2023-01-15'),
        departmentId: departments[0].id
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-0102',
        position: 'Sales Manager',
        role: 'Manager',
        salary: 75000,
        status: 'active',
        hireDate: new Date('2023-02-20'),
        departmentId: departments[1].id
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1-555-0103',
        position: 'Marketing Specialist',
        role: 'Specialist',
        salary: 65000,
        status: 'active',
        hireDate: new Date('2023-03-10'),
        departmentId: departments[2].id
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1-555-0104',
        position: 'HR Coordinator',
        role: 'Coordinator',
        salary: 55000,
        status: 'active',
        hireDate: new Date('2023-04-05'),
        departmentId: departments[3].id
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        phone: '+1-555-0105',
        position: 'Financial Analyst',
        role: 'Analyst',
        salary: 70000,
        status: 'active',
        hireDate: new Date('2023-05-12'),
        departmentId: departments[4].id
      }
    })
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        phone: '+1-555-0201',
        status: 'active'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Global Industries',
        email: 'info@globalind.com',
        phone: '+1-555-0202',
        status: 'active'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'StartupXYZ',
        email: 'hello@startupxyz.com',
        phone: '+1-555-0203',
        status: 'active'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Enterprise Systems',
        email: 'sales@enterprisesys.com',
        phone: '+1-555-0204',
        status: 'active'
      }
    })
  ]);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro X1',
        description: 'High-performance business laptop',
        price: 1299.99,
        category: 'Electronics',
        sku: 'LAP-001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 49.99,
        category: 'Accessories',
        sku: 'ACC-001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair',
        description: 'Comfortable office chair',
        price: 299.99,
        category: 'Furniture',
        sku: 'FUR-001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Coffee Maker',
        description: 'Professional coffee machine',
        price: 199.99,
        category: 'Appliances',
        sku: 'APP-001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 79.99,
        category: 'Lighting',
        sku: 'LIG-001'
      }
    })
  ]);

  // Create warehouse
  const warehouse = await prisma.warehouse.create({
    data: { name: 'Main Warehouse' }
  });

  // Create stock entries
  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[0].id,
        warehouseId: warehouse.id,
        quantity: 25
      }
    }),
    prisma.stock.create({
      data: {
        productId: products[1].id,
        warehouseId: warehouse.id,
        quantity: 100
      }
    }),
    prisma.stock.create({
      data: {
        productId: products[2].id,
        warehouseId: warehouse.id,
        quantity: 15
      }
    }),
    prisma.stock.create({
      data: {
        productId: products[3].id,
        warehouseId: warehouse.id,
        quantity: 8 // Low stock for alert
      }
    }),
    prisma.stock.create({
      data: {
        productId: products[4].id,
        warehouseId: warehouse.id,
        quantity: 5 // Low stock for alert
      }
    })
  ]);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Website Redesign',
        customerId: customers[0].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        customerId: customers[2].id
      }
    }),
    prisma.project.create({
      data: {
        name: 'ERP Implementation',
        customerId: customers[1].id
      }
    })
  ]);

  // Create tasks
  await Promise.all([
    prisma.task.create({
      data: {
        name: 'Design Homepage',
        status: 'in-progress',
        projectId: projects[0].id,
        assignedToId: employees[0].id
      }
    }),
    prisma.task.create({
      data: {
        name: 'Database Setup',
        status: 'completed',
        projectId: projects[0].id,
        assignedToId: employees[0].id
      }
    }),
    prisma.task.create({
      data: {
        name: 'API Development',
        status: 'in-progress',
        projectId: projects[1].id,
        assignedToId: employees[0].id
      }
    }),
    prisma.task.create({
      data: {
        name: 'User Testing',
        status: 'pending',
        projectId: projects[0].id,
        assignedToId: employees[2].id
      }
    }),
    prisma.task.create({
      data: {
        name: 'Documentation',
        status: 'pending',
        projectId: projects[2].id,
        assignedToId: employees[0].id
      }
    })
  ]);

  // Create invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        amount: 15000,
        status: 'paid',
        date: new Date('2024-02-15'),
        customerId: customers[0].id
      }
    }),
    prisma.invoice.create({
      data: {
        amount: 25000,
        status: 'paid',
        date: new Date('2024-01-30'),
        customerId: customers[1].id
      }
    }),
    prisma.invoice.create({
      data: {
        amount: 10000,
        status: 'pending',
        date: new Date('2024-03-15'),
        customerId: customers[2].id
      }
    })
  ]);

  // Create transactions with different dates for monthly revenue
  const transactionDates = [
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    new Date('2024-02-10'),
    new Date('2024-02-25'),
    new Date('2024-03-05'),
    new Date('2024-03-12'),
    new Date('2024-04-01'),
    new Date('2024-04-15'),
    new Date('2024-05-10'),
    new Date('2024-05-20'),
    new Date('2024-06-01'),
    new Date('2024-06-15'),
    // Additional months
    new Date('2024-07-05'),
    new Date('2024-07-20'),
    new Date('2024-08-10'),
    new Date('2024-08-25'),
    new Date('2024-09-05'),
    new Date('2024-09-20'),
    new Date('2024-10-10'),
    new Date('2024-10-25'),
    new Date('2024-11-05'),
    new Date('2024-11-20'),
    new Date('2024-12-10'),
    new Date('2024-12-20')
  ];

  await Promise.all([
    // Income transactions
    prisma.transaction.create({
      data: {
        amount: 15000,
        type: 'income',
        date: transactionDates[0],
        invoiceId: invoices[0].id
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 25000,
        type: 'income',
        date: transactionDates[1],
        invoiceId: invoices[1].id
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 10000,
        type: 'income',
        date: transactionDates[2],
        invoiceId: invoices[2].id
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 5000,
        type: 'income',
        date: transactionDates[3]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 8000,
        type: 'income',
        date: transactionDates[4]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 12000,
        type: 'income',
        date: transactionDates[5]
      }
    }),
    // Expense transactions
    prisma.transaction.create({
      data: {
        amount: 5000,
        type: 'expense',
        date: transactionDates[6]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 3000,
        type: 'expense',
        date: transactionDates[7]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 2000,
        type: 'expense',
        date: transactionDates[8]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 4000,
        type: 'expense',
        date: transactionDates[9]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 1500,
        type: 'expense',
        date: transactionDates[10]
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 2500,
        type: 'expense',
        date: transactionDates[11]
      }
    }),
    // Additional income transactions
    prisma.transaction.create({
      data: {
        amount: 13000,
        type: 'income',
        date: transactionDates[12],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 17000,
        type: 'income',
        date: transactionDates[14],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 21000,
        type: 'income',
        date: transactionDates[16],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 16000,
        type: 'income',
        date: transactionDates[18],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 25000,
        type: 'income',
        date: transactionDates[20],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 19000,
        type: 'income',
        date: transactionDates[22],
      }
    }),
    // Additional expense transactions
    prisma.transaction.create({
      data: {
        amount: 3500,
        type: 'expense',
        date: transactionDates[13],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 4200,
        type: 'expense',
        date: transactionDates[15],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 3900,
        type: 'expense',
        date: transactionDates[17],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 4100,
        type: 'expense',
        date: transactionDates[19],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 4800,
        type: 'expense',
        date: transactionDates[21],
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 3700,
        type: 'expense',
        date: transactionDates[23],
      }
    })
  ]);

  // Add an Admin User at the end
  const adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@erp.com',
      password: hashedPassword,
      roleId: adminRole.id,
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${departments.length} departments`);
  console.log(`👥 Created ${employees.length} employees`);
  console.log(`🏢 Created ${customers.length} customers`);
  console.log(`📦 Created ${products.length} products`);
  console.log(`📋 Created ${projects.length} projects`);
  console.log(`💰 Created ${invoices.length} invoices`);
  console.log(`💳 Created 12 transactions`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
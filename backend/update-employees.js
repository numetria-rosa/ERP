const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateEmployees() {
  try {
    // First, get all existing employees
    const employees = await prisma.employee.findMany();
    console.log(`Found ${employees.length} employees in database:`);
    employees.forEach(emp => {
      console.log(`ID: ${emp.id}, Name: ${emp.firstName} ${emp.lastName}, Email: ${emp.email}`);
    });

    // Update existing employees with role and position data
    const updates = [
      {
        id: 1,
        position: 'HR Manager',
        role: 'Manager',
        phone: '+1-555-0101',
        salary: 75000
      },
      {
        id: 2,
        position: 'Software Engineer',
        role: 'Developer',
        phone: '+1-555-0102',
        salary: 85000
      }
    ];

    for (const update of updates) {
      // Check if employee exists before updating
      const employee = await prisma.employee.findUnique({
        where: { id: update.id }
      });
      
      if (employee) {
        await prisma.employee.update({
          where: { id: update.id },
          data: {
            position: update.position,
            role: update.role,
            phone: update.phone,
            salary: update.salary
          }
        });
        console.log(`Updated employee ${update.id}: ${update.position} - ${update.role}`);
      } else {
        console.log(`Employee with ID ${update.id} not found, skipping...`);
      }
    }

    console.log('Employee update process completed!');
  } catch (error) {
    console.error('Error updating employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmployees(); 
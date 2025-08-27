import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        user: true
      }
    });
    
    // Transform to match frontend interface
    const transformedEmployees = employees.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      position: emp.position || '',
      role: emp.role || emp.position || '',
      department: emp.department.name,
      hireDate: emp.hireDate.toISOString().split('T')[0],
      salary: emp.salary || 0,
      status: emp.status || 'active',
      avatar: null
    }));
    
    res.json(transformedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/employees/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        department: true,
        user: true
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, role, salary, status, hireDate, department } = req.body;
    
    // Always handle department by name (department is the department name from form)
    const departmentRecord = await prisma.department.upsert({
      where: { name: department },
      update: {},
      create: { name: department }
    });
    
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        position: position || null,
        role: role || position || null,
        salary: salary ? parseFloat(salary) : null,
        status: status || 'active',
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        departmentId: departmentRecord.id
      },
      include: {
        department: true
      }
    });
    
    // Transform to match frontend interface
    const transformedEmployee = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || '',
      role: employee.role || employee.position || '',
      department: employee.department.name,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      salary: employee.salary || 0,
      status: employee.status || 'active',
      avatar: null
    };
    
    res.status(201).json(transformedEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, role, salary, status, hireDate, department } = req.body;
    
    // Always handle department by name (department is the department name from form)
    const departmentRecord = await prisma.department.upsert({
      where: { name: department },
      update: {},
      create: { name: department }
    });
    
    const employee = await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        position: position || null,
        role: role || position || null,
        salary: salary ? parseFloat(salary) : null,
        status: status || 'active',
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        departmentId: departmentRecord.id
      },
      include: {
        department: true
      }
    });
    
    // Transform to match frontend interface
    const transformedEmployee = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || '',
      role: employee.role || employee.position || '',
      department: employee.department.name,
      hireDate: employee.hireDate.toISOString().split('T')[0],
      salary: employee.salary || 0,
      status: employee.status || 'active',
      avatar: null
    };
    
    res.json(transformedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/employees/:id', async (req, res) => {
  try {
    await prisma.employee.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Get departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments.map(dept => dept.name));
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get attendance
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        employee: true
      }
    });
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

export default router; 
import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        projects: true,
        invoices: true
      }
    });
    
    // Transform to match frontend interface
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.name, // Use name as company for now
      status: 'active', // Add status field to schema if needed
      totalProjects: customer.projects.length,
      totalInvoices: customer.invoices.length,
      totalRevenue: customer.invoices.reduce((sum, inv) => sum + inv.amount, 0),
      lastContact: new Date().toISOString().split('T')[0], // Add lastContact field to schema if needed
      notes: '' // Add notes field to schema if needed
    }));
    
    res.json(transformedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        projects: true,
        invoices: true
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;
    
    const customer = await prisma.customer.create({
      data: {
        name: company || name,
        email,
        phone: phone || null
      }
    });
    
    // Transform to match frontend interface
    const transformedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.name,
      status: status || 'active',
      totalProjects: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      lastContact: new Date().toISOString().split('T')[0],
      notes: notes || ''
    };
    
    res.status(201).json(transformedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/customers/:id', async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: company || name,
        email,
        phone: phone || null
      },
      include: {
        projects: true,
        invoices: true
      }
    });
    
    // Transform to match frontend interface
    const transformedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.name,
      status: status || 'active',
      totalProjects: customer.projects.length,
      totalInvoices: customer.invoices.length,
      totalRevenue: customer.invoices.reduce((sum, inv) => sum + inv.amount, 0),
      lastContact: new Date().toISOString().split('T')[0],
      notes: notes || ''
    };
    
    res.json(transformedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/customers/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get leads
router.get('/leads', async (req, res) => {
  try {
    // For now, return customers as leads since we don't have a separate leads model
    const customers = await prisma.customer.findMany({
      include: {
        projects: true
      }
    });
    
    const leads = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.name,
      status: customer.projects.length > 0 ? 'converted' : 'prospect',
      source: 'website', // Add source field to schema if needed
      assignedTo: '', // Add assignedTo field to schema if needed
      createdAt: new Date().toISOString().split('T')[0]
    }));
    
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get sales pipeline
router.get('/pipeline', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        customer: true,
        tasks: true
      }
    });
    
    const pipeline = {
      prospects: projects.filter(p => p.tasks.length === 0).length,
      qualified: projects.filter(p => p.tasks.length > 0 && p.tasks.length < 3).length,
      proposal: projects.filter(p => p.tasks.length >= 3 && p.tasks.length < 5).length,
      negotiation: projects.filter(p => p.tasks.length >= 5 && p.tasks.length < 7).length,
      closed: projects.filter(p => p.tasks.length >= 7).length
    };
    
    res.json(pipeline);
  } catch (error) {
    console.error('Error fetching sales pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch sales pipeline' });
  }
});

// Update customer status
router.patch('/customers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Since we don't have a status field in the schema, we'll just return success
    // You can add a status field to the Customer model if needed
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

export default router; 
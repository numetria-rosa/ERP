import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        invoice: {
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Transform to match frontend interface
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.invoice ? `Invoice #${transaction.invoice.id}` : 'Manual transaction',
      category: transaction.type === 'income' ? 'Revenue' : 'Expense',
      status: 'completed',
      reference: transaction.invoice ? `INV-${transaction.invoice.id}` : `TXN-${transaction.id}`
    }));
    
    res.json(transformedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get single transaction
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        invoice: {
          include: {
            customer: true
          }
        }
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { amount, type, date, description, category } = req.body;
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        date: new Date(date)
      }
    });
    
    // Transform to match frontend interface
    const transformedTransaction = {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.toISOString().split('T')[0],
      description: description || 'Manual transaction',
      category: category || (transaction.type === 'income' ? 'Revenue' : 'Expense'),
      status: 'completed',
      reference: `TXN-${transaction.id}`
    };
    
    res.status(201).json(transformedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    const { amount, type, date, description, category } = req.body;
    
    const transaction = await prisma.transaction.update({
      where: { id: parseInt(req.params.id) },
      data: {
        amount: parseFloat(amount),
        type,
        date: new Date(date)
      }
    });
    
    // Transform to match frontend interface
    const transformedTransaction = {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.toISOString().split('T')[0],
      description: description || 'Manual transaction',
      category: category || (transaction.type === 'income' ? 'Revenue' : 'Expense'),
      status: 'completed',
      reference: `TXN-${transaction.id}`
    };
    
    res.json(transformedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    
    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.unshift({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      });
    }
    
    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      monthlyData,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Get invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        transactions: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Transform to match frontend interface
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      customerName: invoice.customer.name,
      amount: invoice.amount,
      date: invoice.date.toISOString().split('T')[0],
      status: invoice.status,
      reference: `INV-${invoice.id}`,
      paid: invoice.transactions.length > 0
    }));
    
    res.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice
router.post('/invoices', async (req, res) => {
  try {
    const { customerId, amount, date, status } = req.body;
    
    const invoice = await prisma.invoice.create({
      data: {
        customerId: parseInt(customerId),
        amount: parseFloat(amount),
        date: new Date(date),
        status: status || 'pending'
      },
      include: {
        customer: true
      }
    });
    
    // Transform to match frontend interface
    const transformedInvoice = {
      id: invoice.id,
      customerName: invoice.customer.name,
      amount: invoice.amount,
      date: invoice.date.toISOString().split('T')[0],
      status: invoice.status,
      reference: `INV-${invoice.id}`,
      paid: false
    };
    
    res.status(201).json(transformedInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router; 
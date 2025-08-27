import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// Get dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    // Get real counts from database
    const employeeCount = await prisma.employee.count();
    const customerCount = await prisma.customer.count();
    const projectCount = await prisma.project.count();
    const productCount = await prisma.product.count();
    
    // Get real financial data
    const transactions = await prisma.transaction.findMany();
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Get real recent activities - last 5 employees
    const recentEmployees = await prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { department: true }
    });
    
    // Get real recent projects
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { customer: true }
    });
    
    // Get real recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        invoice: {
          include: { customer: true }
        }
      }
    });
    
    // Get real monthly revenue and expenses for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const revenue = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const profit = revenue - expenses;
      
      monthlyData.unshift({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        profit,
        profitMargin: revenue > 0 ? ((profit / revenue) * 100) : 0
      });
    }
    
    // Get revenue by customer (top 5)
    const revenueByCustomer = await prisma.transaction.groupBy({
      by: ['invoiceId'],
      where: { type: 'income' },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });
    
    const customerRevenueData = await Promise.all(
      revenueByCustomer.map(async (item) => {
        if (item.invoiceId) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: item.invoiceId },
            include: { customer: true }
          });
          return {
            customer: invoice?.customer.name || 'Unknown',
            revenue: item._sum.amount || 0
          };
        }
        return { customer: 'Direct Sales', revenue: item._sum.amount || 0 };
      })
    );
    
    // Get expense breakdown by month
    const expenseBreakdown = monthlyData.map(item => ({
      month: item.month,
      expenses: item.expenses
    }));
    
    // Get profit margin trends
    const profitMarginTrends = monthlyData.map(item => ({
      month: item.month,
      profitMargin: item.profitMargin
    }));
    
    // Get real stock alerts
    const products = await prisma.product.findMany({
      include: { stock: true }
    });
    
    const stockAlerts = products
      .map(product => {
        const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
        return {
          id: product.id,
          name: product.name,
          currentStock: totalStock,
          threshold: 10
        };
      })
      .filter(product => product.currentStock <= 10)
      .slice(0, 5); // Top 5 low stock items
    
    // Get real upcoming tasks
    const upcomingTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: {
        project: true,
        assignedTo: true
      }
    });
    
    res.json({
      summary: {
        employees: employeeCount,
        customers: customerCount,
        projects: projectCount,
        products: productCount,
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
      },
      recentActivities: {
        employees: recentEmployees.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department.name,
          date: emp.createdAt.toISOString().split('T')[0],
          type: 'employee_added'
        })),
        projects: recentProjects.map(proj => ({
          id: proj.id,
          name: proj.name,
          customer: proj.customer.name,
          date: new Date().toISOString().split('T')[0], // Using current date since we don't have project dates
          type: 'project_created'
        })),
        transactions: recentTransactions.map(txn => ({
          id: txn.id,
          amount: txn.amount,
          type: txn.type,
          description: txn.invoice ? `Invoice #${txn.invoice.id}` : 'Manual transaction',
          date: txn.date.toISOString().split('T')[0],
          customer: txn.invoice?.customer?.name || 'N/A'
        }))
      },
      monthlyData,
      customerRevenueData,
      expenseBreakdown,
      profitMarginTrends,
      stockAlerts,
      upcomingTasks: upcomingTasks.map(task => ({
        id: task.id,
        name: task.name,
        project: task.project.name,
        assignedTo: task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
        status: task.status,
        dueDate: new Date().toISOString().split('T')[0] // Using current date since we don't have due dates
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard report:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard report' });
  }
});

// Get employee report
router.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        attendances: true,
        leaves: true,
        payrolls: true
      }
    });
    
    const report = employees.map(emp => {
      const totalAttendance = emp.attendances.length;
      const totalLeaves = emp.leaves.length;
      const totalPayroll = emp.payrolls.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department.name,
        hireDate: emp.createdAt.toISOString().split('T')[0],
        attendance: totalAttendance,
        leaves: totalLeaves,
        totalPayroll,
        status: 'active'
      };
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching employee report:', error);
    res.status(500).json({ error: 'Failed to fetch employee report' });
  }
});

// Get financial report
router.get('/financial', async (req, res) => {
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
    
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true
      }
    });
    
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Get monthly breakdown
    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
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
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingInvoices: pendingInvoices.length,
        totalPending,
        transactionCount: transactions.length
      },
      monthlyData,
      recentTransactions: transactions.slice(0, 10).map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        date: t.date.toISOString().split('T')[0],
        description: t.invoice ? `Invoice #${t.invoice.id}` : 'Manual transaction'
      }))
    });
  } catch (error) {
    console.error('Error fetching financial report:', error);
    res.status(500).json({ error: 'Failed to fetch financial report' });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        stock: {
          include: {
            warehouse: true
          }
        }
      }
    });
    
    const report = products.map(product => {
      const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
      const totalValue = totalStock * product.price;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: totalStock,
        value: totalValue,
        status: totalStock > 0 ? 'in-stock' : 'out-of-stock',
        warehouses: product.stock.map(s => ({
          name: s.warehouse.name,
          quantity: s.quantity
        }))
      };
    });
    
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock.reduce((s, stock) => s + stock.quantity, 0), 0);
    const totalValue = products.reduce((sum, p) => {
      const productStock = p.stock.reduce((s, stock) => s + stock.quantity, 0);
      return sum + (productStock * p.price);
    }, 0);
    
    res.json({
      summary: {
        totalProducts,
        totalStock,
        totalValue,
        lowStock: report.filter(p => p.stock <= 10).length
      },
      products: report
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ error: 'Failed to fetch inventory report' });
  }
});

// Get customer report
router.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        projects: true,
        invoices: true
      }
    });
    
    const report = customers.map(customer => {
      const totalRevenue = customer.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalProjects = customer.projects.length;
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        totalProjects,
        totalRevenue,
        totalInvoices: customer.invoices.length,
        lastProject: customer.projects.length > 0 ? 
          customer.projects[customer.projects.length - 1].name : 'None',
        status: totalProjects > 0 ? 'active' : 'prospect'
      };
    });
    
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.invoices.reduce((s, inv) => s + inv.amount, 0), 0);
    const activeCustomers = customers.filter(c => c.projects.length > 0).length;
    
    res.json({
      summary: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        averageRevenue: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
      },
      customers: report
    });
  } catch (error) {
    console.error('Error fetching customer report:', error);
    res.status(500).json({ error: 'Failed to fetch customer report' });
  }
});

export default router; 
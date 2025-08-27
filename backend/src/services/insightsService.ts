import { PrismaClient } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

interface CashFlowForecast {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  confidence: number;
}

interface ProfitabilityInsight {
  customerId: number;
  customerName: string;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  orderCount: number;
  averageOrderValue: number;
}

interface KPIAnalysis {
  revenueGrowth: number;
  expenseGrowth: number;
  profitMargin: number;
  customerRetentionRate: number;
  employeeProductivity: number;
  inventoryTurnover: number;
}

class InsightsService {
  async getCashFlowForecast(months: number = 6): Promise<CashFlowForecast[]> {
    const forecast: CashFlowForecast[] = [];
    const currentDate = new Date();

    // Get historical data for analysis
    const historicalTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1)
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate average monthly income and expenses
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    historicalTransactions.forEach(transaction => {
      const monthKey = moment(transaction.date).format('YYYY-MM');
      const current = monthlyData.get(monthKey) || { income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      
      monthlyData.set(monthKey, current);
    });

    const avgIncome = Array.from(monthlyData.values()).reduce((sum, data) => sum + data.income, 0) / monthlyData.size;
    const avgExpenses = Array.from(monthlyData.values()).reduce((sum, data) => sum + data.expenses, 0) / monthlyData.size;

    // Generate forecast
    for (let i = 1; i <= months; i++) {
      const forecastDate = moment(currentDate).add(i, 'months');
      const monthKey = forecastDate.format('YYYY-MM');
      
      // Apply seasonal adjustments and growth trends
      const seasonalFactor = this.getSeasonalFactor(forecastDate.month());
      const growthFactor = 1 + (i * 0.02); // 2% monthly growth
      
      const projectedIncome = avgIncome * seasonalFactor * growthFactor;
      const projectedExpenses = avgExpenses * growthFactor;
      const netCashFlow = projectedIncome - projectedExpenses;
      
      // Calculate confidence based on data availability
      const confidence = Math.max(0.5, 1 - (i * 0.1)); // Decreases confidence for further months

      forecast.push({
        month: monthKey,
        projectedIncome,
        projectedExpenses,
        netCashFlow,
        confidence
      });
    }

    return forecast;
  }

  async getMostProfitableCustomers(limit: number = 10): Promise<ProfitabilityInsight[]> {
    const customers = await prisma.customer.findMany({
      include: {
        invoices: {
          include: {
            transactions: true
          }
        }
      }
    });

    const profitabilityData: ProfitabilityInsight[] = [];

    for (const customer of customers) {
      const paidInvoices = customer.invoices.filter(invoice => 
        invoice.status === 'paid' || invoice.transactions.length > 0
      );

      const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const orderCount = paidInvoices.length;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Estimate profit margin (simplified calculation)
      // In a real scenario, you'd calculate actual costs per invoice
      const estimatedCosts = totalRevenue * 0.6; // Assume 60% cost of goods sold
      const totalProfit = totalRevenue - estimatedCosts;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      profitabilityData.push({
        customerId: customer.id,
        customerName: customer.name,
        totalRevenue,
        totalProfit,
        profitMargin,
        orderCount,
        averageOrderValue
      });
    }

    // Sort by profit margin and return top customers
    return profitabilityData
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, limit);
  }

  async getKPIAnalysis(): Promise<KPIAnalysis> {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

    // Revenue Growth
    const currentMonthRevenue = await this.getMonthlyRevenue(currentDate);
    const lastMonthRevenue = await this.getMonthlyRevenue(lastMonth);
    const revenueGrowth = lastMonthRevenue > 0 ? 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Expense Growth
    const currentMonthExpenses = await this.getMonthlyExpenses(currentDate);
    const lastMonthExpenses = await this.getMonthlyExpenses(lastMonth);
    const expenseGrowth = lastMonthExpenses > 0 ? 
      ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Profit Margin
    const totalRevenue = await this.getTotalRevenue();
    const totalExpenses = await this.getTotalExpenses();
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    // Customer Retention Rate
    const customerRetentionRate = await this.calculateCustomerRetentionRate();

    // Employee Productivity
    const employeeProductivity = await this.calculateEmployeeProductivity();

    // Inventory Turnover
    const inventoryTurnover = await this.calculateInventoryTurnover();

    return {
      revenueGrowth,
      expenseGrowth,
      profitMargin,
      customerRetentionRate,
      employeeProductivity,
      inventoryTurnover
    };
  }

  async getEmployeePerformanceInsights() {
    const employees = await prisma.employee.findMany({
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
            }
          }
        },
        timeEntries: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
            }
          }
        },
        tasksAssigned: {
          where: {
            status: { not: 'completed' }
          }
        }
      }
    });

    return employees.map(employee => {
      const totalHours = employee.timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      const attendanceRate = employee.attendances.length / 22; // Assuming 22 working days per month
      const pendingTasks = employee.tasksAssigned.length;
      const productivity = totalHours * attendanceRate;

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        totalHours,
        attendanceRate: attendanceRate * 100,
        pendingTasks,
        productivity,
        department: employee.departmentId
      };
    });
  }

  async getInventoryInsights() {
    const products = await prisma.product.findMany({
      include: { stock: true }
    });

    const lowStockProducts = products.filter(product => {
      const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
      return totalStock <= product.lowStockThreshold;
    });

    const outOfStockProducts = products.filter(product => {
      const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
      return totalStock === 0;
    });

    const totalInventoryValue = products.reduce((sum, product) => {
      const totalStock = product.stock.reduce((stockSum, stock) => stockSum + stock.quantity, 0);
      return sum + (totalStock * (product.cost || product.price * 0.6));
    }, 0);

    return {
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalInventoryValue,
      lowStockItems: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.stock.reduce((sum, stock) => sum + stock.quantity, 0),
        threshold: product.lowStockThreshold
      }))
    };
  }

  private getSeasonalFactor(month: number): number {
    // Simple seasonal adjustment factors
    const seasonalFactors = {
      0: 0.9,   // January
      1: 0.85,  // February
      2: 1.0,   // March
      3: 1.1,   // April
      4: 1.15,  // May
      5: 1.2,   // June
      6: 1.1,   // July
      7: 1.05,  // August
      8: 1.0,   // September
      9: 1.1,   // October
      10: 1.2,  // November
      11: 1.3   // December
    };
    
    return seasonalFactors[month as keyof typeof seasonalFactors] || 1.0;
  }

  private async getMonthlyRevenue(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private async getMonthlyExpenses(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'expense',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private async getTotalRevenue(): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: { type: 'income' }
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private async getTotalExpenses(): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: { type: 'expense' }
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private async calculateCustomerRetentionRate(): Promise<number> {
    const customers = await prisma.customer.findMany({
      include: { invoices: true }
    });

    const customersWithMultipleOrders = customers.filter(customer => customer.invoices.length > 1);
    return customers.length > 0 ? (customersWithMultipleOrders.length / customers.length) * 100 : 0;
  }

  private async calculateEmployeeProductivity(): Promise<number> {
    const employees = await prisma.employee.findMany({
      include: {
        timeEntries: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
            }
          }
        }
      }
    });

    const totalHours = employees.reduce((sum, employee) => {
      return sum + employee.timeEntries.reduce((empSum, entry) => empSum + (entry.hours || 0), 0);
    }, 0);

    const totalEmployees = employees.length;
    return totalEmployees > 0 ? totalHours / totalEmployees : 0;
  }

  private async calculateInventoryTurnover(): Promise<number> {
    // Simplified inventory turnover calculation
    const products = await prisma.product.findMany({
      include: { stock: true }
    });

    const totalInventoryValue = products.reduce((sum, product) => {
      const totalStock = product.stock.reduce((stockSum, stock) => stockSum + stock.quantity, 0);
      return sum + (totalStock * (product.cost || product.price * 0.6));
    }, 0);

    const monthlyRevenue = await this.getMonthlyRevenue(new Date());
    
    return totalInventoryValue > 0 ? monthlyRevenue / totalInventoryValue : 0;
  }

  async getRecommendations(): Promise<any[]> {
    const recommendations = [];

    // Check for low stock products
    const inventoryInsights = await this.getInventoryInsights();
    if (inventoryInsights.lowStockProducts > 0) {
      recommendations.push({
        type: 'inventory',
        priority: 'high',
        title: 'Low Stock Alert',
        description: `${inventoryInsights.lowStockProducts} products are running low on stock`,
        action: 'Review inventory levels and reorder if necessary',
        impact: 'Prevent stockouts and maintain customer satisfaction'
      });
    }

    // Check for overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'paid' }
      }
    });

    if (overdueInvoices.length > 0) {
      recommendations.push({
        type: 'finance',
        priority: 'high',
        title: 'Overdue Invoices',
        description: `${overdueInvoices.length} invoices are overdue`,
        action: 'Follow up with customers for payment',
        impact: 'Improve cash flow and reduce outstanding receivables'
      });
    }

    // Check for employee productivity
    const employeeInsights = await this.getEmployeePerformanceInsights();
    const lowProductivityEmployees = employeeInsights.filter(emp => emp.productivity < 120); // Less than 120 hours

    if (lowProductivityEmployees.length > 0) {
      recommendations.push({
        type: 'hr',
        priority: 'medium',
        title: 'Employee Productivity',
        description: `${lowProductivityEmployees.length} employees have low productivity`,
        action: 'Review workload distribution and provide support',
        impact: 'Improve team efficiency and employee satisfaction'
      });
    }

    // Check for customer retention opportunities
    const customers = await prisma.customer.findMany({
      include: { invoices: true }
    });

    const inactiveCustomers = customers.filter(cust => {
      const lastInvoice = cust.invoices.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      return lastInvoice && new Date(lastInvoice.date) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    });

    if (inactiveCustomers.length > 0) {
      recommendations.push({
        type: 'crm',
        priority: 'medium',
        title: 'Customer Retention',
        description: `${inactiveCustomers.length} customers haven't placed orders in 90+ days`,
        action: 'Reach out to inactive customers with special offers',
        impact: 'Increase customer retention and revenue'
      });
    }

    return recommendations;
  }

  async getTrendAnalysis(metric: string): Promise<any> {
    const currentDate = new Date();
    const months = 6;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      let value = 0;

      switch (metric) {
        case 'revenue':
          value = await this.getMonthlyRevenue(date);
          break;
        case 'expenses':
          value = await this.getMonthlyExpenses(date);
          break;
        case 'profit':
          const revenue = await this.getMonthlyRevenue(date);
          const expenses = await this.getMonthlyExpenses(date);
          value = revenue - expenses;
          break;
        case 'customers':
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          const newCustomers = await prisma.customer.count({
            where: {
              // createdAt: {
              //   gte: startOfMonth,
              //   lte: endOfMonth
              // },
            }
          });
          value = newCustomers;
          break;
        default:
          value = 0;
      }

      data.push({
        month: date.toISOString().slice(0, 7),
        value
      });
    }

    // Calculate trend
    const recentValues = data.slice(-3).map(d => d.value);
    const olderValues = data.slice(0, 3).map(d => d.value);
    
    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
    
    const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    return {
      metric,
      data,
      trend,
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
  }
}

export default new InsightsService(); 
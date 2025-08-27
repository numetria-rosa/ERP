import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { LineChart, DoughnutChart, generateRevenueData, generateDepartmentData } from './ui/charts';

interface KPI {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface DashboardData {
  summary: {
    employees: number;
    customers: number;
    projects: number;
    products: number;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  recentActivities: {
    employees: Array<{
      id: number;
      name: string;
      department: string;
      date: string;
      type: string;
    }>;
    projects: Array<{
      id: number;
      name: string;
      customer: string;
      date: string;
      type: string;
    }>;
    transactions: Array<{
      id: number;
      amount: number;
      type: string;
      description: string;
      date: string;
      customer: string;
    }>;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }>;
  customerRevenueData: Array<{
    customer: string;
    revenue: number;
  }>;
  expenseBreakdown: Array<{
    month: string;
    expenses: number;
  }>;
  profitMarginTrends: Array<{
    month: string;
    profitMargin: number;
  }>;
  stockAlerts: Array<{
    id: number;
    name: string;
    currentStock: number;
    threshold: number;
  }>;
  upcomingTasks: Array<{
    id: number;
    name: string;
    project: string;
    assignedTo: string;
    status: string;
    dueDate: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate KPIs from real data
  const generateKPIs = (data: DashboardData): KPI[] => [
    {
      title: 'Total Revenue',
      value: `$${data.summary.revenue.toLocaleString()}`,
      change: `Profit: $${data.summary.profit.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      title: 'Profit Margin',
      value: `${data.summary.profitMargin.toFixed(1)}%`,
      change: data.summary.profitMargin >= 0 ? 'Positive margin' : 'Negative margin',
      icon: <TrendingUp className="h-4 w-4" />,
      color: data.summary.profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'
    },
    {
      title: 'Total Employees',
      value: data.summary.employees.toString(),
      change: 'Active team members',
      icon: <Users className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      title: 'Active Projects',
      value: data.summary.projects.toString(),
      change: `${data.summary.customers} customers`,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ];

  // Quick actions with navigation
  const quickActions = [
    { title: 'Add Employee', icon: <Users className="h-4 w-4" />, action: () => navigate('/hr') },
    { title: 'Create Transaction', icon: <DollarSign className="h-4 w-4" />, action: () => navigate('/accounting') },
    { title: 'New Project', icon: <TrendingUp className="h-4 w-4" />, action: () => navigate('/projects') },
    { title: 'Add Product', icon: <Plus className="h-4 w-4" />, action: () => navigate('/inventory') }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    );
  }

  const kpis = generateKPIs(dashboardData);

  // Combine recent activities
  const allRecentActivities = [
    ...dashboardData.recentActivities.employees.map(emp => ({
      id: emp.id,
      action: `New employee: ${emp.name}`,
      time: emp.date,
      type: 'hr' as const
    })),
    ...dashboardData.recentActivities.projects.map(proj => ({
      id: proj.id,
      action: `Project: ${proj.name}`,
      time: proj.date,
      type: 'project' as const
    })),
    ...dashboardData.recentActivities.transactions.map(txn => ({
      id: txn.id,
      action: `${txn.type === 'income' ? 'Income' : 'Expense'}: $${txn.amount}`,
      time: txn.date,
      type: 'accounting' as const
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}!</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Today: {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={kpi.color}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={action.action}
                >
                  {action.icon}
                  <span className="ml-2">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allRecentActivities.length > 0 ? (
                allRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'hr' ? 'bg-blue-500' :
                        activity.type === 'project' ? 'bg-purple-500' :
                        activity.type === 'accounting' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Recent project tasks and assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingTasks.length > 0 ? (
                dashboardData.upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.name}</p>
                      <p className="text-xs text-gray-500">{task.project} • {task.assignedTo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming tasks</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly revenue and expense trends</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: dashboardData.monthlyData.map(item => item.month),
                datasets: [
                  {
                    label: 'Revenue',
                    data: dashboardData.monthlyData.map(item => item.revenue),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: false
                  },
                  {
                    label: 'Expenses',
                    data: dashboardData.monthlyData.map(item => item.expenses),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: false
                  }
                ]
              }}
              title="Revenue vs Expenses"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Profit Margin Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin Trends</CardTitle>
            <CardDescription>Monthly profit margin percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: dashboardData.profitMarginTrends.map(item => item.month),
                datasets: [{
                  label: 'Profit Margin %',
                  data: dashboardData.profitMarginTrends.map(item => item.profitMargin),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true
                }]
              }}
              title="Profit Margin %"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Customer Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Revenue</CardTitle>
            <CardDescription>Revenue breakdown by customer</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.customerRevenueData.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.customerRevenueData.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer.customer}</p>
                      <p className="text-sm text-gray-600">Revenue generated</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ${customer.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No customer revenue data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Key financial metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total Revenue</p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${dashboardData.summary.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total Expenses</p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    ${dashboardData.summary.expenses.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Net Profit</p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${dashboardData.summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${dashboardData.summary.profit.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Profit Margin</p>
                  <p className="text-sm text-gray-600">Overall</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${dashboardData.summary.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {dashboardData.summary.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Revenue Trends Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Revenue Trends Analysis</h2>
            <p className="text-gray-600">Detailed financial performance insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Profit Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit</CardTitle>
              <CardDescription>Net profit by month</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={{
                  labels: dashboardData.monthlyData.map(item => item.month),
                  datasets: [{
                    label: 'Net Profit',
                    data: dashboardData.monthlyData.map(item => item.profit),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                  }]
                }}
                title="Monthly Profit"
                height={200}
              />
            </CardContent>
          </Card>

          {/* Expense Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>Monthly expense breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={{
                  labels: dashboardData.expenseBreakdown.map(item => item.month),
                  datasets: [{
                    label: 'Expenses',
                    data: dashboardData.expenseBreakdown.map(item => item.expenses),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                  }]
                }}
                title="Monthly Expenses"
                height={200}
              />
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products with low stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.stockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.stockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{alert.name}</p>
                        <p className="text-sm text-gray-600">Current: {alert.currentStock} units</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All products have sufficient stock</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Performance Summary</CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardData.summary.revenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  ${dashboardData.summary.expenses.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className={`text-2xl font-bold ${dashboardData.summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${dashboardData.summary.profit.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Profit</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold ${dashboardData.summary.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {dashboardData.summary.profitMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Profit Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 
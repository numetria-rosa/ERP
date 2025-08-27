import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import { BarChart, DoughnutChart, generateSalesData, generateInventoryData, generateCustomerPipelineData, generateDepartmentData } from '../../components/ui/charts';
import ExportUtility from '../../components/ExportUtility';
import FileUpload from '../../components/FileUpload';

interface ReportData {
  id: number;
  name: string;
  type: 'financial' | 'hr' | 'inventory' | 'sales';
  dateRange: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    {
      id: 1,
      name: 'Financial Summary',
      type: 'financial' as const,
      dateRange: 'Last 30 Days',
      lastGenerated: '2024-01-15',
      status: 'ready' as const
    },
    {
      id: 2,
      name: 'Employee Performance',
      type: 'hr' as const,
      dateRange: 'Last Quarter',
      lastGenerated: '2024-01-10',
      status: 'ready' as const
    },
    {
      id: 3,
      name: 'Inventory Status',
      type: 'inventory' as const,
      dateRange: 'Current Month',
      lastGenerated: '2024-01-12',
      status: 'generating' as const
    },
    {
      id: 4,
      name: 'Sales Pipeline',
      type: 'sales' as const,
      dateRange: 'Last 6 Months',
      lastGenerated: '2024-01-08',
      status: 'ready' as const
    }
  ];

  const financialData = {
    revenue: 125000,
    expenses: 85000,
    profit: 40000,
    growth: 12.5,
    topExpenses: [
      { category: 'Personnel', amount: 45000, percentage: 53 },
      { category: 'Technology', amount: 20000, percentage: 24 },
      { category: 'Marketing', amount: 15000, percentage: 18 },
      { category: 'Office', amount: 5000, percentage: 6 }
    ]
  };

  const hrData = {
    totalEmployees: 24,
    newHires: 3,
    turnover: 1,
    avgSalary: 65000,
    departments: [
      { name: 'Engineering', count: 8, avgSalary: 75000 },
      { name: 'Sales', count: 6, avgSalary: 55000 },
      { name: 'Marketing', count: 4, avgSalary: 60000 },
      { name: 'HR', count: 3, avgSalary: 50000 },
      { name: 'Finance', count: 3, avgSalary: 70000 }
    ]
  };

  const inventoryData = {
    totalProducts: 150,
    lowStock: 12,
    outOfStock: 3,
    totalValue: 250000,
    categories: [
      { name: 'Electronics', count: 45, value: 120000 },
      { name: 'Office Supplies', count: 60, value: 80000 },
      { name: 'Furniture', count: 25, value: 35000 },
      { name: 'Software', count: 20, value: 15000 }
    ]
  };

  const salesData = {
    totalLeads: 45,
    converted: 12,
    conversionRate: 26.7,
    avgDealSize: 8500,
    pipeline: [
      { stage: 'Leads', count: 15, value: 45000 },
      { stage: 'Prospects', count: 12, value: 72000 },
      { stage: 'Proposals', count: 8, value: 64000 },
      { stage: 'Negotiation', count: 5, value: 40000 },
      { stage: 'Closed Won', count: 12, value: 102000 }
    ]
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    alert(`${format.toUpperCase()} report exported successfully!`);
  };

  const getReportData = () => {
    switch (selectedReport) {
      case 'financial': return financialData;
      case 'hr': return hrData;
      case 'inventory': return inventoryData;
      case 'sales': return salesData;
      default: return financialData;
    }
  };

  const currentData = getReportData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and export data for your business</p>
        </div>
        <div className="flex gap-2">
          <ExportUtility dataType="reports" data={reports} />
          <FileUpload onUpload={async (files) => { /* TODO: handle import logic */ }} accept={{'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']}} />
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="financial">Financial Summary</option>
                <option value="hr">HR Analytics</option>
                <option value="inventory">Inventory Status</option>
                <option value="sales">Sales Pipeline</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Overview of current performance</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport === 'financial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${financialData.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">${financialData.expenses.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Expenses</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">${financialData.profit.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Net Profit</div>
                  <div className="text-sm text-green-600 mt-1">+{financialData.growth}% vs last period</div>
                </div>
              </div>
            )}

            {selectedReport === 'hr' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{hrData.totalEmployees}</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{hrData.newHires}</div>
                    <div className="text-sm text-gray-600">New Hires</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">${hrData.avgSalary.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Average Salary</div>
                </div>
              </div>
            )}

            {selectedReport === 'inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{inventoryData.totalProducts}</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{inventoryData.lowStock}</div>
                    <div className="text-sm text-gray-600">Low Stock Items</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">${inventoryData.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Inventory Value</div>
                </div>
              </div>
            )}

            {selectedReport === 'sales' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{salesData.totalLeads}</div>
                    <div className="text-sm text-gray-600">Total Leads</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{salesData.converted}</div>
                    <div className="text-sm text-gray-600">Converted</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{salesData.conversionRate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                  <div className="text-sm text-green-600 mt-1">${salesData.avgDealSize.toLocaleString()} avg deal</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Chart</CardTitle>
            <CardDescription>Visual representation of data</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport === 'financial' && (
              <BarChart 
                data={generateSalesData()} 
                title="Quarterly Sales Performance"
                height={250}
              />
            )}
            {selectedReport === 'hr' && (
              <DoughnutChart 
                data={generateDepartmentData()} 
                title="Department Distribution"
                height={250}
              />
            )}
            {selectedReport === 'inventory' && (
              <BarChart 
                data={generateInventoryData()} 
                title="Inventory by Category"
                height={250}
              />
            )}
            {selectedReport === 'sales' && (
              <BarChart 
                data={generateCustomerPipelineData()} 
                title="Sales Pipeline"
                height={250}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Comprehensive data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedReport === 'financial' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Top Expense Categories</h3>
              <div className="space-y-2">
                {financialData.topExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="font-medium dark:text-black">{expense.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium dark:text-black">${expense.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500 dark:text-black">{expense.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'hr' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Department Breakdown</h3>
              <div className="space-y-2">
                {hrData.departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{dept.count} employees</div>
                      <div className="text-sm text-gray-500">${dept.avgSalary.toLocaleString()} avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'inventory' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Category Breakdown</h3>
              <div className="space-y-2">
                {inventoryData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{category.count} items</div>
                      <div className="text-sm text-gray-500">${category.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'sales' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Sales Pipeline</h3>
              <div className="space-y-2">
                {salesData.pipeline.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stage.count} deals</div>
                      <div className="text-sm text-gray-500">${stage.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download your report in different formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('pdf')}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('excel')}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-gray-500">
                    {report.dateRange} • Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'ready' ? 'bg-green-100 text-green-800' :
                    report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 
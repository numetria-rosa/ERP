import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Package, 
  Calendar,
  Lightbulb,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { insightsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface KPIInsights {
  revenueGrowth: number;
  expenseGrowth: number;
  profitMargin: number;
  customerRetentionRate: number;
  employeeProductivity: number;
  inventoryTurnover: number;
}

interface CashFlowForecast {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  confidence: number;
}

interface Recommendation {
  type: 'inventory' | 'finance' | 'hr' | 'crm';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
}

interface TrendAnalysis {
  metric: string;
  data: Array<{ month: string; value: number }>;
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
}

const InsightsDashboard: React.FC = () => {
  const [kpiInsights, setKpiInsights] = useState<KPIInsights | null>(null);
  const [cashFlowForecast, setCashFlowForecast] = useState<CashFlowForecast[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    if (selectedMetric) {
      loadTrendAnalysis(selectedMetric);
    }
  }, [selectedMetric]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const [kpiData, forecastData, recommendationsData] = await Promise.all([
        insightsAPI.getKPIInsights(),
        insightsAPI.getCashFlowForecast(),
        insightsAPI.getRecommendations()
      ]);

      setKpiInsights(kpiData);
      setCashFlowForecast(forecastData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendAnalysis = async (metric: string) => {
    try {
      const data = await insightsAPI.getTrendAnalysis(metric);
      setTrendAnalysis(data);
    } catch (error) {
      console.error('Failed to load trend analysis:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Package className="w-4 h-4" />;
      case 'finance':
        return <DollarSign className="w-4 h-4" />;
      case 'hr':
        return <Users className="w-4 h-4" />;
      case 'crm':
        return <Users className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered insights and recommendations for your business
          </p>
        </div>
        <Button onClick={loadInsights} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* KPI Insights Grid */}
      {kpiInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(kpiInsights.revenueGrowth)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpiInsights.revenueGrowth > 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                )}
                vs last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiInsights.profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Current profit margin
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiInsights.customerRetentionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Customer retention rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee Productivity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiInsights.employeeProductivity.toFixed(1)}h
              </div>
              <div className="text-xs text-muted-foreground">
                Avg hours per employee
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiInsights.inventoryTurnover.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Monthly turnover ratio
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense Growth</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(kpiInsights.expenseGrowth)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpiInsights.expenseGrowth < 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                )}
                vs last month
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Flow Forecast */}
      {cashFlowForecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Forecast</CardTitle>
            <CardDescription>
              6-month cash flow projection with confidence levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="projectedIncome" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Projected Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="projectedExpenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Projected Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="netCashFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Net Cash Flow"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Smart Recommendations</CardTitle>
            <CardDescription>
              AI-powered recommendations to improve your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-medium">Action:</span> {rec.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-medium">Impact:</span> {rec.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>
            Track key metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {['revenue', 'expenses', 'profit', 'customers'].map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric)}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              ))}
            </div>
            
            {trendAnalysis && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">
                    {trendAnalysis.metric.charAt(0).toUpperCase() + trendAnalysis.metric.slice(1)} Trend
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Trend:</span>
                    <Badge className={trendAnalysis.trendDirection === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {formatPercentage(trendAnalysis.trend)}
                    </Badge>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendAnalysis.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [trendAnalysis.metric === 'customers' ? value : formatCurrency(value), '']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsDashboard; 
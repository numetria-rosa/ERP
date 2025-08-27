const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: { email: string; password: string; name: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// HR API
export const hrAPI = {
  getEmployees: () => apiRequest('/hr/employees'),
  
  getEmployee: (id: number) => apiRequest(`/hr/employees/${id}`),
  
  createEmployee: (employeeData: any) =>
    apiRequest('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),
  
  updateEmployee: (id: number, employeeData: any) =>
    apiRequest(`/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),
  
  deleteEmployee: (id: number) =>
    apiRequest(`/hr/employees/${id}`, {
      method: 'DELETE',
    }),
  
  getDepartments: () => apiRequest('/hr/departments'),
  
  getAttendance: (employeeId?: number) => 
    apiRequest(employeeId ? `/hr/attendance/${employeeId}` : '/hr/attendance'),
};

// Inventory API
export const inventoryAPI = {
  getProducts: () => apiRequest('/inventory/products'),
  
  getProduct: (id: number) => apiRequest(`/inventory/products/${id}`),
  
  createProduct: (productData: any) =>
    apiRequest('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  
  updateProduct: (id: number, productData: any) =>
    apiRequest(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  
  deleteProduct: (id: number) =>
    apiRequest(`/inventory/products/${id}`, {
      method: 'DELETE',
    }),
  
  getCategories: () => apiRequest('/inventory/categories'),
  
  getStockAlerts: () => apiRequest('/inventory/stock-alerts'),
  
  updateStock: (id: number, quantity: number) =>
    apiRequest(`/inventory/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
};

// Accounting API
export const accountingAPI = {
  getTransactions: () => apiRequest('/accounting/transactions'),
  
  getTransaction: (id: number) => apiRequest(`/accounting/transactions/${id}`),
  
  createTransaction: (transactionData: any) =>
    apiRequest('/accounting/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),
  
  updateTransaction: (id: number, transactionData: any) =>
    apiRequest(`/accounting/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    }),
  
  deleteTransaction: (id: number) =>
    apiRequest(`/accounting/transactions/${id}`, {
      method: 'DELETE',
    }),
  
  getFinancialSummary: () => apiRequest('/accounting/summary'),
  
  getInvoices: () => apiRequest('/accounting/invoices'),
  
  createInvoice: (invoiceData: any) =>
    apiRequest('/accounting/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    }),
};

// CRM API
export const crmAPI = {
  getCustomers: () => apiRequest('/crm/customers'),
  
  getCustomer: (id: number) => apiRequest(`/crm/customers/${id}`),
  
  createCustomer: (customerData: any) =>
    apiRequest('/crm/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),
  
  updateCustomer: (id: number, customerData: any) =>
    apiRequest(`/crm/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    }),
  
  deleteCustomer: (id: number) =>
    apiRequest(`/crm/customers/${id}`, {
      method: 'DELETE',
    }),
  
  getLeads: () => apiRequest('/crm/leads'),
  
  getSalesPipeline: () => apiRequest('/crm/pipeline'),
  
  updateCustomerStatus: (id: number, status: string) =>
    apiRequest(`/crm/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Projects API
export const projectsAPI = {
  getProjects: () => apiRequest('/projects'),
  
  getProject: (id: number) => apiRequest(`/projects/${id}`),
  
  createProject: (projectData: any) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),
  
  updateProject: (id: number, projectData: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),
  
  deleteProject: (id: number) =>
    apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    }),
  
  getTasks: (projectId?: number) => 
    apiRequest(projectId ? `/projects/${projectId}/tasks` : '/tasks'),
  
  createTask: (taskData: any) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  updateTask: (id: number, taskData: any) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
};

// Reports API
export const reportsAPI = {
  generateReport: (type: string, dateRange: string) =>
    apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, dateRange }),
    }),
  
  getReportHistory: () => apiRequest('/reports/history'),
  
  exportReport: (reportId: number, format: 'pdf' | 'excel') =>
    apiRequest(`/reports/${reportId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    }),
  
  getDashboardData: () => apiRequest('/reports/dashboard'),
  
  getAnalytics: (type: string) => apiRequest(`/reports/analytics/${type}`),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => apiRequest('/dashboard/kpis'),
  
  getRecentActivity: () => apiRequest('/dashboard/activity'),
  
  getUpcomingEvents: () => apiRequest('/dashboard/events'),
  
  getChartData: (chartType: string) => apiRequest(`/dashboard/charts/${chartType}`),
};

// Global Search API
export const searchGlobal = async (query: string) => {
  return apiRequest(`/search?q=${encodeURIComponent(query)}`);
};

// Automation API
export const automationAPI = {
  getAutomations: () => apiRequest('/automation'),
  
  createAutomation: (automationData: any) =>
    apiRequest('/automation', {
      method: 'POST',
      body: JSON.stringify(automationData),
    }),
  
  updateAutomation: (id: number, automationData: any) =>
    apiRequest(`/automation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(automationData),
    }),
  
  deleteAutomation: (id: number) =>
    apiRequest(`/automation/${id}`, {
      method: 'DELETE',
    }),
  
  getAutomationLogs: () => apiRequest('/automation/logs'),
};

// Insights API
export const insightsAPI = {
  getKPIInsights: () => apiRequest('/insights/kpi'),
  
  getCashFlowForecast: () => apiRequest('/insights/cashflow'),
  
  getRecommendations: () => apiRequest('/insights/recommendations'),
  
  getTrendAnalysis: (metric: string) => apiRequest(`/insights/trends/${metric}`),
};

export default {
  auth: authAPI,
  hr: hrAPI,
  inventory: inventoryAPI,
  accounting: accountingAPI,
  crm: crmAPI,
  projects: projectsAPI,
  reports: reportsAPI,
  dashboard: dashboardAPI,
  automation: automationAPI,
  insights: insightsAPI,
}; 
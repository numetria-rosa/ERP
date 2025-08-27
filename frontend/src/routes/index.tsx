import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HREmployees from '../modules/hr';
import AccountingTransactions from '../modules/accounting';
import InventoryProducts from '../modules/inventory';
import CRMCustomers from '../modules/crm';
import ProjectsList from '../modules/projects';
import ReportsList from '../modules/reports';
import { useAuth } from '../store/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  console.log('Dashboard: Component rendered');
  return <Dashboard />;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email, password });
      await login(email, password);
      console.log('Login successful, redirecting...');
      navigate('/');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your ERP dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('Employee');
  const [error, setError] = React.useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, role);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Register failed');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for your ERP dashboard account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  console.log('ProtectedRoute: Token check -', token ? 'Token exists' : 'No token');
  if (!token) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" />;
  }
  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/hr" element={<ProtectedRoute><Layout><HREmployees /></Layout></ProtectedRoute>} />
      <Route path="/accounting" element={<ProtectedRoute><Layout><AccountingTransactions /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryProducts /></Layout></ProtectedRoute>} />
      <Route path="/crm" element={<ProtectedRoute><Layout><CRMCustomers /></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Layout><ProjectsList /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsList /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes; 
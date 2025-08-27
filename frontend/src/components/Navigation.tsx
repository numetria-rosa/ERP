import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../store/auth';
import GlobalSearch from './GlobalSearch';
import LanguageSelector from './LanguageSelector';
import NotificationCenter from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { 
  Users, 
  Calculator, 
  Package, 
  UserCheck, 
  FolderOpen, 
  BarChart3,
  Home,
  LogOut
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/hr', label: 'HR', icon: Users },
    { path: '/accounting', label: 'Accounting', icon: Calculator },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/crm', label: 'CRM', icon: UserCheck },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ERP System</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <GlobalSearch />
            <NotificationCenter />
            <LanguageSelector />
            <Button variant="outline" onClick={toggleTheme} className="flex items-center">
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button variant="outline" onClick={logout} className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
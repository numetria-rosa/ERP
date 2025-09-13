import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../store/auth';
import GlobalSearch from './GlobalSearch';
import LanguageSelector from './LanguageSelector';
import NotificationCenter from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <NotificationCenter />
            <LanguageSelector />
            <Button 
              variant="outline" 
              onClick={toggleTheme} 
              className="flex items-center whitespace-nowrap"
              size="sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden lg:inline ml-2">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </Button>
            <Button 
              variant="outline" 
              onClick={logout} 
              className="flex items-center whitespace-nowrap"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4 space-x-2">
                <GlobalSearch />
                <NotificationCenter />
                <LanguageSelector />
                <Button 
                  variant="outline" 
                  onClick={toggleTheme} 
                  className="flex items-center"
                  size="sm"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={logout} 
                  className="flex items-center"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 
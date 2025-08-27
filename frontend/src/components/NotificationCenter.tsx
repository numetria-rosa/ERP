import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Product "Laptop Pro X1" is running low on stock (5 units remaining)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        action: {
          label: 'View Product',
          url: '/inventory/products/1'
        }
      },
      {
        id: '2',
        type: 'success',
        title: 'Invoice Paid',
        message: 'Invoice #INV-2024-001 has been paid by John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        action: {
          label: 'View Invoice',
          url: '/accounting/invoices/1'
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'New Customer Registration',
        message: 'Jane Smith has registered as a new customer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        action: {
          label: 'View Customer',
          url: '/crm/customers/5'
        }
      },
      {
        id: '4',
        type: 'error',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin in 1 hour. System may be unavailable for 30 minutes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true
      },
      {
        id: '5',
        type: 'success',
        title: 'Project Completed',
        message: 'Project "Website Redesign" has been completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        action: {
          label: 'View Project',
          url: '/projects/3'
        }
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleAction = (notification: Notification) => {
    if (notification.action) {
      window.location.href = notification.action.url;
    }
    markAsRead(notification.id);
  };

  const displayedNotifications = showAll 
    ? notifications 
    : notifications.slice(0, 5);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {displayedNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    } hover:bg-opacity-75 transition-all`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        {notification.action && (
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => handleAction(notification)}
                            className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-2"
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notifications.length > 5 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Show Less' : `Show All (${notifications.length})`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter; 
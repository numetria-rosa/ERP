import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Plus,
  Settings,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from 'react-hot-toast';
import { automationAPI } from '../services/api';

interface Automation {
  id: number;
  name: string;
  type: 'payroll' | 'invoice' | 'inventory' | 'email' | 'report';
  schedule: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  description: string;
  settings: any;
}

interface AutomationLog {
  id: number;
  automationId: number;
  status: 'success' | 'failed' | 'running';
  message: string;
  timestamp: string;
  duration?: number;
}

const AutomationManager: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    loadAutomations();
    loadLogs();
  }, []);

  const loadAutomations = async () => {
    try {
      const data = await automationAPI.getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await automationAPI.getAutomationLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const toggleAutomation = async (automation: Automation) => {
    try {
      const updatedAutomation = await automationAPI.updateAutomation(automation.id, {
        ...automation,
        isActive: !automation.isActive
      });
      
      setAutomations(prev => 
        prev.map(a => a.id === automation.id ? updatedAutomation : a)
      );
      
      toast.success(`Automation ${updatedAutomation.isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const runAutomation = async (automation: Automation) => {
    try {
      toast.loading(`Running ${automation.name}...`);
      // In a real implementation, you'd call an API to trigger the automation
      setTimeout(() => {
        toast.success(`${automation.name} completed successfully`);
        loadLogs(); // Refresh logs
      }, 2000);
    } catch (error) {
      console.error('Failed to run automation:', error);
      toast.error('Failed to run automation');
    }
  };

  const deleteAutomation = async (automation: Automation) => {
    if (!confirm(`Are you sure you want to delete "${automation.name}"?`)) {
      return;
    }

    try {
      await automationAPI.deleteAutomation(automation.id);
      setAutomations(prev => prev.filter(a => a.id !== automation.id));
      toast.success('Automation deleted successfully');
    } catch (error) {
      console.error('Failed to delete automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'payroll':
        return <Calendar className="w-5 h-5" />;
      case 'invoice':
        return <AlertTriangle className="w-5 h-5" />;
      case 'inventory':
        return <CheckCircle className="w-5 h-5" />;
      case 'email':
        return <Settings className="w-5 h-5" />;
      case 'report':
        return <Zap className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage automated tasks and workflows
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map((automation) => (
          <Card key={automation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getAutomationIcon(automation.type)}
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                </div>
                <Switch
                  checked={automation.isActive}
                  onCheckedChange={() => toggleAutomation(automation)}
                />
              </div>
              <CardDescription>{automation.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Schedule:</span>
                <Badge variant="outline">{automation.schedule}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Last Run:</span>
                <span className="text-gray-900 dark:text-white">
                  {automation.lastRun ? 
                    new Date(automation.lastRun).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>

              {automation.nextRun && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Next Run:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(automation.nextRun).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runAutomation(automation)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAutomation(automation)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteAutomation(automation)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automation Logs</CardTitle>
          <CardDescription>
            Latest automation execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {automations.find(a => a.id === log.automationId)?.name || 'Unknown Automation'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.duration}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationManager; 
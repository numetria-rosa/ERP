import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  projectId: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  budget: number;
  team: string[];
  tasks: Task[];
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      client: 'TechCorp Inc.',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      status: 'active',
      progress: 65,
      budget: 25000,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      tasks: [
        {
          id: 1,
          title: 'Design Homepage',
          description: 'Create new homepage design',
          status: 'done',
          priority: 'high',
          assignee: 'John Doe',
          dueDate: '2024-01-15',
          projectId: 1
        },
        {
          id: 2,
          title: 'Implement Backend',
          description: 'Develop backend functionality',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Jane Smith',
          dueDate: '2024-02-15',
          projectId: 1
        }
      ]
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'iOS and Android app for client',
      client: 'StartupXYZ',
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      status: 'planning',
      progress: 15,
      budget: 50000,
      team: ['Sarah Wilson', 'Alex Brown'],
      tasks: [
        {
          id: 3,
          title: 'Requirements Gathering',
          description: 'Collect and document requirements',
          status: 'done',
          priority: 'medium',
          assignee: 'Sarah Wilson',
          dueDate: '2024-02-10',
          projectId: 2
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    const matchesClient = !filterClient || project.client === filterClient;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const clients = ['TechCorp Inc.', 'StartupXYZ', 'Davis Consulting', 'Global Solutions'];
  const statuses = ['planning', 'active', 'completed', 'on-hold'];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: Math.max(...projects.map(p => p.id)) + 1
    };
    setProjects([...projects, newProject]);
    setShowAddModal(false);
  };

  const handleEditProject = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
    setEditingProject(null);
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Track your projects, tasks, and team progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{completedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Client</label>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterClient('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>
            Showing {filteredProjects.length} of {projects.length} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-500">Client:</span>
                        <div className="font-medium">{project.client}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Progress:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Budget:</span>
                        <div className="font-medium">${project.budget.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Team:</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{project.team.length} members</span>
                        </div>
                      </div>
                    </div>

                    {/* Tasks Preview */}
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h4>
                      <div className="space-y-1">
                        {project.tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getTaskStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span>{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="text-gray-500">{task.assignee}</span>
                            </div>
                          </div>
                        ))}
                        {project.tasks.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{project.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Modal Placeholder */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedProject.name}</h2>
            <p className="text-gray-600 mb-4">
              Detailed project view with tasks, timeline, and team management will be implemented here
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Project Modal Placeholder */}
      {(showAddModal || editingProject) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <p className="text-gray-600 mb-4">
              Project form will be implemented here with proper validation
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProject(null);
                }}
              >
                Cancel
              </Button>
              <Button>
                {editingProject ? 'Update' : 'Add'} Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 
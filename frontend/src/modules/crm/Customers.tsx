import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, customerFormFields } from '../../components/ui/form';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  UserPlus,
  MessageSquare
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  value: number;
  lastContact: string;
  notes: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'CTO',
      source: 'Website',
      status: 'customer',
      value: 25000,
      lastContact: '2024-01-15',
      notes: 'Interested in enterprise solutions'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@startup.com',
      phone: '+1 (555) 234-5678',
      company: 'StartupXYZ',
      position: 'CEO',
      source: 'Referral',
      status: 'prospect',
      value: 15000,
      lastContact: '2024-01-10',
      notes: 'Follow up on demo request'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@consulting.com',
      phone: '+1 (555) 345-6789',
      company: 'Davis Consulting',
      position: 'Managing Director',
      source: 'LinkedIn',
      status: 'lead',
      value: 5000,
      lastContact: '2024-01-08',
      notes: 'Initial contact made'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || customer.status === filterStatus;
    const matchesSource = !filterSource || customer.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Other'];
  const statuses = ['lead', 'prospect', 'customer', 'inactive'];

  const totalCustomers = customers.filter(c => c.status === 'customer').length;
  const totalLeads = customers.filter(c => c.status === 'lead').length;
  const totalValue = customers.reduce((sum, c) => sum + c.value, 0);

  const pipelineData = {
    leads: customers.filter(c => c.status === 'lead'),
    prospects: customers.filter(c => c.status === 'prospect'),
    customers: customers.filter(c => c.status === 'customer'),
    inactive: customers.filter(c => c.status === 'inactive')
  };

  const handleAddCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: Math.max(...customers.map(c => c.id)) + 1
    };
    setCustomers([...customers, newCustomer]);
    setShowAddModal(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: Customer['status']) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your leads, prospects, and customers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button 
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('pipeline')}
          >
            Pipeline View
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* CRM Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalCustomers > 0 ? Math.round((totalCustomers / customers.length) * 100) : 0}%
            </div>
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
                placeholder="Search customers..."
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
              <label className="text-sm font-medium">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterSource('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              Showing {filteredCustomers.length} of {customers.length} customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Company</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Value</th>
                    <th className="text-left py-3 px-4 font-medium">Last Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{customer.company}</div>
                          <div className="text-sm text-gray-500">{customer.position}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={customer.status}
                          onChange={(e) => handleStatusChange(customer.id, e.target.value as Customer['status'])}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                            customer.status === 'customer' 
                              ? 'bg-green-100 text-green-800' 
                              : customer.status === 'prospect'
                              ? 'bg-blue-100 text-blue-800'
                              : customer.status === 'lead'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">${customer.value.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(customer.lastContact).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(pipelineData).map(([stage, stageCustomers]) => (
            <Card key={stage}>
              <CardHeader>
                <CardTitle className="capitalize">{stage}</CardTitle>
                <CardDescription>{stageCustomers.length} customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stageCustomers.map((customer) => (
                    <div key={customer.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.company}</div>
                      <div className="text-xs font-medium text-green-600 mt-1">
                        ${customer.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Customer Form */}
      {(showAddModal || editingCustomer) && (
        <Form
          fields={customerFormFields}
          onSubmit={(data) => {
            if (editingCustomer) {
              handleEditCustomer({ ...editingCustomer, ...data });
            } else {
              handleAddCustomer(data);
            }
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
          title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          submitText={editingCustomer ? 'Update Customer' : 'Add Customer'}
          initialData={editingCustomer || {}}
        />
      )}
    </div>
  );
};

export default Customers; 
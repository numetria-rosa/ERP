import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, employeeFormFields } from '../../components/ui/form';
import { hrAPI } from '../../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import ExportUtility from '../../components/ExportUtility';
import FileUpload from '../../components/FileUpload';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  department: string;
  hireDate: string;
  salary?: number;
  status: 'active' | 'inactive';
  avatar?: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrAPI.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees. Please try again.');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses = ['active', 'inactive'];

  const handleAddEmployee = async (employeeData: any) => {
    try {
      setSubmitting(true);
      const newEmployee = await hrAPI.createEmployee(employeeData);
      setEmployees([...employees, newEmployee]);
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to add employee. Please try again.');
      console.error('Error adding employee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEmployee = async (employeeData: any) => {
    if (!editingEmployee) return;
    
    try {
      setSubmitting(true);
      const updatedEmployee = await hrAPI.updateEmployee(editingEmployee.id, employeeData);
      setEmployees(employees.map(e => e.id === editingEmployee.id ? updatedEmployee : e));
      setEditingEmployee(null);
    } catch (err) {
      setError('Failed to update employee. Please try again.');
      console.error('Error updating employee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await hrAPI.deleteEmployee(id);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      setError('Failed to delete employee. Please try again.');
      console.error('Error deleting employee:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <div className="flex gap-2">
          <ExportUtility dataType="employees" data={employees} />
          <FileUpload onUpload={async (files) => { /* TODO: handle import logic */ }} accept={{'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']}} />
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
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
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterStatus('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>
            Showing {filteredEmployees.length} of {employees.length} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Position</th>
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-left py-3 px-4 font-medium">Hire Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          {employee.avatar ? (
                            <img src={employee.avatar} alt={`${employee.firstName || ''} ${employee.lastName || ''}`} className="w-8 h-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {`${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{`${employee.firstName || ''} ${employee.lastName || ''}`}</div>
                          <div className="text-sm text-gray-500">{employee.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{employee.role || 'N/A'}</td>
                    <td className="py-3 px-4">{employee.position || 'N/A'}</td>
                    <td className="py-3 px-4">{employee.department || ''}</td>
                    <td className="py-3 px-4">
                      {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
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

      {/* Add/Edit Employee Form */}
      {(showAddModal || editingEmployee) && (
        <Form
          fields={employeeFormFields}
          onSubmit={(data) => {
            if (editingEmployee) {
              handleEditEmployee(data);
            } else {
              handleAddEmployee(data);
            }
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          submitText={editingEmployee ? 'Update Employee' : 'Add Employee'}
          initialData={editingEmployee || {}}
          loading={submitting}
        />
      )}
    </div>
  );
};

export default Employees; 
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, transactionFormFields } from '../../components/ui/form';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  reference: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Client Payment - Project Alpha',
      amount: 5000,
      type: 'income',
      category: 'Services',
      paymentMethod: 'Bank Transfer',
      reference: 'INV-001',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-14',
      description: 'Office Supplies',
      amount: 250,
      type: 'expense',
      category: 'Office',
      paymentMethod: 'Credit Card',
      reference: 'EXP-001',
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-13',
      description: 'Software Subscription',
      amount: 150,
      type: 'expense',
      category: 'Technology',
      paymentMethod: 'Credit Card',
      reference: 'EXP-002',
      status: 'pending'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || transaction.type === filterType;
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    const matchesStatus = !filterStatus || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const categories = ['Services', 'Office', 'Technology', 'Marketing', 'Travel', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal'];
  const statuses = ['completed', 'pending', 'cancelled'];

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.max(...transactions.map(t => t.id)) + 1
    };
    setTransactions([...transactions, newTransaction]);
    setShowAddModal(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your financial transactions and cash flow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netProfit.toLocaleString()}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
                  setFilterType('');
                  setFilterCategory('');
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

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.reference}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{transaction.category}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
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
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
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

      {/* Add/Edit Transaction Form */}
      {(showAddModal || editingTransaction) && (
        <Form
          fields={transactionFormFields}
          onSubmit={(data) => {
            if (editingTransaction) {
              handleEditTransaction({ ...editingTransaction, ...data });
            } else {
              handleAddTransaction(data);
            }
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingTransaction(null);
          }}
          title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          submitText={editingTransaction ? 'Update Transaction' : 'Add Transaction'}
          initialData={editingTransaction || {}}
        />
      )}
    </div>
  );
};

export default Transactions; 
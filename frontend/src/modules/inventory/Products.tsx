import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, productFormFields } from '../../components/ui/form';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  category: string;
  supplier: string;
  image?: string;
  status: 'active' | 'inactive';
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Laptop Dell XPS 13',
      sku: 'LAP-001',
      description: '13-inch laptop with Intel i7 processor',
      price: 1299,
      cost: 900,
      quantity: 15,
      minQuantity: 5,
      category: 'Electronics',
      supplier: 'Dell Inc.',
      status: 'active'
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      sku: 'ACC-001',
      description: 'Ergonomic wireless mouse',
      price: 45,
      cost: 25,
      quantity: 3,
      minQuantity: 10,
      category: 'Accessories',
      supplier: 'Logitech',
      status: 'active'
    },
    {
      id: 3,
      name: 'Office Chair',
      sku: 'FUR-001',
      description: 'Ergonomic office chair',
      price: 299,
      cost: 180,
      quantity: 8,
      minQuantity: 3,
      category: 'Furniture',
      supplier: 'Herman Miller',
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Electronics', 'Accessories', 'Furniture', 'Office Supplies', 'Software'];
  const statuses = ['active', 'inactive'];

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id)) + 1
    };
    setProducts([...products, newProduct]);
    setShowAddModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your inventory and product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
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

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            Showing {filteredProducts.length} of {products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">SKU</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center mr-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">${product.price}</div>
                      <div className="text-sm text-gray-500">Cost: ${product.cost}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{product.quantity}</div>
                      {product.quantity <= product.minQuantity && (
                        <div className="text-sm text-orange-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
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
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add/Edit Product Form */}
      {(showAddModal || editingProduct) && (
        <Form
          fields={productFormFields}
          onSubmit={(data) => {
            if (editingProduct) {
              handleEditProduct({ ...editingProduct, ...data });
            } else {
              handleAddProduct(data);
            }
          }}
          onCancel={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          submitText={editingProduct ? 'Update Product' : 'Add Product'}
          initialData={editingProduct || {}}
        />
      )}
    </div>
  );
};

export default Products; 
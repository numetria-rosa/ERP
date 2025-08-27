import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { X, Plus } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: (value: any) => string | null;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  title: string;
  submitText?: string;
  cancelText?: string;
  initialData?: any;
  loading?: boolean;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  onCancel,
  title,
  submitText = 'Submit',
  cancelText = 'Cancel',
  initialData = {},
  loading = false
}) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateField = (name: string, value: any): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field) return null;

    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(renderField)}
          
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Specific form configurations for different modules
export const employeeFormFields: FormField[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter first name'
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter last name'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter email address',
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email';
    }
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: 'Enter phone number'
  },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    required: true,
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' }
    ]
  },
  {
    name: 'position',
    label: 'Position',
    type: 'text',
    required: true,
    placeholder: 'Enter job title'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'text',
    placeholder: 'Enter employee role'
  },
  {
    name: 'salary',
    label: 'Salary',
    type: 'number',
    placeholder: 'Enter annual salary'
  },
  {
    name: 'hireDate',
    label: 'Hire Date',
    type: 'date',
    required: true
  }
];

export const productFormFields: FormField[] = [
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'Enter product name'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter product description'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'office-supplies', label: 'Office Supplies' },
      { value: 'furniture', label: 'Furniture' },
      { value: 'software', label: 'Software' }
    ]
  },
  {
    name: 'price',
    label: 'Price',
    type: 'number',
    required: true,
    placeholder: 'Enter price'
  },
  {
    name: 'stock',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: 'Enter stock quantity'
  },
  {
    name: 'sku',
    label: 'SKU',
    type: 'text',
    placeholder: 'Enter SKU code'
  }
];

export const transactionFormFields: FormField[] = [
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    placeholder: 'Enter transaction description'
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    placeholder: 'Enter amount'
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'income', label: 'Income' },
      { value: 'expense', label: 'Expense' }
    ]
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'sales', label: 'Sales' },
      { value: 'purchases', label: 'Purchases' },
      { value: 'salary', label: 'Salary' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Enter additional notes'
  }
];

export const customerFormFields: FormField[] = [
  {
    name: 'name',
    label: 'Customer Name',
    type: 'text',
    required: true,
    placeholder: 'Enter customer name'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter email address'
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: 'Enter phone number'
  },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Enter company name'
  },
  {
    name: 'position',
    label: 'Position',
    type: 'text',
    placeholder: 'Enter job position'
  },
  {
    name: 'source',
    label: 'Lead Source',
    type: 'select',
    required: true,
    options: [
      { value: 'website', label: 'Website' },
      { value: 'referral', label: 'Referral' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'cold-call', label: 'Cold Call' },
      { value: 'trade-show', label: 'Trade Show' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'lead', label: 'Lead' },
      { value: 'prospect', label: 'Prospect' },
      { value: 'customer', label: 'Customer' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  {
    name: 'value',
    label: 'Potential Value',
    type: 'number',
    placeholder: 'Enter potential deal value'
  }
]; 
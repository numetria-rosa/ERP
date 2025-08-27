import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'react-hot-toast';

interface ExportUtilityProps {
  dataType: 'employees' | 'customers' | 'products' | 'transactions' | 'projects' | 'reports';
  data?: any[];
  fileName?: string;
  className?: string;
}

const ExportUtility: React.FC<ExportUtilityProps> = ({
  dataType,
  data = [],
  fileName,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('excel');

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Import xlsx library dynamically
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = prepareDataForExport();
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, dataType);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const finalFileName = fileName || `${dataType}_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(workbook, finalFileName);
      
      toast.success(`${dataType} exported to Excel successfully!`);
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Import jsPDF library dynamically
      const jsPDF = await import('jspdf');
      const autoTable = await import('jspdf-autotable');
      
      const doc = new jsPDF.default();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`, 14, 22);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare data for table
      const exportData = prepareDataForExport();
      const headers = Object.keys(exportData[0] || {});
      const rows = exportData.map(item => headers.map(header => item[header]));
      
      // Add table
      autoTable.default(doc, {
        head: [headers],
        body: rows,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
        },
      });
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const finalFileName = fileName || `${dataType}_${timestamp}.pdf`;
      
      // Save file
      doc.save(finalFileName);
      
      toast.success(`${dataType} exported to PDF successfully!`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export to PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const prepareDataForExport = () => {
    if (data.length === 0) return [];

    switch (dataType) {
      case 'employees':
        return data.map(emp => ({
          'Employee ID': emp.id,
          'Name': `${emp.firstName} ${emp.lastName}`,
          'Email': emp.email,
          'Position': emp.position,
          'Department': emp.department?.name || 'N/A',
          'Status': emp.status,
          'Hire Date': new Date(emp.hireDate).toLocaleDateString(),
          'Salary': emp.salary ? `$${emp.salary.toLocaleString()}` : 'N/A'
        }));
      
      case 'customers':
        return data.map(cust => ({
          'Customer ID': cust.id,
          'Name': cust.name,
          'Email': cust.email,
          'Company': cust.company || 'N/A',
          'Phone': cust.phone || 'N/A',
          'Status': cust.status,
          'Total Orders': cust.invoices?.length || 0,
          'Total Spent': cust.invoices ? 
            `$${cust.invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0).toLocaleString()}` : 
            '$0'
        }));
      
      case 'products':
        return data.map(prod => ({
          'Product ID': prod.id,
          'Name': prod.name,
          'SKU': prod.sku,
          'Category': prod.category?.name || 'N/A',
          'Price': `$${prod.price.toLocaleString()}`,
          'Cost': prod.cost ? `$${prod.cost.toLocaleString()}` : 'N/A',
          'Stock': prod.stockQuantity || 0,
          'Status': prod.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'
        }));
      
      case 'transactions':
        return data.map(trans => ({
          'Transaction ID': trans.id,
          'Date': new Date(trans.date).toLocaleDateString(),
          'Type': trans.type,
          'Amount': `$${trans.amount.toLocaleString()}`,
          'Description': trans.description,
          'Category': trans.category || 'N/A',
          'Status': trans.status
        }));
      
      case 'projects':
        return data.map(proj => ({
          'Project ID': proj.id,
          'Name': proj.name,
          'Client': proj.client || 'Internal',
          'Status': proj.status,
          'Start Date': new Date(proj.startDate).toLocaleDateString(),
          'End Date': proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Ongoing',
          'Budget': proj.budget ? `$${proj.budget.toLocaleString()}` : 'N/A',
          'Progress': `${proj.progress || 0}%`
        }));
      
      default:
        return data;
    }
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="excel">
            <div className="flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </div>
          </SelectItem>
          <SelectItem value="pdf">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleExport}
        disabled={isExporting || data.length === 0}
        className="flex items-center"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );
};

export default ExportUtility; 
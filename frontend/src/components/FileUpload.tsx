import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  multiple = true,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  className = ''
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading'
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    try {
      await onUpload(acceptedFiles);
      
      // Update status to success
      setUploadFiles(prev => 
        prev.map(f => 
          acceptedFiles.includes(f.file) 
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );
    } catch (error) {
      // Update status to error
      setUploadFiles(prev => 
        prev.map(f => 
          acceptedFiles.includes(f.file) 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple,
    accept,
    maxSize,
    maxFiles
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <File className="w-4 h-4 text-blue-500" />;
    }
    if (file.type.includes('pdf')) {
      return <File className="w-4 h-4 text-red-500" />;
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return <File className="w-4 h-4 text-blue-600" />;
    }
    if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
      return <File className="w-4 h-4 text-green-600" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isDragActive 
            ? 'Drop the files here...' 
            : 'Drag & drop files here, or click to select files'
          }
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {multiple ? 'Multiple files allowed' : 'Single file only'} • 
          Max size: {formatFileSize(maxSize)} • 
          Max files: {maxFiles}
        </p>

        {isDragReject && (
          <p className="text-xs text-red-500 mt-2">
            Some files were rejected. Please check file types and sizes.
          </p>
        )}
      </div>

      {/* File List */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {uploadFiles.map((uploadFile) => (
              <motion.div
                key={uploadFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {getFileIcon(uploadFile.file)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {uploadFile.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}

                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload; 
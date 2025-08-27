import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, User, Clipboard, Package, Folder, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchGlobal } from '../services/api';

interface SearchResult {
  id: string;
  type: 'employee' | 'customer' | 'task' | 'product' | 'project';
  title: string;
  subtitle: string;
  description?: string;
  status?: string;
  url: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: () => searchGlobal(query),
    enabled: query.length >= 2 && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      if (result) {
        window.location.href = result.url;
        setIsOpen(false);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return <Users className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'task':
        return <Clipboard className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'project':
        return <Folder className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'employee':
        return 'Employee';
      case 'customer':
        return 'Customer';
      case 'task':
        return 'Task';
      case 'product':
        return 'Product';
      case 'project':
        return 'Project';
      default:
        return type;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ml-[60px]"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black bg-opacity-50">
      <div
        ref={searchRef}
        className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-900"
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employees, customers, tasks, products, projects..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result: SearchResult, index: number) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded dark:bg-gray-800 dark:text-gray-400">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.status && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded dark:bg-green-900/20 dark:text-green-400">
                          {result.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {result.subtitle}
                    </p>
                    {result.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <p>Use ↑↓ to navigate, Enter to select, Esc to close</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch; 
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface SortOptionsProps {
  onSort: (sortBy: 'date' | 'title', sortOrder: 'asc' | 'desc') => void;
  currentSort: {
    sortBy: 'date' | 'title' | null;
    sortOrder: 'asc' | 'desc' | null;
  };
}

const SortOptions: React.FC<SortOptionsProps> = ({ onSort, currentSort }) => {
  const handleSort = (field: 'date' | 'title') => {
    if (currentSort.sortBy === field) {
      // Toggle sort order if clicking the same field
      onSort(field, currentSort.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending order for new field
      onSort(field, 'asc');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-600">Sort by:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleSort('date')}
          className={`px-3 py-1 rounded-md flex items-center space-x-1 ${
            currentSort.sortBy === 'date'
              ? 'bg-pink-100 text-pink-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Date</span>
          {currentSort.sortBy === 'date' && (
            currentSort.sortOrder === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          )}
        </button>
        <button
          onClick={() => handleSort('title')}
          className={`px-3 py-1 rounded-md flex items-center space-x-1 ${
            currentSort.sortBy === 'title'
              ? 'bg-pink-100 text-pink-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Title</span>
          {currentSort.sortBy === 'title' && (
            currentSort.sortOrder === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          )}
        </button>
      </div>
    </div>
  );
};

export default SortOptions; 
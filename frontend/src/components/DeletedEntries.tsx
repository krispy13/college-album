import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DeletedEntry } from '../services/api';
import { PhotoStory } from '../types';
import { api } from '../services/api';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/solid';

interface DeletedEntriesProps {
  onRestoreEntry: (entry: PhotoStory) => void;
}

const DeletedEntries: React.FC<DeletedEntriesProps> = ({ onRestoreEntry }) => {
  const [deletedEntries, setDeletedEntries] = useState<DeletedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeletedEntries();
  }, []);

  const fetchDeletedEntries = async () => {
    try {
      const entries = await api.getDeletedEntries();
      setDeletedEntries(entries);
    } catch (err) {
      setError('Failed to fetch deleted entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const restoredEntry = await api.restoreEntry(id);
      setDeletedEntries(prev => prev.filter(entry => entry.id !== id));
      onRestoreEntry(restoredEntry);
    } catch (err) {
      setError('Failed to restore entry');
      console.error(err);
    }
  };

  const handleDeletePermanently = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this memory? This action cannot be undone.')) {
      try {
        await api.deleteBackupPermanently(id);
        setDeletedEntries(prev => prev.filter(entry => entry.id !== id));
      } catch (err) {
        setError('Failed to permanently delete entry');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-2xl text-amber-800 font-serif animate-pulse">Finding our lost memories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-2xl text-red-600 font-serif">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-200 to-gray-200 text-slate-700 rounded-full hover:from-slate-300 hover:to-gray-300 transition-all duration-300 font-serif text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-slate-300 mr-6"
            >
              <ArrowLeftIcon className="h-6 w-6 mr-2" />
              Back to our fridge
            </Link>
          </div>
          <h1 className="text-5xl font-serif font-bold text-amber-800 mb-4 drop-shadow-lg">
            Lost Memories
          </h1>
          <p className="text-xl text-amber-700 font-serif italic">
            Memories waiting to be found again
          </p>
        </div>

        {/* Empty State */}
        {deletedEntries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl text-amber-700 font-serif mb-4">No lost memories found</div>
            <p className="text-lg text-amber-600 font-serif">All your memories are safe on the fridge!</p>
          </div>
        )}

        {/* Deleted Memories Grid */}
        {deletedEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deletedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="group relative transform transition-all duration-500 hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Faded Magnet Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg shadow-lg transform rotate-3 scale-95 opacity-60 group-hover:rotate-6 transition-transform duration-300"></div>
                
                {/* Faded Polaroid Photo */}
                <div className="relative bg-white bg-opacity-70 rounded-lg shadow-xl p-4 transform -rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-2xl">
                  <div className="relative h-48 mb-4 overflow-hidden rounded">
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-lg font-serif font-bold text-gray-700 mb-2 line-clamp-1">
                      {entry.title}
                    </h2>
                    <p className="text-sm text-gray-600 font-serif mb-2">{entry.date}</p>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-serif">
                      {entry.story}
                    </p>
                    <p className="text-xs text-amber-600 font-serif mb-4">
                      Deleted on: {new Date(entry.deleted_at).toLocaleDateString()}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRestore(entry.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-200 to-emerald-200 text-green-700 rounded-lg hover:from-green-300 hover:to-emerald-300 transition-all duration-300 font-serif text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-300"
                      >
                        Restore Memory
                      </button>
                      <button
                        onClick={() => handleDeletePermanently(entry.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-200 to-pink-200 text-red-700 rounded-lg hover:from-red-300 hover:to-pink-300 transition-all duration-300 font-serif text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-red-300 flex items-center justify-center"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete Forever
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-amber-200 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-32 right-32 w-3 h-3 bg-orange-200 rounded-full animate-pulse opacity-30" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-30" style={{animationDelay: '2s'}}></div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DeletedEntries; 
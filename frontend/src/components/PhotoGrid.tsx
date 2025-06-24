import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhotoStory } from '../types';
import { TrashIcon, ArchiveBoxIcon, StarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api, SearchParams } from '../services/api';
import SearchBar from './SearchBar';
import SortOptions from './SortOptions';

interface PhotoGridProps {
  stories: PhotoStory[];
  onDeleteEntry: (id: number) => Promise<void>;
  onShowAddModal: () => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ stories: initialStories, onDeleteEntry, onShowAddModal }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<PhotoStory[]>(initialStories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentSort, setCurrentSort] = useState<{
    sortBy: 'date' | 'title' | null;
    sortOrder: 'asc' | 'desc' | null;
  }>({
    sortBy: null,
    sortOrder: null
  });

  useEffect(() => {
    console.log('PhotoGrid mounted with initial stories:', initialStories);
  }, [initialStories]);

  const handleSearch = async (params: SearchParams) => {
    console.log('Search triggered with params:', params);
    setLoading(true);
    try {
      const searchParams: SearchParams = {
        ...params,
        sortBy: currentSort.sortBy || undefined,
        sortOrder: currentSort.sortOrder || undefined,
        favoritesOnly: showFavoritesOnly
      };
      console.log('Making API call with search params:', searchParams);
      const results = await api.getEntries(searchParams);
      console.log('Search results received:', results);
      setStories(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async (sortBy: 'date' | 'title', sortOrder: 'asc' | 'desc') => {
    setCurrentSort({ sortBy, sortOrder });
    setLoading(true);
    try {
      const results = await api.getEntries({
        sortBy,
        sortOrder,
        favoritesOnly: showFavoritesOnly
      });
      setStories(results);
    } catch (err) {
      setError('Failed to sort entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const updatedStory = await api.toggleFavorite(id);
      setStories(prev => prev.map(story => 
        story.id === id ? updatedStory : story
      ));
    } catch (err) {
      setError('Failed to update favorite status');
      console.error(err);
    }
  };

  const toggleFavoritesFilter = async () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setLoading(true);
    try {
      const results = await api.getEntries({
        favoritesOnly: !showFavoritesOnly,
        sortBy: currentSort.sortBy || undefined,
        sortOrder: currentSort.sortOrder || undefined
      });
      setStories(results);
    } catch (err) {
      setError('Failed to filter favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm('Are you sure you want to delete this memory? It will be backed up.')) {
      await onDeleteEntry(id);
      setStories(prev => prev.filter(story => story.id !== id));
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fridge Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 opacity-90"></div>
      
      {/* Fridge Door Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
      
      {/* Fridge Handle */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-32 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-lg"></div>
      
      {/* Fridge Door Frame */}
      <div className="absolute inset-0 border-8 border-slate-300 rounded-lg m-4 shadow-2xl"></div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-serif text-amber-800 mb-4 drop-shadow-lg">
            The Scrapbook
          </h1>
          <p className="text-xl text-amber-700 font-serif italic">
            Memories stuck to our fridge with love
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={toggleFavoritesFilter}
            className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center font-serif text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
              showFavoritesOnly
                ? 'bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800 border-2 border-amber-300'
                : 'bg-gradient-to-r from-slate-200 to-gray-200 text-slate-700 border-2 border-slate-300 hover:from-slate-300 hover:to-gray-300'
            }`}
          >
            <StarIconSolid className="w-6 h-6 mr-2" />
            {showFavoritesOnly ? 'Show All Memories' : 'Show Favorites'}
          </button>
          
          <Link
            to="/deleted"
            className="px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full hover:from-amber-200 hover:to-orange-200 transition-all duration-300 flex items-center font-serif text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-amber-200"
          >
            <ArchiveBoxIcon className="w-6 h-6 mr-2" />
            Deleted Memories
          </Link>
          
          <button
            onClick={onShowAddModal}
            className="px-6 py-3 bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 rounded-full hover:from-pink-300 hover:to-rose-300 transition-all duration-300 flex items-center font-serif text-lg shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-pink-300"
          >
            <PlusIcon className="w-6 h-6 mr-2" />
            Add New Memory
          </button>
        </div>

        {/* Search and Sort */}
        <div className="max-w-4xl mx-auto mb-8">
          <SearchBar onSearch={handleSearch} />
          <div className="mt-4">
            <SortOptions onSort={handleSort} currentSort={currentSort} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-2xl text-amber-700 font-serif animate-pulse">Finding our memories...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-2xl text-red-600 font-serif">{error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl text-amber-700 font-serif">No memories found on our fridge yet</div>
            <p className="text-lg text-amber-600 mt-2">Add your first memory to get started!</p>
          </div>
        )}

        {/* Fridge Magnets Grid */}
        {!loading && !error && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stories.map((story, index) => {
              const imageUrl = story.imageUrl;
              console.log(`Rendering story ${story.id} with image URL:`, imageUrl);
              
              return (
                <div 
                  key={story.id} 
                  className="group relative transform transition-all duration-500 hover:scale-110 hover:rotate-2"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Magnet Base */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-lg transform rotate-3 scale-95 opacity-80 group-hover:rotate-6 transition-transform duration-300"></div>
                  
                  {/* Polaroid Photo */}
                  <Link
                    to={`/story/${story.id}`}
                    className="block relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-lg shadow-xl p-4 transform -rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-2xl border-2 border-amber-200 min-w-[280px]"
                  >
                    <div className="relative h-48 mb-4 overflow-hidden rounded">
                      <img
                        src={imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={() => console.log(`Image loaded successfully for story ${story.id}`)}
                        onError={(e) => console.error(`Image failed to load for story ${story.id}:`, e)}
                      />
                    </div>
                    
                    <div className="text-center">
                      <h2 className="text-lg font-serif font-bold text-amber-800 mb-2 line-clamp-1">{story.title}</h2>
                      <p className="text-sm text-amber-700 font-serif mb-2">{story.date}</p>
                      <p className="text-xs text-amber-600 mt-2 line-clamp-2 font-serif leading-relaxed">{story.story}</p>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleFavorite(story.id);
                      }}
                      className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                        story.is_favorite
                          ? 'bg-gradient-to-r from-yellow-200 to-amber-200 text-yellow-700 hover:from-yellow-300 hover:to-amber-300'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                      title={story.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {story.is_favorite ? (
                        <StarIconSolid className="w-4 h-4" />
                      ) : (
                        <StarIcon className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => handleDelete(e, story.id)}
                      className="p-2 bg-gradient-to-r from-red-200 to-pink-200 text-red-700 rounded-full hover:from-red-300 hover:to-pink-300 transition-all duration-200 shadow-lg"
                      title="Delete memory"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default PhotoGrid; 
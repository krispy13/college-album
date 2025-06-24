import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PhotoGrid from './components/PhotoGrid';
import StoryPage from './components/StoryPage';
import AddEntry from './components/AddEntry';
import DeletedEntries from './components/DeletedEntries';
import { PhotoStory } from './types';
import { api } from './services/api';

function App() {
  const [stories, setStories] = useState<PhotoStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      console.log('App: Starting to fetch stories');
      try {
        const data = await api.getEntries();
        console.log('App: Received stories:', data);
        console.log('App: First story imageUrl:', data[0]?.imageUrl);
        setStories(data);
      } catch (err) {
        console.error('App: Failed to fetch stories:', err);
        setError('Failed to fetch stories');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleAddEntry = async (newEntry: Omit<PhotoStory, 'id'>, file: File) => {
    try {
      // The AddEntry component already calls api.createEntry, so we just need to refresh the list
      const data = await api.getEntries();
      setStories(data);
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to create new entry');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await api.deleteEntry(id);
      setStories(prevStories => prevStories.filter(story => story.id !== id));
    } catch (err) {
      setError('Failed to delete entry');
      console.error(err);
    }
  };

  const handleRestoreEntry = (restoredEntry: PhotoStory) => {
    setStories(prevStories => [...prevStories, restoredEntry]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-2xl text-amber-800 font-serif animate-pulse">Loading our memories...</div>
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
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-amber-200 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-orange-200 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-200 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <Routes>
          <Route path="/" element={
            <>
              <div className={showAddModal ? 'opacity-30 pointer-events-none transition-opacity duration-300' : ''}>
                <PhotoGrid stories={stories} onDeleteEntry={handleDeleteEntry} onShowAddModal={() => setShowAddModal(true)} />
              </div>
              {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                    <button 
                      onClick={() => setShowAddModal(false)} 
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl transition-colors duration-200"
                    >
                      ×
                    </button>
                    <AddEntry onEntryAdded={handleAddEntry} />
                  </div>
                </div>
              )}
            </>
          } />
          <Route path="/story/:id" element={<StoryPage stories={stories} onDeleteEntry={handleDeleteEntry} />} />
          <Route path="/deleted" element={<DeletedEntries onRestoreEntry={handleRestoreEntry} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

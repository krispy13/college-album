import React, { useState } from 'react';
import { PhotoStory } from '../types';
import { api } from '../services/api';

interface AddEntryProps {
  onEntryAdded: (entry: Omit<PhotoStory, 'id'>, file: File) => Promise<void>;
}

const AddEntry: React.FC<AddEntryProps> = ({ onEntryAdded }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [story, setStory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File change event:', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.type, file.size);
      setFile(file);
      const url = URL.createObjectURL(file);
      console.log('Created preview URL:', url);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting form with file:', file.name);
      const newEntry = await api.createEntry(
        {
          title,
          date,
          story,
          imageUrl: '', // This will be set by the backend
          is_favorite: false,
          is_deleted: false
        },
        file
      );
      console.log('Entry created successfully:', newEntry);
      await onEntryAdded(newEntry, file);
      setTitle('');
      setDate('');
      setStory('');
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif font-bold text-amber-800 mb-2">Add New Memory</h2>
        <p className="text-lg text-amber-700 font-serif italic">Capture a moment to stick on our fridge</p>
      </div>
      
      <div className="relative">
        {/* Paper Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl shadow-2xl transform rotate-1"></div>
        
        {/* Crumpled Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_70%_80%,rgba(139,69,19,0.1)_1px,transparent_1px)] bg-[length:20px_20px,15px_15px] rounded-3xl"></div>
        
        <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-2 border-amber-200">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-serif font-semibold text-amber-800 mb-2">Memory Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white bg-opacity-80 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300 font-serif text-lg"
                placeholder="Give your memory a name..."
                required
              />
            </div>
            
            <div>
              <label className="block text-lg font-serif font-semibold text-amber-800 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white bg-opacity-80 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300 font-serif text-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-lg font-serif font-semibold text-amber-800 mb-2">Your Story</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white bg-opacity-80 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300 font-serif text-lg resize-none"
                rows={6}
                placeholder="Write about this special moment..."
                required
              />
            </div>
            
            <div>
              <label className="block text-lg font-serif font-semibold text-amber-800 mb-2">Photo</label>
              <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-amber-600 hover:text-amber-800 transition-colors duration-300">
                    <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-lg font-serif">Click to upload a photo</p>
                    <p className="text-sm text-amber-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-4 text-center">
                  <div className="inline-block relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-xs rounded-xl shadow-lg border-4 border-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors duration-200"
                      title="Remove photo"
                    >
                      ×
                    </button>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"></div>
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-red-600 text-center font-serif bg-red-50 rounded-xl p-4 border-2 border-red-200">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 rounded-xl hover:from-pink-300 hover:to-rose-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-serif text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-pink-300"
            >
              {isSubmitting ? 'Adding to our fridge...' : 'Add Memory to Fridge'}
            </button>
          </div>
        </form>
        
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full shadow-lg transform rotate-45"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full shadow-lg transform -rotate-12"></div>
      </div>
    </div>
  );
};

export default AddEntry; 
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PhotoStory } from '../types';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/solid';

// Add Google Fonts import for Dancing Script
const dancingScriptFont = document.createElement('link');
dancingScriptFont.rel = 'stylesheet';
dancingScriptFont.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
document.head.appendChild(dancingScriptFont);

interface StoryPageProps {
  stories: PhotoStory[];
  onDeleteEntry: (id: number) => Promise<void>;
}

const StoryPage: React.FC<StoryPageProps> = ({ stories, onDeleteEntry }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = stories.find(s => s.id === Number(id));

  useEffect(() => {
    // No-op, just for logging
  }, [id, story, stories]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this memory? It will be backed up.')) {
      await onDeleteEntry(Number(id));
      navigate('/');
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-amber-800 mb-4">Memory not found</h1>
          <Link to="/" className="text-amber-600 hover:text-amber-800 font-serif text-lg">
            Return to our fridge
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = story.imageUrl;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#ede3c4', backgroundImage: `url('https://www.transparenttextures.com/patterns/noise.png'), url('https://www.transparenttextures.com/patterns/old-paper.png')`}}>
      <div className="relative max-w-5xl w-full flex flex-col items-center bg-[#f8f5ed] border border-[#b6a77a] rounded-[18px] shadow-xl p-12 md:p-20" style={{boxShadow: '0 0 60px 10px #b6a77a55'}}>
        {/* Top border line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b6a77a] rounded-t-[18px]" />
        {/* Main content */}
        <div className="relative z-30 flex flex-col items-center w-full" style={{minHeight: '600px'}}>
          {/* Back button */}
          <div className="absolute left-6 top-6">
            <Link
              to="/"
              className="inline-flex items-center px-5 py-2 bg-[#f8f5ed] text-[#222] border border-[#b6a77a] rounded-full hover:bg-[#ede3c4] transition-all duration-300 font-serif text-lg shadow-md"
            >
              <ArrowLeftIcon className="h-6 w-6 mr-2" />
              Back
            </Link>
          </div>
          {/* Photo */}
          <div className="mb-8 mt-4">
            <div className="inline-block bg-[#f8f5ed] p-3 rounded-2xl shadow border border-[#b6a77a]">
              <img
                src={imageUrl}
                alt={story.title}
                className="w-96 h-80 object-cover rounded-xl shadow border-2 border-[#b6a77a]"
              />
            </div>
          </div>
          {/* Title and date */}
          <h1 className="text-5xl font-serif font-bold uppercase tracking-wide text-[#222] mb-2 text-center" style={{letterSpacing: '0.04em'}}>{story.title}</h1>
          <div className="w-full flex justify-center mb-8">
            <span className="text-md font-serif italic text-[#7c6a3a] px-4 py-2 border-b border-[#b6a77a] bg-[#f8f5ed]" style={{letterSpacing: '0.08em'}}>
              {story.date}
            </span>
          </div>
          {/* Story content */}
          <div className="w-full max-w-2xl mx-auto bg-transparent">
            {story.story.split('\n').map((paragraph, index) => (
              <p
                key={index}
                className="mb-6 text-xl leading-relaxed font-serif text-[#2d1c0f]"
                style={{fontWeight: 400, letterSpacing: '0.01em'}}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {/* Bottom border line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b6a77a] rounded-b-[18px]" />
      </div>
    </div>
  );
};

export default StoryPage; 
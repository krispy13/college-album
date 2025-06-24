export interface PhotoStory {
  id: number;
  title: string;
  imageUrl?: string;
  story: string;
  date: string;
  is_deleted: boolean;
  is_favorite: boolean;
}

export interface PhotoGridProps {
  stories: PhotoStory[];
  onDeleteEntry: (id: number) => Promise<void>;
}

export interface StoryPageProps {
  stories: PhotoStory[];
  onDeleteEntry: (id: number) => Promise<void>;
} 
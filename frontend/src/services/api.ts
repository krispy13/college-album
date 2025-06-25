import { PhotoStory } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface DeletedEntry extends PhotoStory {
  original_id: number;
  deleted_at: string;
}

export interface SearchParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  favoritesOnly?: boolean;
}

export const api = {
  async getEntries(params?: SearchParams): Promise<PhotoStory[]> {
    console.log('API: Fetching entries with params:', params);
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);
    if (params?.favoritesOnly) queryParams.append('favoritesOnly', 'true');

    const url = `${API_URL}/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('API: Making request to:', url);
    console.log('API: Base URL:', API_URL);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('API: Failed to fetch entries:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error('Failed to fetch entries');
    }
    const data = await response.json();
    // Map image_url to imageUrl - now using base64 data directly
    const mappedData = data.map((entry: any) => ({
      ...entry,
      imageUrl: entry.image_url || undefined,
    }));
    console.log('API: Received entries:', mappedData);
    console.log('API: First entry imageUrl:', mappedData[0]?.imageUrl);
    return mappedData;
  },

  async getEntry(id: number): Promise<PhotoStory> {
    const response = await fetch(`${API_URL}/entries/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch entry');
    }
    const entry = await response.json();
    // Map image_url to imageUrl - now using base64 data directly
    return {
      ...entry,
      imageUrl: entry.image_url || undefined,
    };
  },

  async createEntry(entry: Omit<PhotoStory, 'id'>, file: File): Promise<PhotoStory> {
    console.log('API: Creating new entry:', entry);
    const formData = new FormData();
    formData.append('title', entry.title);
    formData.append('date', entry.date);
    formData.append('story', entry.story);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/entries`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('API: Failed to create entry:', response.status, response.statusText);
      throw new Error('Failed to create entry');
    }

    const data = await response.json();
    console.log('API: Entry created successfully:', data);
    return data;
  },

  async updateEntry(id: number, entry: Omit<PhotoStory, 'id'>, file?: File): Promise<PhotoStory> {
    console.log('API: Updating entry:', entry);
    const formData = new FormData();
    formData.append('title', entry.title);
    formData.append('date', entry.date);
    formData.append('story', entry.story);
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      console.error('API: Failed to update entry:', response.status, response.statusText);
      throw new Error('Failed to update entry');
    }

    const data = await response.json();
    console.log('API: Entry updated successfully:', data);
    return data;
  },

  async deleteEntry(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete entry');
    }
  },

  async getDeletedEntries(): Promise<DeletedEntry[]> {
    const response = await fetch(`${API_URL}/deleted-entries/`);
    if (!response.ok) {
      throw new Error('Failed to fetch deleted entries');
    }
    const data = await response.json();
    // Map image_url to imageUrl - now using base64 data directly
    const mappedData = data.map((entry: any) => ({
      ...entry,
      imageUrl: entry.image_url || undefined,
    }));
    return mappedData;
  },

  async restoreEntry(id: number): Promise<PhotoStory> {
    const response = await fetch(`${API_URL}/deleted-entries/${id}/restore`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to restore entry');
    }
    const entry = await response.json();
    // Map image_url to imageUrl - now using base64 data directly
    return {
      ...entry,
      imageUrl: entry.image_url || undefined,
    };
  },

  async deleteBackupPermanently(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/deleted-entries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to permanently delete entry');
    }
  },

  async toggleFavorite(id: number): Promise<PhotoStory> {
    const response = await fetch(`${API_URL}/entries/${id}/favorite`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }
    const entry = await response.json();
    // Map image_url to imageUrl - now using base64 data directly
    return {
      ...entry,
      imageUrl: entry.image_url || undefined,
    };
  },

  async uploadFile(file: File): Promise<{ filename: string }> {
    console.log('API: Uploading file:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('API: File upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    console.log('API: File upload successful, received filename:', data.filename);
    return data;
  },
}; 
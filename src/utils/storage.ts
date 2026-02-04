// Общее хранилище данных для всех игр
export interface GameProgress {
  numberRacing?: any;
  readingGame?: any;
}

export interface PlayerProfile {
  id: string;
  name: string;
  character: string;
  stars: number;
  totalStars: number; // Общие звезды со всех игр
  gameProgress: GameProgress;
  stats: Record<string, any>;
  createdAt: string;
}

// Конфигурация API
const API_URL = '/api';

// Вспомогательная функция для API запросов
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const storage = {
  async getProfiles(): Promise<PlayerProfile[]> {
    try {
      return await fetchAPI('/profiles');
    } catch (e) {
      console.error('Error loading profiles:', e);
      return [];
    }
  },

  async getCurrentProfile(): Promise<PlayerProfile | null> {
    try {
      return await fetchAPI('/current-profile');
    } catch (e) {
      console.error('Error loading current profile:', e);
      return null;
    }
  },

  async setCurrentProfile(profileId: string): Promise<void> {
    try {
      await fetchAPI('/current-profile', {
        method: 'POST',
        body: JSON.stringify({ profileId }),
      });
    } catch (e) {
      console.error('Error setting current profile:', e);
    }
  },

  async updateProfile(profile: PlayerProfile): Promise<void> {
    try {
      await fetchAPI(`/profiles/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  },

  async createProfile(name: string, character: string): Promise<PlayerProfile> {
    try {
      return await fetchAPI('/profiles', {
        method: 'POST',
        body: JSON.stringify({ name, character }),
      });
    } catch (e) {
      console.error('Error creating profile:', e);
      throw e;
    }
  },

  async deleteProfile(profileId: string): Promise<void> {
    try {
      await fetchAPI(`/profiles/${profileId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Error deleting profile:', e);
    }
  }
};

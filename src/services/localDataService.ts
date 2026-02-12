import { User } from '../types';
import { mockUsers } from '../data/mockData';

const ADVERTISERS_KEY = 'safeconnect_advertisers';

export interface AdvertiserFilters {
  gender?: string;
  department?: string;
  city?: string;
  neighborhood?: string;
  specificZone?: string;
  ageMin?: number;
  ageMax?: number;
  priceMin?: number;
  priceMax?: number;
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
  premiumOnly?: boolean;
}

// Inicializar datos mock en localStorage si no existen
function initData(): User[] {
  const existing = localStorage.getItem(ADVERTISERS_KEY);
  if (existing) {
    return JSON.parse(existing);
  }
  localStorage.setItem(ADVERTISERS_KEY, JSON.stringify(mockUsers));
  return mockUsers;
}

export const localDataService = {
  getAdvertisers(filters?: AdvertiserFilters): User[] {
    let data = initData();

    if (!filters) return data.filter(u => !u.isVip);

    if (filters.gender && filters.gender !== '') {
      // filter by gender field if it exists
    }

    if (filters.verifiedOnly) {
      data = data.filter(u => u.verified);
    }

    if (filters.onlineOnly) {
      data = data.filter(u => u.online);
    }

    if (filters.premiumOnly) {
      data = data.filter(u => u.premium);
    }

    if (filters.ageMin) {
      data = data.filter(u => (u.age || 18) >= (filters.ageMin || 18));
    }

    if (filters.ageMax && filters.ageMax < 65) {
      data = data.filter(u => (u.age || 18) <= (filters.ageMax || 65));
    }

    return data.filter(u => !u.isVip);
  },

  getVipAdvertisers(): User[] {
    const data = initData();
    return data.filter(u => u.isVip);
  },

  getAdvertiserById(id: string): User | null {
    const data = initData();
    return data.find(u => u.id === id || u.uid === id) || null;
  },

  addAdvertiser(advertiser: User): void {
    const data = initData();
    data.push(advertiser);
    localStorage.setItem(ADVERTISERS_KEY, JSON.stringify(data));
  },

  updateAdvertiser(id: string, updates: Partial<User>): User | null {
    const data = initData();
    const index = data.findIndex(u => u.id === id || u.uid === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates };
    localStorage.setItem(ADVERTISERS_KEY, JSON.stringify(data));
    return data[index];
  },

  deleteAdvertiser(id: string): boolean {
    const data = initData();
    const filtered = data.filter(u => u.id !== id && u.uid !== id);
    if (filtered.length === data.length) return false;
    localStorage.setItem(ADVERTISERS_KEY, JSON.stringify(filtered));
    return true;
  }
};

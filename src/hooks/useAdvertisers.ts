import { useState, useEffect } from 'react';
import { localDataService, AdvertiserFilters } from '../services/localDataService';
import { User } from '../types';

export { type AdvertiserFilters } from '../services/localDataService';

export const useAdvertisers = (filters?: AdvertiserFilters) => {
  const [advertisers, setAdvertisers] = useState<User[]>([]);
  const [vipAdvertisers, setVipAdvertisers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [JSON.stringify(filters)]);

  const loadData = () => {
    try {
      setLoading(true);
      setError(null);
      const data = localDataService.getAdvertisers(filters);
      const vip = localDataService.getVipAdvertisers();
      setAdvertisers(data);
      setVipAdvertisers(vip);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar anunciantes');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadData();

  return {
    advertisers,
    vipAdvertisers,
    loading,
    error,
    refresh
  };
};

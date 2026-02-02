import { useQuery } from '@tanstack/react-query';
import { fetchWeatherRecords, fetchWeatherRecord } from '../services/api';
import type { RecordStatus } from '../types/weather';

/**
 * Hook for fetching paginated weather records
 */
export function useWeatherRecords(params: {
  page?: number;
  limit?: number;
  status?: RecordStatus;
  stationId?: number;
} = {}) {
  return useQuery({
    queryKey: ['weather', 'list', params],
    queryFn: () => fetchWeatherRecords(params),
  });
}

/**
 * Hook for fetching a single weather record
 */
export function useWeatherRecord(id: string | undefined) {
  return useQuery({
    queryKey: ['weather', 'detail', id],
    queryFn: () => fetchWeatherRecord(id!),
    enabled: !!id,
  });
}

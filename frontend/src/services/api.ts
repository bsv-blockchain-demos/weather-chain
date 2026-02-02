import type { WeatherRecord, PaginatedResponse, BeefProof, RecordStatus } from '../types/weather';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Fetch weather records with pagination and filtering
 */
export async function fetchWeatherRecords(params: {
  page?: number;
  limit?: number;
  status?: RecordStatus;
  stationId?: number;
} = {}): Promise<PaginatedResponse<WeatherRecord>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.stationId) searchParams.set('stationId', params.stationId.toString());

  const url = `${API_BASE}/api/weather?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch weather records: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single weather record by ID
 */
export async function fetchWeatherRecord(id: string): Promise<WeatherRecord> {
  const response = await fetch(`${API_BASE}/api/weather/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Weather record not found');
    }
    throw new Error(`Failed to fetch weather record: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch BEEF proof for a transaction
 */
export async function fetchBeefProof(txid: string): Promise<BeefProof> {
  const response = await fetch(`${API_BASE}/api/proof/${txid}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Transaction not found or not yet mined');
    }
    throw new Error(`Failed to fetch BEEF proof: ${response.statusText}`);
  }

  return response.json();
}

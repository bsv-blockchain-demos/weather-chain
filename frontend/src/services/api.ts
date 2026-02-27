import type { WeatherRecord, PaginatedResponse, BeefProof, RecordStatus, DashboardResponse, StationSummary } from '../types/weather';

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

/**
 * Fetch dashboard data: global stats + paginated station list
 */
export async function fetchDashboard(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<DashboardResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/stations?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
  }

  return response.json();
}

export interface VerifyResult {
  confirmed: boolean;
  blockHeight: number | null;
}

/**
 * Batch-verify one or more txids in a single backend round-trip.
 * The backend fans out WoC queries concurrently and persists blockHeights.
 * Returns a Record<txid, VerifyResult> for O(1) lookup.
 */
export async function fetchVerification(
  txids: string[]
): Promise<Record<string, VerifyResult>> {
  const response = await fetch(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txids }),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify transactions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single station's metadata and summary
 */
export async function fetchStation(stationId: number): Promise<StationSummary> {
  const response = await fetch(`${API_BASE}/api/stations/${stationId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Station not found');
    }
    throw new Error(`Failed to fetch station: ${response.statusText}`);
  }

  return response.json();
}

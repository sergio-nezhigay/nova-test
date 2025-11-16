import type { Settlement, Warehouse } from './nova-poshta';

/**
 * API endpoint response types for client-side usage
 */

export interface CitiesApiResponse {
  data: Settlement[];
  success: boolean;
  error?: string;
}

export interface WarehousesApiResponse {
  data: Warehouse[];
  success: boolean;
  error?: string;
}

export interface HealthApiResponse {
  status: 'ok' | 'misconfigured';
  message: string;
  timestamp: string;
}

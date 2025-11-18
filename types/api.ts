import type { Settlement, Warehouse, InternetDocument } from './nova-poshta';

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

export interface CreateDeclarationRequest {
  // Sender
  senderCity: string;
  senderCityRef: string;
  senderWarehouseRef: string;
  senderPhone: string;
  senderName: string;

  // Recipient
  recipientCity: string;
  recipientCityRef: string;
  recipientWarehouseRef: string;
  recipientPhone: string;
  recipientName: string;

  // Parcel
  description: string;
  weight: string;
  seatsAmount: string;
  cost: string;
  payerType: 'Sender' | 'Recipient';
  paymentMethod: 'Cash' | 'NonCash';
}

export interface CreateDeclarationResponse {
  success: boolean;
  data?: InternetDocument;
  error?: string;
}

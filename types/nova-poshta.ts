/**
 * Nova Poshta API Types
 * Base types for API requests and responses
 */

export interface NovaPoshtaApiRequest {
  apiKey: string;
  modelName: string;
  calledMethod: string;
  methodProperties: Record<string, unknown>;
}

export interface NovaPoshtaApiResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: string[];
  messageCodes: string[];
  errorCodes: string[];
  warningCodes: string[];
  infoCodes: string[];
}

export interface City {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Area: string;
  AreaDescription: string;
  Region: string;
  RegionDescription: string;
}

export interface Settlement {
  Ref: string;
  MainDescription: string;
  Area: string;
  AreaDescription: string;
  Region: string;
  RegionDescription: string;
  ParentRegionTypes: string;
  ParentRegionCode: string;
}

export interface Warehouse {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  ShortAddress: string;
  ShortAddressRu: string;
  Phone: string;
  TypeOfWarehouse: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  SettlementRef: string;
  SettlementDescription: string;
}

/**
 * API Response wrapper for client-side consumption
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Search settlements response structure
 * The API returns nested Addresses array
 */
export interface SearchSettlementsResponse {
  TotalCount: number;
  Addresses: Settlement[];
}

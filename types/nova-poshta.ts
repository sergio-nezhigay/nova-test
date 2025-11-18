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
  DeliveryCityRef: string;
  DeliveryCity: string;
  SettlementTypeCode: string;
  SettlementType: string;
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

/**
 * Internet Document (Declaration) Types
 */

export interface CreateInternetDocumentRequest {
  NewAddress: string;
  PayerType: 'Sender' | 'Recipient' | 'ThirdPerson';
  PaymentMethod: 'Cash' | 'NonCash';
  CargoType: 'Cargo' | 'Documents' | 'Parcel' | 'TiresWheels';
  VolumeGeneral?: string;
  Weight: string;
  ServiceType:
    | 'WarehouseWarehouse'
    | 'WarehouseDoors'
    | 'DoorsWarehouse'
    | 'DoorsDoors';
  SeatsAmount: string;
  Description: string;
  Cost: string;
  CitySender: string;
  Sender: string;
  SenderAddress: string;
  ContactSender: string;
  SendersPhone: string;
  CityRecipient: string;
  Recipient: string;
  RecipientAddress: string;
  ContactRecipient: string;
  RecipientsPhone: string;
}

export interface InternetDocument {
  Ref: string;
  CostOnSite: string;
  EstimatedDeliveryDate: string;
  IntDocNumber: string;
  TypeDocument: string;
}

export interface CounterpartyContact {
  Ref: string;
  Description: string;
  Phones: string;
}

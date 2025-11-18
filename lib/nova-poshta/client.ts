import type {
  NovaPoshtaApiRequest,
  NovaPoshtaApiResponse,
  City,
  Settlement,
  Warehouse,
  SearchSettlementsResponse,
  CreateInternetDocumentRequest,
  InternetDocument,
} from '@/types/nova-poshta';

const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

/**
 * Base function to call Nova Poshta API
 * This should only be used server-side where API key is available
 */
async function callNovaPoshtaApi<T>(
  apiKey: string,
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<NovaPoshtaApiResponse<T>> {
  const requestBody: NovaPoshtaApiRequest = {
    apiKey,
    modelName,
    calledMethod,
    methodProperties,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Nova Poshta API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Search for cities by partial name (Ukrainian)
 * Uses searchSettlements method for better autocomplete support
 */
export async function searchCities(
  apiKey: string,
  query: string
): Promise<Settlement[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const response = await callNovaPoshtaApi<SearchSettlementsResponse>(
    apiKey,
    'Address',
    'searchSettlements',
    {
      CityName: query,
      Limit: 20,
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to search cities');
  }

  return response.data[0]?.Addresses || [];
}

/**
 * Get cities by string (alternative method)
 * Uses getCities method
 */
export async function getCitiesByString(
  apiKey: string,
  query: string
): Promise<City[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const response = await callNovaPoshtaApi<City>(
    apiKey,
    'Address',
    'getCities',
    {
      FindByString: query,
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get cities');
  }

  return response.data;
}

/**
 * Get warehouses for a specific settlement
 * @param settlementRef - Settlement reference ID from search results
 */
export async function getWarehouses(
  apiKey: string,
  settlementRef: string
): Promise<Warehouse[]> {
  if (!settlementRef) {
    return [];
  }

  const response = await callNovaPoshtaApi<Warehouse>(
    apiKey,
    'Address',
    'getWarehouses',
    {
      SettlementRef: settlementRef,
      Language: 'UA',
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get warehouses');
  }

  return response.data;
}

/**
 * Get warehouse by city name (alternative method)
 */
export async function getWarehousesByCityName(
  apiKey: string,
  cityName: string
): Promise<Warehouse[]> {
  if (!cityName) {
    return [];
  }

  const response = await callNovaPoshtaApi<Warehouse>(
    apiKey,
    'Address',
    'getWarehouses',
    {
      CityName: cityName,
      Language: 'UA',
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get warehouses');
  }

  return response.data;
}

/**
 * Create Internet Document (Declaration)
 * Note: This is a simplified version. Production use requires valid
 * Sender/Recipient/ContactSender/ContactRecipient Refs from counterparty data
 */
export async function createInternetDocument(
  apiKey: string,
  request: CreateInternetDocumentRequest
): Promise<InternetDocument> {
  const response = await callNovaPoshtaApi<InternetDocument>(
    apiKey,
    'InternetDocument',
    'save',
    request as unknown as Record<string, unknown>
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(
      response.errors.join(', ') || 'Failed to create declaration'
    );
  }

  return response.data[0];
}

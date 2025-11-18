import type { Warehouse } from '@/types/nova-poshta';

/**
 * Filter warehouses by search query
 * Searches in Description, ShortAddress, and Number fields
 */
export function filterWarehouses(
  warehouses: Warehouse[],
  query: string
): Warehouse[] {
  if (!query.trim()) {
    return warehouses;
  }

  const searchTerm = query.toLowerCase().trim();

  return warehouses.filter((warehouse) => {
    const description = warehouse.Description?.toLowerCase() || '';
    const shortAddress = warehouse.ShortAddress?.toLowerCase() || '';
    const number = warehouse.Number?.toLowerCase() || '';

    return (
      description.includes(searchTerm) ||
      shortAddress.includes(searchTerm) ||
      number.includes(searchTerm)
    );
  });
}

/**
 * Group warehouses by type
 */
export function groupWarehousesByType(
  warehouses: Warehouse[]
): Record<string, Warehouse[]> {
  return warehouses.reduce((groups, warehouse) => {
    const type = warehouse.TypeOfWarehouse || 'Інше';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(warehouse);
    return groups;
  }, {} as Record<string, Warehouse[]>);
}

/**
 * Sort warehouses by number
 */
export function sortWarehousesByNumber(warehouses: Warehouse[]): Warehouse[] {
  return [...warehouses].sort((a, b) => {
    const numA = parseInt(a.Number) || 0;
    const numB = parseInt(b.Number) || 0;
    return numA - numB;
  });
}

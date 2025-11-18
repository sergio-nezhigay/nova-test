'use client';

import { useState, useMemo } from 'react';
import { useWarehouses } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  filterWarehouses,
  sortWarehousesByNumber,
} from '@/lib/warehouse-utils';
import type { Warehouse } from '@/types/nova-poshta';

interface WarehouseSelectorProps {
  cityRef: string | null;
  cityName?: string;
  onWarehouseSelect: (warehouse: Warehouse) => void;
  selectedWarehouse: Warehouse | null;
  className?: string;
}

export function WarehouseSelector({
  cityRef,
  cityName,
  onWarehouseSelect,
  selectedWarehouse,
  className,
}: WarehouseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { warehouses, loading, error } = useWarehouses(cityRef);

  // Filter and sort warehouses
  const filteredWarehouses = useMemo(() => {
    const filtered = filterWarehouses(warehouses, searchQuery);
    return sortWarehousesByNumber(filtered);
  }, [warehouses, searchQuery]);

  if (!cityRef) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className='text-lg font-semibold text-gray-900'>
          Відділення Nova Poshta
        </h3>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
          <p className='text-gray-600'>
            Спочатку оберіть місто для перегляду відділень
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Відділення Nova Poshta
        </h3>
        {cityName && <Badge variant='secondary'>{cityName}</Badge>}
      </div>

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Spinner size='lg' className='mx-auto mb-3' />
            <p className='text-gray-600 text-sm'>Завантаження відділень...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}

      {!loading && !error && warehouses.length > 0 && (
        <>
          <div>
            <Input
              type='text'
              placeholder='Пошук за номером або адресою...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
            {searchQuery && (
              <p className='mt-2 text-sm text-gray-600'>
                Знайдено: {filteredWarehouses.length} з {warehouses.length}
              </p>
            )}
          </div>

          {filteredWarehouses.length === 0 ? (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
              <p className='text-gray-600'>
                Не знайдено відділень за запитом "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className='grid gap-3 max-h-96 overflow-y-auto pr-2'>
              {filteredWarehouses.map((warehouse) => (
                <Card
                  key={warehouse.Ref}
                  selected={selectedWarehouse?.Ref === warehouse.Ref}
                  onClick={() => onWarehouseSelect(warehouse)}
                >
                  <CardContent className='py-3'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <span className='text-blue-700 font-bold text-sm'>
                          №{warehouse.Number}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-900 mb-1'>
                          {warehouse.Description}
                        </h4>
                        {warehouse.ShortAddress && (
                          <p className='text-sm text-gray-600'>
                            {warehouse.ShortAddress}
                          </p>
                        )}
                        {warehouse.Phone && (
                          <p className='text-xs text-gray-500 mt-1'>
                            {warehouse.Phone}
                          </p>
                        )}
                      </div>
                      {selectedWarehouse?.Ref === warehouse.Ref && (
                        <div className='flex-shrink-0'>
                          <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                            <svg
                              className='w-4 h-4 text-white'
                              fill='none'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path d='M5 13l4 4L19 7'></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && warehouses.length === 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
          <p className='text-yellow-800'>
            У вибраному місті немає відділень Nova Poshta
          </p>
        </div>
      )}
    </div>
  );
}

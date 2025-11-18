'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { WarehouseSelector } from '@/components/warehouse-selector';
import type { Settlement, Warehouse } from '@/types/nova-poshta';

export default function WarehouseDemoPage() {
  const [selectedCity, setSelectedCity] = useState<Settlement | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );

  const handleCitySelect = (city: Settlement | null) => {
    setSelectedCity(city);
    setSelectedWarehouse(null); // Reset warehouse when city changes
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Демо: Вибір Відділення
          </h1>
          <p className='text-gray-600'>
            Тест компонентів пошуку міста та вибору відділення Nova Poshta
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6 mb-6'>
          {/* City Selection */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <CityAutocomplete
              onCitySelect={handleCitySelect}
              selectedCity={selectedCity}
            />
          </div>

          {/* Warehouse Selection */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <WarehouseSelector
              cityRef={selectedCity?.Ref || null}
              cityName={selectedCity?.MainDescription}
              onWarehouseSelect={setSelectedWarehouse}
              selectedWarehouse={selectedWarehouse}
            />
          </div>
        </div>

        {/* Selected Data Display */}
        {(selectedCity || selectedWarehouse) && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-xl font-semibold mb-4'>Обрані дані</h2>

            {selectedCity && (
              <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                <h3 className='font-semibold text-blue-900 mb-2'>Місто:</h3>
                <dl className='space-y-1 text-sm'>
                  <div>
                    <dt className='inline font-medium text-blue-800'>Назва:</dt>
                    <dd className='inline ml-2 text-blue-700'>
                      {selectedCity.MainDescription}
                    </dd>
                  </div>
                  <div>
                    <dt className='inline font-medium text-blue-800'>Ref:</dt>
                    <dd className='inline ml-2 text-blue-700 font-mono text-xs'>
                      {selectedCity.Ref}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {selectedWarehouse && (
              <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
                <h3 className='font-semibold text-green-900 mb-2'>
                  Відділення:
                </h3>
                <dl className='space-y-1 text-sm'>
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Номер:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      №{selectedWarehouse.Number}
                    </dd>
                  </div>
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Адреса:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      {selectedWarehouse.Description}
                    </dd>
                  </div>
                  {selectedWarehouse.Phone && (
                    <div>
                      <dt className='inline font-medium text-green-800'>
                        Телефон:
                      </dt>
                      <dd className='inline ml-2 text-green-700'>
                        {selectedWarehouse.Phone}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className='inline font-medium text-green-800'>Ref:</dt>
                    <dd className='inline ml-2 text-green-700 font-mono text-xs'>
                      {selectedWarehouse.Ref}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6'>
          <h3 className='font-semibold text-blue-900 mb-3'>Функціонал</h3>
          <ul className='space-y-2 text-sm text-blue-800'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Автоматичне завантаження відділень при виборі міста</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Локальний пошук по номеру відділення або адресі</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Сортування відділень за номером</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Індикатор завантаження під час отримання даних</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Відображення повної адреси та телефону відділення</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Візуальне виділення обраного відділення</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Скидання вибору відділення при зміні міста</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

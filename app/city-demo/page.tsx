'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import type { Settlement } from '@/types/nova-poshta';

export default function CityDemoPage() {
  const [selectedCity, setSelectedCity] = useState<Settlement | null>(null);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Демо: Пошук Міста
          </h1>
          <p className='text-gray-600'>
            Тест компонента автозаповнення для пошуку міст Nova Poshta
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <CityAutocomplete
            onCitySelect={setSelectedCity}
            selectedCity={selectedCity}
          />

          {selectedCity && (
            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-md'>
              <h3 className='font-semibold text-green-900 mb-2'>
                Обране місто:
              </h3>
              <dl className='space-y-1 text-sm'>
                <div>
                  <dt className='inline font-medium text-green-800'>Назва:</dt>
                  <dd className='inline ml-2 text-green-700'>
                    {selectedCity.MainDescription}
                  </dd>
                </div>
                <div>
                  <dt className='inline font-medium text-green-800'>
                    Область:
                  </dt>
                  <dd className='inline ml-2 text-green-700'>
                    {selectedCity.AreaDescription}
                  </dd>
                </div>
                {selectedCity.RegionDescription && (
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Район:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      {selectedCity.RegionDescription}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className='inline font-medium text-green-800'>Ref:</dt>
                  <dd className='inline ml-2 text-green-700 font-mono text-xs'>
                    {selectedCity.Ref}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-3'>Функціонал</h3>
          <ul className='space-y-2 text-sm text-blue-800'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Пошук міст з затримкою (debounce) 300ms</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>
                Навігація клавіатурою: ↑↓ для переміщення, Enter для вибору, Esc
                для закриття
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Індикатор завантаження під час запиту</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Відображення області та району для кожного міста</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Обробка помилок з зрозумілими повідомленнями</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Закриття списку при кліку поза компонентом</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

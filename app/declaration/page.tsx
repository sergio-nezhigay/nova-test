'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeclarationForm } from '@/components/declaration-form';
import type { InternetDocument } from '@/types/nova-poshta';

export default function DeclarationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (declaration: InternetDocument) => {
    // Store declaration data in sessionStorage for success page
    sessionStorage.setItem('declaration', JSON.stringify(declaration));
    router.push('/declaration/success');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Створити Декларацію
          </h1>
          <p className='text-gray-600'>
            Заповніть форму для створення декларації відправлення Nova Poshta
          </p>
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <svg
                className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <div className='flex-1'>
                <h3 className='font-semibold text-red-900 mb-1'>
                  Помилка створення декларації
                </h3>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className='text-red-600 hover:text-red-800'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <DeclarationForm onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
}

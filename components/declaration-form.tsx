'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { WarehouseSelector } from '@/components/warehouse-selector';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  validateDeclarationForm,
  type DeclarationFormData,
} from '@/lib/validation';
import type {
  Settlement,
  Warehouse,
  InternetDocument,
} from '@/types/nova-poshta';

interface DeclarationFormProps {
  onSuccess?: (declaration: InternetDocument) => void;
  onError?: (error: string) => void;
}

export function DeclarationForm({ onSuccess, onError }: DeclarationFormProps) {
  // Sender state
  const [senderCity, setSenderCity] = useState<Settlement | null>(null);
  const [senderWarehouse, setSenderWarehouse] = useState<Warehouse | null>(
    null
  );
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Recipient state
  const [recipientCity, setRecipientCity] = useState<Settlement | null>(null);
  const [recipientWarehouse, setRecipientWarehouse] =
    useState<Warehouse | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Parcel state
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [seatsAmount, setSeatsAmount] = useState('1');
  const [cost, setCost] = useState('');
  const [payerType, setPayerType] = useState<'Sender' | 'Recipient'>(
    'Recipient'
  );
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'NonCash'>(
    'Cash'
  );

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData: DeclarationFormData = {
      senderCityRef: senderCity?.Ref || '',
      senderWarehouseRef: senderWarehouse?.Ref || '',
      senderName,
      senderPhone,
      recipientCityRef: recipientCity?.Ref || '',
      recipientWarehouseRef: recipientWarehouse?.Ref || '',
      recipientName,
      recipientPhone,
      description,
      weight,
      seatsAmount,
      cost,
      payerType,
      paymentMethod,
    };

    const validation = validateDeclarationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/nova-poshta/declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderCity: senderCity?.MainDescription,
          senderCityRef: formData.senderCityRef,
          senderWarehouseRef: formData.senderWarehouseRef,
          senderPhone: formData.senderPhone,
          senderName: formData.senderName,
          recipientCity: recipientCity?.MainDescription,
          recipientCityRef: formData.recipientCityRef,
          recipientWarehouseRef: formData.recipientWarehouseRef,
          recipientPhone: formData.recipientPhone,
          recipientName: formData.recipientName,
          description: formData.description,
          weight: formData.weight,
          seatsAmount: formData.seatsAmount,
          cost: formData.cost,
          payerType: formData.payerType,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        onSuccess?.(data.data);
      } else {
        onError?.(data.error || 'Помилка створення декларації');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Помилка з'єднання");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Sender Section */}
      <section className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900'>Відправник</h2>
        <div className='space-y-4'>
          <div>
            <CityAutocomplete
              onCitySelect={setSenderCity}
              selectedCity={senderCity}
              label='Місто відправлення'
            />
            {errors.senderCity && (
              <p className='mt-1 text-sm text-red-600'>{errors.senderCity}</p>
            )}
          </div>

          <div>
            <WarehouseSelector
              cityRef={senderCity?.Ref || null}
              cityName={senderCity?.MainDescription}
              onWarehouseSelect={setSenderWarehouse}
              selectedWarehouse={senderWarehouse}
            />
            {errors.senderWarehouse && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.senderWarehouse}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='senderName'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              ПІБ відправника
            </label>
            <Input
              id='senderName'
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Прізвище Ім'я По батькові"
            />
            {errors.senderName && (
              <p className='mt-1 text-sm text-red-600'>{errors.senderName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='senderPhone'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Телефон відправника
            </label>
            <Input
              id='senderPhone'
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder='+380XXXXXXXXX'
            />
            {errors.senderPhone && (
              <p className='mt-1 text-sm text-red-600'>{errors.senderPhone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Recipient Section */}
      <section className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900'>Одержувач</h2>
        <div className='space-y-4'>
          <div>
            <CityAutocomplete
              onCitySelect={setRecipientCity}
              selectedCity={recipientCity}
              label='Місто отримання'
            />
            {errors.recipientCity && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.recipientCity}
              </p>
            )}
          </div>

          <div>
            <WarehouseSelector
              cityRef={recipientCity?.Ref || null}
              cityName={recipientCity?.MainDescription}
              onWarehouseSelect={setRecipientWarehouse}
              selectedWarehouse={recipientWarehouse}
            />
            {errors.recipientWarehouse && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.recipientWarehouse}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='recipientName'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              ПІБ одержувача
            </label>
            <Input
              id='recipientName'
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Прізвище Ім'я По батькові"
            />
            {errors.recipientName && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.recipientName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='recipientPhone'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Телефон одержувача
            </label>
            <Input
              id='recipientPhone'
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder='+380XXXXXXXXX'
            />
            {errors.recipientPhone && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.recipientPhone}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Parcel Section */}
      <section className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900'>
          Відправлення
        </h2>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Опис відправлення
            </label>
            <Input
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Одяг, взуття, аксесуари'
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='weight'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Вага (кг)
              </label>
              <Input
                id='weight'
                type='number'
                step='0.1'
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder='1.5'
              />
              {errors.weight && (
                <p className='mt-1 text-sm text-red-600'>{errors.weight}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='seatsAmount'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Кількість місць
              </label>
              <Input
                id='seatsAmount'
                type='number'
                value={seatsAmount}
                onChange={(e) => setSeatsAmount(e.target.value)}
                placeholder='1'
              />
              {errors.seatsAmount && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.seatsAmount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='cost'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Оціночна вартість (грн)
              </label>
              <Input
                id='cost'
                type='number'
                step='0.01'
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder='500'
              />
              {errors.cost && (
                <p className='mt-1 text-sm text-red-600'>{errors.cost}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Платник доставки
              </label>
              <div className='space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='Recipient'
                    checked={payerType === 'Recipient'}
                    onChange={(e) =>
                      setPayerType(e.target.value as 'Recipient')
                    }
                    className='mr-2'
                  />
                  <span className='text-sm text-gray-700'>Одержувач</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='Sender'
                    checked={payerType === 'Sender'}
                    onChange={(e) => setPayerType(e.target.value as 'Sender')}
                    className='mr-2'
                  />
                  <span className='text-sm text-gray-700'>Відправник</span>
                </label>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Форма оплати
              </label>
              <div className='space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='Cash'
                    checked={paymentMethod === 'Cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Cash')}
                    className='mr-2'
                  />
                  <span className='text-sm text-gray-700'>Готівка</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='NonCash'
                    checked={paymentMethod === 'NonCash'}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as 'NonCash')
                    }
                    className='mr-2'
                  />
                  <span className='text-sm text-gray-700'>Безготівкова</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className='flex justify-end'>
        <Button type='submit' disabled={isSubmitting} className='min-w-[200px]'>
          {isSubmitting ? (
            <>
              <Spinner size='sm' className='mr-2' />
              Створення...
            </>
          ) : (
            'Створити декларацію'
          )}
        </Button>
      </div>
    </form>
  );
}

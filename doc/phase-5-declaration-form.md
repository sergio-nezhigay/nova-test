# Phase 5: Declaration Form

**PR Title:** Implement declaration form with validation and Nova Poshta API submission

**Description:** Create a complete declaration form that integrates city/warehouse selectors, adds static sender/parcel fields, implements form validation, and submits declarations to Nova Poshta API.

**Prerequisites:** Phase 4 must be completed (warehouse selection implemented).

---

## Steps to Execute

### 1. Extend Type Definitions

#### Update `types/nova-poshta.ts`

Add the following types to the existing file:

```typescript
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
```

#### Update `types/api.ts`

```typescript
import type { Settlement, Warehouse, InternetDocument } from './nova-poshta';

// ... existing types ...

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
```

### 2. Create Form Validation Utilities

#### `lib/validation.ts`

```typescript
/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DeclarationFormData {
  // Sender
  senderCityRef: string;
  senderWarehouseRef: string;
  senderPhone: string;
  senderName: string;

  // Recipient
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

/**
 * Validate Ukrainian phone number
 * Accepts formats: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  const patterns = [
    /^\+380\d{9}$/, // +380XXXXXXXXX
    /^380\d{9}$/, // 380XXXXXXXXX
    /^0\d{9}$/, // 0XXXXXXXXX
  ];
  return patterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate declaration form
 */
export function validateDeclarationForm(
  data: DeclarationFormData
): ValidationResult {
  const errors: Record<string, string> = {};

  // Sender validation
  if (!data.senderCityRef) {
    errors.senderCity = 'Виберіть місто відправника';
  }
  if (!data.senderWarehouseRef) {
    errors.senderWarehouse = 'Виберіть відділення відправника';
  }
  if (!data.senderName.trim()) {
    errors.senderName = "Введіть ім'я відправника";
  }
  if (!data.senderPhone.trim()) {
    errors.senderPhone = 'Введіть телефон відправника';
  } else if (!validatePhone(data.senderPhone)) {
    errors.senderPhone = 'Невірний формат телефону (наприклад: +380XXXXXXXXX)';
  }

  // Recipient validation
  if (!data.recipientCityRef) {
    errors.recipientCity = 'Виберіть місто одержувача';
  }
  if (!data.recipientWarehouseRef) {
    errors.recipientWarehouse = 'Виберіть відділення одержувача';
  }
  if (!data.recipientName.trim()) {
    errors.recipientName = "Введіть ім'я одержувача";
  }
  if (!data.recipientPhone.trim()) {
    errors.recipientPhone = 'Введіть телефон одержувача';
  } else if (!validatePhone(data.recipientPhone)) {
    errors.recipientPhone = 'Невірний формат телефону';
  }

  // Parcel validation
  if (!data.description.trim()) {
    errors.description = 'Введіть опис відправлення';
  } else if (data.description.length < 3) {
    errors.description = 'Опис повинен містити мінімум 3 символи';
  }

  if (!data.weight.trim()) {
    errors.weight = 'Введіть вагу';
  } else if (!validatePositiveNumber(data.weight)) {
    errors.weight = 'Вага повинна бути додатним числом';
  }

  if (!data.seatsAmount.trim()) {
    errors.seatsAmount = 'Введіть кількість місць';
  } else if (
    !validatePositiveNumber(data.seatsAmount) ||
    !Number.isInteger(parseFloat(data.seatsAmount))
  ) {
    errors.seatsAmount = 'Кількість місць повинна бути цілим додатним числом';
  }

  if (!data.cost.trim()) {
    errors.cost = 'Введіть оціночну вартість';
  } else if (!validatePositiveNumber(data.cost)) {
    errors.cost = 'Вартість повинна бути додатним числом';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### 3. Create Nova Poshta Declaration Client

#### Update `lib/nova-poshta/client.ts`

Add the following function to the existing file:

```typescript
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
    request
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(
      response.errors.join(', ') || 'Failed to create declaration'
    );
  }

  return response.data[0];
}
```

Update the export in `lib/nova-poshta/index.ts`:

```typescript
export {
  searchCities,
  getCitiesByString,
  getWarehouses,
  getWarehousesByCityName,
  createInternetDocument,
} from './client';
```

### 4. Create Declaration API Route

#### `app/api/nova-poshta/declaration/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createInternetDocument } from '@/lib/nova-poshta';
import type { CreateDeclarationRequest } from '@/types/api';
import type { CreateInternetDocumentRequest } from '@/types/nova-poshta';

/**
 * POST /api/nova-poshta/declaration
 * Create a new declaration (Internet Document)
 *
 * Note: This is a simplified implementation for demo purposes.
 * Production version requires:
 * - Valid counterparty Refs (Sender/Recipient)
 * - Valid contact Refs (ContactSender/ContactRecipient)
 * - Proper authentication and authorization
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateDeclarationRequest = await request.json();

    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) {
      console.error('NOVA_POSHTA_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Помилка конфігурації сервера', success: false },
        { status: 500 }
      );
    }

    // For demo purposes, using mock counterparty data
    // In production, you would:
    // 1. Create/fetch sender counterparty
    // 2. Create/fetch recipient counterparty
    // 3. Use their Refs in the request

    const requestPayload: CreateInternetDocumentRequest = {
      NewAddress: '1', // Creating recipient address
      PayerType: body.payerType,
      PaymentMethod: body.paymentMethod,
      CargoType: 'Parcel',
      Weight: body.weight,
      ServiceType: 'WarehouseWarehouse',
      SeatsAmount: body.seatsAmount,
      Description: body.description,
      Cost: body.cost,

      // Sender (would use real Refs in production)
      CitySender: body.senderCityRef,
      Sender: '', // Would be counterparty Ref
      SenderAddress: body.senderWarehouseRef,
      ContactSender: '', // Would be contact Ref
      SendersPhone: body.senderPhone,

      // Recipient
      CityRecipient: body.recipientCityRef,
      Recipient: body.recipientName,
      RecipientAddress: body.recipientWarehouseRef,
      ContactRecipient: body.recipientName,
      RecipientsPhone: body.recipientPhone,
    };

    const declaration = await createInternetDocument(apiKey, requestPayload);

    return NextResponse.json({
      success: true,
      data: declaration,
    });
  } catch (error) {
    console.error('Error creating declaration:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не вдалося створити декларацію',
        success: false,
      },
      { status: 500 }
    );
  }
}
```

### 5. Create Declaration Form Component

#### `components/declaration-form.tsx`

```typescript
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
```

### 6. Create Button Component

#### `components/ui/button.tsx`

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      outline:
        'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

### 7. Create Declaration Form Page

#### `app/declaration/page.tsx`

```typescript
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
```

---

## Verification Steps

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to declaration form:**

   - Go to http://localhost:3000/declaration
   - Verify all form sections render correctly

3. **Test form validation:**

   - Try submitting empty form
   - Verify error messages appear
   - Fill fields one by one and see errors clear

4. **Test phone validation:**

   - Try invalid phone formats
   - Try valid formats: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX

5. **Test complete flow:**

   - Select sender city and warehouse
   - Fill sender details
   - Select recipient city and warehouse
   - Fill recipient details
   - Fill parcel information
   - Submit form
   - Note: API submission may fail without proper counterparty setup

6. **Verify TypeScript compilation:**
   ```bash
   npm run build
   ```

---

## Success Criteria

- ✅ Declaration form component created with all required fields
- ✅ Form validation implemented with Ukrainian error messages
- ✅ Phone number validation for Ukrainian format
- ✅ City and warehouse selectors integrated
- ✅ Static sender/parcel fields added
- ✅ Form submission to API route
- ✅ Loading state during submission
- ✅ Error handling and display
- ✅ Responsive three-column layout for parcel details
- ✅ Radio buttons for payer type and payment method
- ✅ Button component created
- ✅ Validation utilities with reusable functions
- ✅ Declaration API route created

---

## Files Changed/Created

**Created:**

- `lib/validation.ts` - Form validation utilities
- `components/ui/button.tsx` - Button component
- `components/declaration-form.tsx` - Main declaration form
- `app/declaration/page.tsx` - Declaration form page
- `app/api/nova-poshta/declaration/route.ts` - Declaration API endpoint

**Modified:**

- `types/nova-poshta.ts` - Added Internet Document types
- `types/api.ts` - Added declaration request/response types
- `lib/nova-poshta/client.ts` - Added createInternetDocument function
- `lib/nova-poshta/index.ts` - Exported createInternetDocument

---

## Important Notes

### API Limitations

This implementation is **simplified for demonstration purposes**. A production-ready version requires:

1. **Counterparty Management:**

   - Create/fetch sender counterparty (organization or individual)
   - Create/fetch recipient counterparty
   - Use their Ref values in the declaration

2. **Contact Management:**

   - Create/fetch contact persons for sender and recipient
   - Use contact Ref values in the declaration

3. **Authentication:**

   - User authentication system
   - Association of counterparties with users
   - Proper authorization checks

4. **Data Persistence:**
   - Save declarations to database
   - Track declaration status
   - Provide declaration history

### Form Fields

Static fields as per requirements:

- Sender/recipient names and phones (user input)
- Parcel description, weight, seats, cost (user input)
- Payer type and payment method (user selection)

Dynamic fields:

- Cities (from API with autocomplete)
- Warehouses (from API filtered by city)

### Validation Rules

- Phone: Ukrainian format (+380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX)
- Weight: Positive decimal number
- Seats: Positive integer
- Cost: Positive number
- All text fields: Non-empty, minimum length where applicable

---

## Next Phase

**Phase 6:** Add confirmation page with success/error handling, declaration details display, and user-friendly Ukrainian error messages throughout the application.

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

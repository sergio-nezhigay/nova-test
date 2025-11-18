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

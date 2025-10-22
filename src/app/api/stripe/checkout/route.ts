import { NextRequest } from 'next/server';
import { stripe, CreateCheckoutSessionParams } from '@/lib/stripe';
import { APIResponse, createValidationMiddleware, validationSchemas } from '@/lib/api-middleware';
import Stripe from 'stripe';

const checkoutValidationSchema = validationSchemas.pagination.extend({
  customerId: validationSchemas.pagination.shape.page.optional(),
  priceId: validationSchemas.pagination.shape.page,
  successUrl: validationSchemas.pagination.shape.page,
  cancelUrl: validationSchemas.pagination.shape.page,
  metadata: validationSchemas.pagination.shape.page.optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const validation = await createValidationMiddleware(checkoutValidationSchema)(request);
    if (!validation.success) {
      return APIResponse.validationError(validation.errors);
    }

    const { customerId, priceId, successUrl, cancelUrl, metadata }: CreateCheckoutSessionParams = await request.json();

    if (!priceId || !successUrl || !cancelUrl) {
      return APIResponse.error('Missing required parameters: priceId, successUrl, cancelUrl');
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      // Create customer if not provided
      sessionParams.customer_creation = 'always';
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return APIResponse.success({
      sessionId: session.id,
      url: session.url,
    }, 'Checkout session created successfully');
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return APIResponse.error('Invalid Stripe request: ' + error.message, 400);
    }
    
    if (error.type === 'StripeAPIError') {
      return APIResponse.error('Stripe API error: ' + error.message, 502);
    }

    return APIResponse.serverError('Failed to create checkout session', error);
  }
}

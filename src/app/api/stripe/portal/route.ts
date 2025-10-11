import { NextRequest, NextResponse } from 'next/server';
import { stripe, CreatePortalSessionParams } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl }: CreatePortalSessionParams = await request.json();

    if (!customerId || !returnUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

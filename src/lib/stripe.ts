import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Validate Stripe environment variables
const validateStripeConfig = () => {
  const missingVars = [];
  
  if (!process.env.STRIPE_SECRET_KEY) {
    missingVars.push('STRIPE_SECRET_KEY');
  }
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    missingVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Stripe environment variables:', missingVars.join(', '));
    console.error('📝 Please create a .env.local file with the following variables:');
    console.error('   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here');
    console.error('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here');
    console.error('   Get these from: https://dashboard.stripe.com/apikeys');
    return false;
  }
  
  return true;
};

// Server-side Stripe instance
let stripeInstance: Stripe | null = null;

export const stripe = (() => {
  if (!validateStripeConfig()) {
    // Return a mock stripe instance for development
    console.warn('⚠️ Using mock Stripe instance due to missing environment variables');
    return {
      customers: { create: async () => ({ id: 'mock_customer_id' }) },
      checkout: { sessions: { create: async () => ({ id: 'mock_session_id', url: '#' }) } },
      billingPortal: { sessions: { create: async () => ({ id: 'mock_session_id', url: '#' }) } },
      subscriptions: { retrieve: async () => ({ id: 'mock_subscription_id', status: 'active' }) },
    } as any;
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });
  }
  
  return stripeInstance;
})();

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: null,
    features: [
      '5 AI-generated posts per month',
      'Basic analytics',
      '2 social media accounts',
      'Standard support'
    ],
    limits: {
      posts: 5,
      accounts: 2,
      aiGenerations: 5,
    }
  },
  pro: {
    name: 'Pro',
    description: 'For growing businesses',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited AI-generated posts',
      'Advanced analytics',
      'All social media platforms',
      'Priority support',
      'Content scheduling',
      'Team collaboration'
    ],
    limits: {
      posts: -1, // unlimited
      accounts: -1, // unlimited
      aiGenerations: -1, // unlimited
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'Advanced team management',
      'Custom analytics',
      'API access'
    ],
    limits: {
      posts: -1, // unlimited
      accounts: -1, // unlimited
      aiGenerations: -1, // unlimited
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

// Stripe types
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  subscription?: {
    id: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    plan: SubscriptionPlan;
  };
}

export interface CreateCheckoutSessionParams {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
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

// Subscription Management System
// Handles plan tiers, feature gating, and usage limits

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    postsPerMonth: number;
    teamMembers: number;
    platforms: number;
    analyticsReports: number;
    aiGenerations: number;
    storageGB: number;
    apiCalls: number;
  };
  popular?: boolean;
  description: string;
  color: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  usage: {
    postsThisMonth: number;
    aiGenerationsThisMonth: number;
    reportsThisMonth: number;
    storageUsedGB: number;
    apiCallsThisMonth: number;
  };
}

export interface BillingInfo {
  id: string;
  userId: string;
  customerId: string;
  paymentMethodId?: string;
  email: string;
  name: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  invoiceHistory: Invoice[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  description: string;
  pdfUrl?: string;
}

export interface UsageMetrics {
  postsUsed: number;
  postsLimit: number;
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  reportsUsed: number;
  reportsLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    description: 'Perfect for getting started with social media management',
    color: '#6B7280',
    features: [
      '5 posts per month',
      'Basic AI content generation',
      '1 social media platform',
      'Basic analytics',
      'Community support'
    ],
    limits: {
      postsPerMonth: 5,
      teamMembers: 1,
      platforms: 1,
      analyticsReports: 1,
      aiGenerations: 10,
      storageGB: 1,
      apiCalls: 100
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    billingCycle: 'monthly',
    description: 'For creators and small businesses',
    color: '#87CEFA',
    popular: true,
    features: [
      'Unlimited posts',
      'Advanced AI content generation',
      'All social media platforms',
      'Advanced analytics & insights',
      'Content calendar',
      'Priority support',
      'Custom branding'
    ],
    limits: {
      postsPerMonth: -1, // Unlimited
      teamMembers: 3,
      platforms: -1, // All platforms
      analyticsReports: 10,
      aiGenerations: 100,
      storageGB: 10,
      apiCalls: 1000
    }
  },
  {
    id: 'business',
    name: 'Business',
    price: 49,
    billingCycle: 'monthly',
    description: 'For growing teams and agencies',
    color: '#40E0D0',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Approval workflows',
      'Advanced reporting',
      'Competitor analysis',
      'White-label reports',
      'API access',
      'Dedicated support'
    ],
    limits: {
      postsPerMonth: -1,
      teamMembers: 10,
      platforms: -1,
      analyticsReports: 50,
      aiGenerations: 500,
      storageGB: 50,
      apiCalls: 5000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    billingCycle: 'monthly',
    description: 'For large organizations and agencies',
    color: '#FF7F50',
    features: [
      'Everything in Business',
      'Unlimited team members',
      'Custom integrations',
      'Advanced automation',
      'Custom AI training',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment'
    ],
    limits: {
      postsPerMonth: -1,
      teamMembers: -1, // Unlimited
      platforms: -1,
      analyticsReports: -1, // Unlimited
      aiGenerations: -1, // Unlimited
      storageGB: 500,
      apiCalls: 50000
    }
  }
];

// Yearly plans with discount
export const YEARLY_PLANS: SubscriptionPlan[] = SUBSCRIPTION_PLANS.map(plan => ({
  ...plan,
  billingCycle: 'yearly' as const,
  price: plan.price === 0 ? 0 : Math.round(plan.price * 10 * 0.8), // 20% discount
  description: `${plan.description} (Save 20% with yearly billing)`
}));

class SubscriptionManager {
  private subscriptions: Map<string, UserSubscription> = new Map();
  private billingInfo: Map<string, BillingInfo> = new Map();

  // Initialize with mock data
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock subscription data
    const mockSubscription: UserSubscription = {
      id: 'sub_1',
      userId: 'user_1',
      planId: 'free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        postsThisMonth: 2,
        aiGenerationsThisMonth: 3,
        reportsThisMonth: 0,
        storageUsedGB: 0.2,
        apiCallsThisMonth: 25
      }
    };

    this.subscriptions.set('user_1', mockSubscription);
  }

  // Get user's current subscription
  getUserSubscription(userId: string): UserSubscription | null {
    return this.subscriptions.get(userId) || null;
  }

  // Get user's current plan
  getUserPlan(userId: string): SubscriptionPlan | null {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return null;

    return SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.planId) || null;
  }

  // Check if user has access to a feature
  hasFeatureAccess(userId: string, feature: string): boolean {
    const plan = this.getUserPlan(userId);
    if (!plan) return false;

    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  // Check usage limits
  checkUsageLimit(userId: string, resource: keyof UserSubscription['usage']): boolean {
    const subscription = this.getUserSubscription(userId);
    const plan = this.getUserPlan(userId);
    
    if (!subscription || !plan) return false;

    const limit = plan.limits[this.getLimitKey(resource)];
    const used = subscription.usage[resource];

    // -1 means unlimited
    if (limit === -1) return true;
    
    return used < limit;
  }

  // Get usage metrics for display
  getUsageMetrics(userId: string): UsageMetrics | null {
    const subscription = this.getUserSubscription(userId);
    const plan = this.getUserPlan(userId);
    
    if (!subscription || !plan) return null;

    return {
      postsUsed: subscription.usage.postsThisMonth,
      postsLimit: plan.limits.postsPerMonth,
      aiGenerationsUsed: subscription.usage.aiGenerationsThisMonth,
      aiGenerationsLimit: plan.limits.aiGenerations,
      reportsUsed: subscription.usage.reportsThisMonth,
      reportsLimit: plan.limits.analyticsReports,
      storageUsedGB: subscription.usage.storageUsedGB,
      storageLimitGB: plan.limits.storageGB,
      apiCallsUsed: subscription.usage.apiCallsThisMonth,
      apiCallsLimit: plan.limits.apiCalls
    };
  }

  // Increment usage
  incrementUsage(userId: string, resource: keyof UserSubscription['usage'], amount: number = 1): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    if (!this.checkUsageLimit(userId, resource)) return false;

    subscription.usage[resource] += amount;
    return true;
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, planId: string): Promise<boolean> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) return false;

      const existingSubscription = this.getUserSubscription(userId);
      
      if (existingSubscription) {
        existingSubscription.planId = planId;
        existingSubscription.status = 'active';
        existingSubscription.currentPeriodStart = new Date().toISOString();
        existingSubscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        const newSubscription: UserSubscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          usage: {
            postsThisMonth: 0,
            aiGenerationsThisMonth: 0,
            reportsThisMonth: 0,
            storageUsedGB: 0,
            apiCallsThisMonth: 0
          }
        };
        this.subscriptions.set(userId, newSubscription);
      }

      return true;
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      return false;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = this.getUserSubscription(userId);
      if (!subscription) return false;

      subscription.cancelAtPeriodEnd = true;
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  // Get billing information
  getBillingInfo(userId: string): BillingInfo | null {
    return this.billingInfo.get(userId) || null;
  }

  // Update billing information
  async updateBillingInfo(userId: string, billingData: Partial<BillingInfo>): Promise<boolean> {
    try {
      const existing = this.getBillingInfo(userId);
      if (existing) {
        Object.assign(existing, billingData);
      } else {
        const newBilling: BillingInfo = {
          id: `billing_${Date.now()}`,
          userId,
          customerId: `cus_${Date.now()}`,
          email: billingData.email || '',
          name: billingData.name || '',
          address: billingData.address,
          invoiceHistory: []
        };
        this.billingInfo.set(userId, newBilling);
      }
      return true;
    } catch (error) {
      console.error('Failed to update billing info:', error);
      return false;
    }
  }

  // Get invoice history
  getInvoiceHistory(userId: string): Invoice[] {
    const billing = this.getBillingInfo(userId);
    return billing?.invoiceHistory || [];
  }

  // Helper method to map usage keys to limit keys
  private getLimitKey(resource: keyof UserSubscription['usage']): keyof SubscriptionPlan['limits'] {
    const mapping: Record<keyof UserSubscription['usage'], keyof SubscriptionPlan['limits']> = {
      postsThisMonth: 'postsPerMonth',
      aiGenerationsThisMonth: 'aiGenerations',
      reportsThisMonth: 'analyticsReports',
      storageUsedGB: 'storageGB',
      apiCallsThisMonth: 'apiCalls'
    };
    return mapping[resource];
  }

  // Get plan comparison
  getPlanComparison(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Check if plan is popular
  isPopularPlan(planId: string): boolean {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    return plan?.popular || false;
  }

  // Get upgrade recommendations
  getUpgradeRecommendations(userId: string): SubscriptionPlan[] {
    const currentPlan = this.getUserPlan(userId);
    if (!currentPlan) return SUBSCRIPTION_PLANS.filter(p => p.id !== 'free');

    const currentIndex = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentPlan.id);
    return SUBSCRIPTION_PLANS.slice(currentIndex + 1);
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();

// Helper functions
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const formatUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0; // Unlimited
  return Math.round((used / limit) * 100);
};

export const getPlanColor = (planId: string): string => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  return plan?.color || '#6B7280';
}; 
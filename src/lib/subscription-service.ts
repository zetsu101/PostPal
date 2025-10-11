import { supabase } from './supabase';
import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlan } from './stripe';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: string;
  customerId?: string;
  subscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionService {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_current_period_start, subscription_current_period_end')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        plan: data.subscription_plan as SubscriptionPlan,
        status: data.subscription_status || 'active',
        customerId: data.stripe_customer_id,
        subscriptionId: data.stripe_subscription_id,
        currentPeriodStart: data.subscription_current_period_start ? new Date(data.subscription_current_period_start) : undefined,
        currentPeriodEnd: data.subscription_current_period_end ? new Date(data.subscription_current_period_end) : undefined,
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  async updateUserSubscription(
    userId: string,
    updates: Partial<UserSubscription>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: updates.plan,
          stripe_customer_id: updates.customerId,
          stripe_subscription_id: updates.subscriptionId,
          subscription_status: updates.status,
          subscription_current_period_start: updates.currentPeriodStart?.toISOString(),
          subscription_current_period_end: updates.currentPeriodEnd?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserSubscription:', error);
      return false;
    }
  }

  async createStripeCustomer(userId: string, email: string, name?: string): Promise<string | null> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return null;
    }
  }

  async getStripeSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
      return null;
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      
      if (!userSubscription?.subscriptionId) {
        console.error('No active subscription found for user');
        return false;
      }

      // Cancel the subscription at the end of the current period
      await stripe.subscriptions.update(userSubscription.subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user record
      await this.updateUserSubscription(userId, {
        status: 'canceled',
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async reactivateSubscription(userId: string): Promise<boolean> {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      
      if (!userSubscription?.subscriptionId) {
        console.error('No subscription found for user');
        return false;
      }

      // Reactivate the subscription
      await stripe.subscriptions.update(userSubscription.subscriptionId, {
        cancel_at_period_end: false,
      });

      // Update user record
      await this.updateUserSubscription(userId, {
        status: 'active',
      });

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return false;
    }
  }

  canUserAccessFeature(userId: string, feature: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const userSubscription = await this.getUserSubscription(userId);
        
        if (!userSubscription) {
          resolve(false);
          return;
        }

        const plan = SUBSCRIPTION_PLANS[userSubscription.plan];
        
        // Check if user has an active subscription
        if (userSubscription.status !== 'active' && userSubscription.status !== 'trialing') {
          resolve(false);
          return;
        }

        // Check feature limits based on plan
        switch (feature) {
          case 'ai_posts':
            // For unlimited plans, always allow
            if (plan.limits.posts === -1) {
              resolve(true);
              return;
            }
            // For limited plans, check usage (you'd implement usage tracking)
            resolve(true); // Simplified for now
            break;
          
          case 'social_accounts':
            if (plan.limits.accounts === -1) {
              resolve(true);
              return;
            }
            resolve(true); // Simplified for now
            break;
          
          case 'advanced_analytics':
            resolve(userSubscription.plan !== 'free');
            break;
          
          case 'content_scheduling':
            resolve(userSubscription.plan !== 'free');
            break;
          
          case 'team_collaboration':
            resolve(userSubscription.plan !== 'free');
            break;
          
          case 'api_access':
            resolve(userSubscription.plan === 'enterprise');
            break;
          
          default:
            resolve(true);
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        resolve(false);
      }
    });
  }

  async getUsageStats(userId: string) {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      
      if (!userSubscription) {
        return null;
      }

      const plan = SUBSCRIPTION_PLANS[userSubscription.plan];

      // In a real app, you'd query actual usage from your database
      // For now, return mock usage data
      return {
        plan: userSubscription.plan,
        limits: plan.limits,
        usage: {
          posts: Math.floor(Math.random() * 5), // Mock usage
          accounts: Math.floor(Math.random() * 3),
          aiGenerations: Math.floor(Math.random() * 10),
        },
        resetDate: userSubscription.currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return null;
    }
  }
}

export const subscriptionService = new SubscriptionService();

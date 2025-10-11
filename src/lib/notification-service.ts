import { emailService } from './email';
import { supabase } from './supabase';

export interface NotificationPreferences {
  email: boolean;
  postScheduled: boolean;
  postPublished: boolean;
  postFailed: boolean;
  analyticsSummary: boolean;
  paymentNotifications: boolean;
  weeklyDigest: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  notificationPreferences?: NotificationPreferences;
}

export class NotificationService {
  private defaultPreferences: NotificationPreferences = {
    email: true,
    postScheduled: true,
    postPublished: false,
    postFailed: true,
    analyticsSummary: true,
    paymentNotifications: true,
    weeklyDigest: true,
  };

  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, notification_preferences')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        notificationPreferences: data.notification_preferences || this.defaultPreferences,
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }

  async sendWelcomeEmail(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.email) {
      return false;
    }

    const result = await emailService.sendWelcomeEmail(user.email, user.name);
    return result.success;
  }

  async sendPostScheduledNotification(
    userId: string, 
    platform: string, 
    scheduledTime: string, 
    content: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.postScheduled) {
      return false;
    }

    const result = await emailService.sendPostScheduled(user.email, {
      platform,
      scheduledTime,
      content,
    });
    return result.success;
  }

  async sendPaymentConfirmationNotification(
    userId: string,
    amount: number,
    plan: string,
    invoiceUrl?: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.paymentNotifications) {
      return false;
    }

    const result = await emailService.sendPaymentConfirmation(user.email, {
      amount,
      plan,
      invoiceUrl,
    });
    return result.success;
  }

  async sendAnalyticsSummaryNotification(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.analyticsSummary) {
      return false;
    }

    // Fetch user's analytics data
    const analyticsData = await this.getUserAnalytics(userId);
    if (!analyticsData) {
      return false;
    }

    const result = await emailService.sendAnalyticsSummary(user.email, analyticsData);
    return result.success;
  }

  async sendPostFailedNotification(
    userId: string,
    platform: string,
    error: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.postFailed) {
      return false;
    }

    const result = await emailService.sendEmail(user.email, 'post-failed', {
      platform,
      error,
      userName: user.name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    return result.success;
  }

  async sendPostPublishedNotification(
    userId: string,
    platform: string,
    postUrl: string,
    content: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.postPublished) {
      return false;
    }

    const result = await emailService.sendEmail(user.email, 'post-published', {
      platform,
      postUrl,
      content,
      userName: user.name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    return result.success;
  }

  async sendSubscriptionCancelledNotification(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.notificationPreferences?.paymentNotifications) {
      return false;
    }

    const result = await emailService.sendEmail(user.email, 'subscription-cancelled', {
      userName: user.name,
      supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
      billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return result.success;
  }

  async sendPasswordResetNotification(
    userId: string,
    resetToken: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) {
      return false;
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    const result = await emailService.sendEmail(user.email, 'password-reset', {
      userName: user.name,
      resetUrl,
      expiresIn: '1 hour',
    });
    return result.success;
  }

  async sendAccountVerificationNotification(
    userId: string,
    verificationToken: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) {
      return false;
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-account?token=${verificationToken}`;
    
    const result = await emailService.sendEmail(user.email, 'account-verification', {
      userName: user.name,
      verificationUrl,
    });
    return result.success;
  }

  private async getUserAnalytics(userId: string) {
    try {
      // Fetch user's analytics data from the last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('platform, analytics')
        .eq('user_id', userId)
        .gte('published_at', oneWeekAgo.toISOString())
        .eq('status', 'published');

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return null;
      }

      const user = await this.getUser(userId);
      if (!user) return null;

      // Calculate analytics
      const totalPosts = posts?.length || 0;
      const totalEngagement = posts?.reduce((sum, post) => {
        const analytics = post.analytics || {};
        return sum + (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0);
      }, 0) || 0;

      // Find top platform
      const platformCounts: Record<string, number> = {};
      posts?.forEach(post => {
        platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
      });

      const topPlatform = Object.entries(platformCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Instagram';

      return {
        userName: user.name,
        totalPosts,
        totalEngagement,
        topPlatform,
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return null;
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateNotificationPreferences:', error);
      return false;
    }
  }

  // Batch operations for efficiency
  async sendWeeklyAnalyticsDigest(): Promise<void> {
    try {
      // Get all users who want weekly digest
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .contains('notification_preferences', { weeklyDigest: true });

      if (error) {
        console.error('Error fetching users for weekly digest:', error);
        return;
      }

      // Send analytics summary to each user
      const promises = users?.map(user => 
        this.sendAnalyticsSummaryNotification(user.id)
      ) || [];

      await Promise.allSettled(promises);
      console.log(`✅ Weekly analytics digest sent to ${users?.length || 0} users`);
    } catch (error) {
      console.error('Error sending weekly analytics digest:', error);
    }
  }
}

export const notificationService = new NotificationService();


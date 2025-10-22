import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email types
export type EmailTemplate = 
  | 'welcome'
  | 'payment-confirmation'
  | 'payment-failed'
  | 'subscription-cancelled'
  | 'post-scheduled'
  | 'post-published'
  | 'post-failed'
  | 'analytics-summary'
  | 'password-reset'
  | 'account-verification';

export interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export interface EmailOptions {
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

// Email templates configuration
export const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to PostPal! 🚀',
    template: 'welcome',
  },
  'payment-confirmation': {
    subject: 'Payment Confirmed - Thank You!',
    template: 'payment-confirmation',
  },
  'payment-failed': {
    subject: 'Payment Failed - Action Required',
    template: 'payment-failed',
  },
  'subscription-cancelled': {
    subject: 'Subscription Cancelled',
    template: 'subscription-cancelled',
  },
  'post-scheduled': {
    subject: 'Post Scheduled Successfully 📅',
    template: 'post-scheduled',
  },
  'post-published': {
    subject: 'Post Published! 🎉',
    template: 'post-published',
  },
  'post-failed': {
    subject: 'Post Failed to Publish ⚠️',
    template: 'post-failed',
  },
  'analytics-summary': {
    subject: 'Your Weekly Analytics Summary 📊',
    template: 'analytics-summary',
  },
  'password-reset': {
    subject: 'Reset Your PostPal Password',
    template: 'password-reset',
  },
  'account-verification': {
    subject: 'Verify Your PostPal Account',
    template: 'account-verification',
  },
} as const;

// Email service class
export class EmailService {
  private defaultFrom = 'PostPal <hello@postpal.app>';

  async sendEmail(
    to: string,
    template: EmailTemplate,
    data: Record<string, unknown>,
    options: EmailOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const templateConfig = EMAIL_TEMPLATES[template];
      
      if (!templateConfig) {
        throw new Error(`Unknown email template: ${template}`);
      }

      const response = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to,
        subject: templateConfig.subject,
        react: await this.renderTemplate(template, data),
        replyTo: options.replyTo,
        tags: options.tags || [
          { name: 'template', value: template },
          { name: 'app', value: 'postpal' },
        ],
      });

      if (response.error) {
        console.error('Email sending failed:', response.error);
        return { success: false, error: response.error.message };
      }

      console.log(`✅ Email sent successfully: ${template} to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async renderTemplate(template: EmailTemplate, data: Record<string, unknown>) {
    // Dynamic import of email templates
    switch (template) {
      case 'welcome':
        const { WelcomeEmail } = await import('@/components/emails/WelcomeEmail');
        return WelcomeEmail(data as any);
      
      case 'payment-confirmation':
        const { PaymentConfirmationEmail } = await import('@/components/emails/PaymentConfirmationEmail');
        return PaymentConfirmationEmail(data as any);
      
      case 'payment-failed':
        const { PaymentFailedEmail } = await import('@/components/emails/PaymentFailedEmail');
        return PaymentFailedEmail(data as any);
      
      case 'subscription-cancelled':
        const { SubscriptionCancelledEmail } = await import('@/components/emails/SubscriptionCancelledEmail');
        return SubscriptionCancelledEmail(data as any);
      
      case 'post-scheduled':
        const { PostScheduledEmail } = await import('@/components/emails/PostScheduledEmail');
        return PostScheduledEmail(data as any);
      
      case 'post-published':
        const { PostPublishedEmail } = await import('@/components/emails/PostPublishedEmail');
        return PostPublishedEmail(data as any);
      
      case 'post-failed':
        const { PostFailedEmail } = await import('@/components/emails/PostFailedEmail');
        return PostFailedEmail(data as any);
      
      case 'analytics-summary':
        const { AnalyticsSummaryEmail } = await import('@/components/emails/AnalyticsSummaryEmail');
        return AnalyticsSummaryEmail(data as any);
      
      case 'password-reset':
        const { PasswordResetEmail } = await import('@/components/emails/PasswordResetEmail');
        return PasswordResetEmail(data as any);
      
      case 'account-verification':
        const { AccountVerificationEmail } = await import('@/components/emails/AccountVerificationEmail');
        return AccountVerificationEmail(data as any);
      
      default:
        throw new Error(`Template renderer not implemented for: ${template}`);
    }
  }

  // Convenience methods for common emails
  async sendWelcomeEmail(userEmail: string, userName: string) {
    return this.sendEmail(userEmail, 'welcome', {
      userName,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
  }

  async sendPaymentConfirmation(userEmail: string, paymentData: Record<string, unknown>) {
    return this.sendEmail(userEmail, 'payment-confirmation', {
      amount: paymentData.amount,
      plan: paymentData.plan,
      invoiceUrl: paymentData.invoiceUrl,
      billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
  }

  async sendPostScheduled(userEmail: string, postData: Record<string, unknown>) {
    return this.sendEmail(userEmail, 'post-scheduled', {
      platform: postData.platform,
      scheduledTime: postData.scheduledTime,
      content: postData.content,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
  }

  async sendAnalyticsSummary(userEmail: string, analyticsData: Record<string, unknown>) {
    return this.sendEmail(userEmail, 'analytics-summary', {
      userName: analyticsData.userName,
      totalPosts: analyticsData.totalPosts,
      totalEngagement: analyticsData.totalEngagement,
      topPlatform: analyticsData.topPlatform,
      analyticsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/analytics`,
    });
  }
}

export const emailService = new EmailService();


import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, template = 'welcome' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Test email data based on template
    let testData: any = {};

    switch (template) {
      case 'welcome':
        testData = {
          userName: 'Test User',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        };
        break;
      
      case 'payment-confirmation':
        testData = {
          amount: 2900, // $29.00
          plan: 'Pro',
          invoiceUrl: 'https://example.com/invoice.pdf',
          billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        };
        break;
      
      case 'post-scheduled':
        testData = {
          platform: 'Instagram',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          content: 'This is a test post scheduled for tomorrow! 🚀',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        };
        break;
      
      case 'analytics-summary':
        testData = {
          userName: 'Test User',
          totalPosts: 12,
          totalEngagement: 2847,
          topPlatform: 'Instagram',
          analyticsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/analytics`,
        };
        break;
      
      default:
        testData = {};
    }

    const result = await emailService.sendEmail(email, template as any, testData);

    if (!result.success) {
      console.error('Test email failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test ${template} email sent successfully to ${email}` 
    });
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


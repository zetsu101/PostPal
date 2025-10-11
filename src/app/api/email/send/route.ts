import { NextRequest, NextResponse } from 'next/server';
import { emailService, type EmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    if (!to || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template' },
        { status: 400 }
      );
    }

    // Validate email template
    const validTemplates: EmailTemplate[] = [
      'welcome',
      'payment-confirmation',
      'payment-failed',
      'subscription-cancelled',
      'post-scheduled',
      'post-published',
      'post-failed',
      'analytics-summary',
      'password-reset',
      'account-verification',
    ];

    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: 'Invalid email template' },
        { status: 400 }
      );
    }

    // Send email
    const result = await emailService.sendEmail(to, template, data || {});

    if (!result.success) {
      console.error('Email sending failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


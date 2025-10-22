import React from 'react';
import { BaseEmail } from './BaseEmail';

interface SubscriptionCancelledEmailProps {
  plan?: string;
  cancellationDate?: string;
  reactivationUrl?: string;
  feedbackUrl?: string;
}

export function SubscriptionCancelledEmail({
  plan = 'Pro Plan',
  cancellationDate = new Date().toLocaleDateString(),
  reactivationUrl = '#',
  feedbackUrl = '#',
}: SubscriptionCancelledEmailProps) {
  return (
    <BaseEmail
      title="Subscription Cancelled"
      preview="Your PostPal subscription has been cancelled. We're sorry to see you go!"
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#6b7280', fontSize: '24px', marginBottom: '16px' }}>
          Subscription Cancelled
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          We're sorry to see you go! Your PostPal subscription has been cancelled.
        </p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#111827', fontSize: '18px', marginBottom: '8px' }}>Subscription Details</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Plan:</strong> {plan}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Cancelled:</strong> {cancellationDate}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Status:</strong> Cancelled</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>What happens next:</h3>
        <ul style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}>You'll retain access until the end of your current billing period</li>
          <li style={{ marginBottom: '8px' }}>Your data will be safely stored for 30 days</li>
          <li style={{ marginBottom: '8px' }}>You can reactivate anytime during this period</li>
          <li style={{ marginBottom: '8px' }}>After 30 days, your account will be downgraded to Free</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={reactivationUrl}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            marginRight: '12px',
          }}
        >
          Reactivate Subscription
        </a>
        <a
          href={feedbackUrl}
          style={{
            backgroundColor: 'transparent',
            color: '#2563eb',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            border: '1px solid #2563eb',
          }}
        >
          Share Feedback
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '8px' }}>We'd love to hear from you!</h4>
        <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>
          Your feedback helps us improve PostPal. What could we have done better?
        </p>
      </div>
    </BaseEmail>
  );
}

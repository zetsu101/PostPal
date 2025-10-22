import React from 'react';
import { BaseEmail } from './BaseEmail';

interface PaymentFailedEmailProps {
  amount?: string;
  plan?: string;
  invoiceUrl?: string;
  billingUrl?: string;
}

export function PaymentFailedEmail({
  amount = '$29.99',
  plan = 'Pro Plan',
  invoiceUrl = '#',
  billingUrl = '#',
}: PaymentFailedEmailProps) {
  return (
    <BaseEmail
      title="Payment Failed - Action Required"
      preview="Your payment could not be processed. Please update your payment method."
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#dc2626', fontSize: '24px', marginBottom: '16px' }}>
          Payment Failed ⚠️
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          We were unable to process your payment for your PostPal subscription.
        </p>
      </div>

      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '8px' }}>Payment Details</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Amount:</strong> {amount}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Plan:</strong> {plan}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Status:</strong> Failed</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>What to do next:</h3>
        <ol style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}>Check your payment method details</li>
          <li style={{ marginBottom: '8px' }}>Ensure sufficient funds are available</li>
          <li style={{ marginBottom: '8px' }}>Update your payment information if needed</li>
          <li style={{ marginBottom: '8px' }}>Contact your bank if the issue persists</li>
        </ol>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={billingUrl}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
          }}
        >
          Update Payment Method
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          <strong>Need help?</strong> Contact our support team at{' '}
          <a href="mailto:support@postpal.app" style={{ color: '#2563eb' }}>
            support@postpal.app
          </a>
        </p>
      </div>
    </BaseEmail>
  );
}

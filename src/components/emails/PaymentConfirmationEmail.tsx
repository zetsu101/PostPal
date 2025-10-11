import {
  Button,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface PaymentConfirmationEmailProps {
  amount: number;
  plan: string;
  invoiceUrl?: string;
  billingUrl: string;
}

export function PaymentConfirmationEmail({ 
  amount, 
  plan, 
  invoiceUrl, 
  billingUrl 
}: PaymentConfirmationEmailProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <BaseEmail
      preview="Your payment has been processed successfully. Thank you for your subscription!"
      title="Payment Confirmed! ✅"
    >
      <Text style={paragraph}>
        Thank you for your payment! Your subscription has been successfully processed.
      </Text>
      
      <Section style={paymentDetails}>
        <Text style={detailLabel}>Amount Paid:</Text>
        <Text style={detailValue}>{formatAmount(amount)}</Text>
        
        <Text style={detailLabel}>Plan:</Text>
        <Text style={detailValue}>{plan}</Text>
        
        <Text style={detailLabel}>Date:</Text>
        <Text style={detailValue}>{new Date().toLocaleDateString()}</Text>
      </Section>
      
      <Text style={paragraph}>
        Your {plan} plan is now active and you have access to all premium features:
      </Text>
      
      <Text style={list}>
        ✨ Unlimited AI-generated content<br/>
        📊 Advanced analytics dashboard<br/>
        📅 Content scheduling<br/>
        🎯 Performance optimization<br/>
        👥 Team collaboration tools
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={billingUrl}>
          View Billing Details
        </Button>
      </Section>
      
      {invoiceUrl && (
        <Section style={buttonContainer}>
          <Button style={secondaryButton} href={invoiceUrl}>
            Download Invoice
          </Button>
        </Section>
      )}
      
      <Text style={paragraph}>
        If you have any questions about your subscription, please don't hesitate to{' '}
        <a href="https://postpal.app/support" style={link}>
          contact our support team
        </a>.
      </Text>
      
      <Text style={paragraph}>
        Thank you for choosing PostPal!<br/>
        The PostPal Team
      </Text>
    </BaseEmail>
  );
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '16px 0',
};

const list = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '16px 0',
  paddingLeft: '0',
};

const paymentDetails = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#6b7280',
  margin: '8px 0 4px',
};

const detailValue = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  color: '#374151',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};


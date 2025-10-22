import React from 'react';
import { BaseEmail } from './BaseEmail';

interface AccountVerificationEmailProps {
  userName?: string;
  verificationUrl?: string;
  expiresIn?: string;
}

export function AccountVerificationEmail({
  userName = 'User',
  verificationUrl = '#',
  expiresIn = '24 hours',
}: AccountVerificationEmailProps) {
  return (
    <BaseEmail
      title="Verify Your PostPal Account"
      preview="Welcome to PostPal! Please verify your email address to complete your account setup."
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#059669', fontSize: '24px', marginBottom: '16px' }}>
          Welcome to PostPal! 🚀
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Hi {userName}, thank you for joining PostPal! Please verify your email address to complete your account setup.
        </p>
      </div>

      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#059669', fontSize: '18px', marginBottom: '8px' }}>Account Verification</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Account:</strong> {userName}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Created:</strong> {new Date().toLocaleString()}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Status:</strong> Pending Verification</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>What you get with PostPal:</h3>
        <ul style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}>✨ AI-powered content generation</li>
          <li style={{ marginBottom: '8px' }}>📅 Smart scheduling across all platforms</li>
          <li style={{ marginBottom: '8px' }}>📊 Advanced analytics and insights</li>
          <li style={{ marginBottom: '8px' }}>👥 Team collaboration tools</li>
          <li style={{ marginBottom: '8px' }}>🎯 Hashtag optimization</li>
          <li style={{ marginBottom: '8px' }}>📱 Mobile-responsive design</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={verificationUrl}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
          }}
        >
          Verify Email Address
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h4 style={{ color: '#92400e', fontSize: '16px', marginBottom: '8px' }}>⏰ Verification Expires Soon</h4>
        <p style={{ fontSize: '14px', color: '#92400e', margin: '0' }}>
          This verification link will expire in {expiresIn}. Please verify your email address soon to avoid account restrictions.
        </p>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '8px' }}>Need help getting started?</h4>
        <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>
          Check out our{' '}
          <a href="#" style={{ color: '#1e40af' }}>
            getting started guide
          </a>
          {' '}or contact our support team at{' '}
          <a href="mailto:support@postpal.app" style={{ color: '#1e40af' }}>
            support@postpal.app
          </a>
        </p>
      </div>
    </BaseEmail>
  );
}

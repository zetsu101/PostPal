import React from 'react';
import { BaseEmail } from './BaseEmail';

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl?: string;
  expiresIn?: string;
}

export function PasswordResetEmail({
  userName = 'User',
  resetUrl = '#',
  expiresIn = '24 hours',
}: PasswordResetEmailProps) {
  return (
    <BaseEmail
      title="Reset Your PostPal Password"
      preview="Click the link below to reset your password. This link will expire in 24 hours."
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#111827', fontSize: '24px', marginBottom: '16px' }}>
          Reset Your Password
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Hi {userName}, we received a request to reset your PostPal password.
        </p>
      </div>

      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#1e40af', fontSize: '18px', marginBottom: '8px' }}>Password Reset Request</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Account:</strong> {userName}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Requested:</strong> {new Date().toLocaleString()}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Expires:</strong> {expiresIn}</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>To reset your password:</h3>
        <ol style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}>Click the "Reset Password" button below</li>
          <li style={{ marginBottom: '8px' }}>Enter your new password (minimum 8 characters)</li>
          <li style={{ marginBottom: '8px' }}>Confirm your new password</li>
          <li style={{ marginBottom: '8px' }}>Click "Update Password" to save changes</li>
        </ol>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={resetUrl}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
          }}
        >
          Reset Password
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h4 style={{ color: '#92400e', fontSize: '16px', marginBottom: '8px' }}>⚠️ Important Security Information</h4>
        <ul style={{ fontSize: '14px', color: '#92400e', margin: '0', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '4px' }}>This link will expire in {expiresIn}</li>
          <li style={{ marginBottom: '4px' }}>If you didn't request this reset, please ignore this email</li>
          <li style={{ marginBottom: '4px' }}>Never share your password with anyone</li>
          <li style={{ marginBottom: '4px' }}>Use a strong, unique password</li>
        </ul>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          <strong>Didn't request this?</strong> If you didn't request a password reset, please contact our support team at{' '}
          <a href="mailto:support@postpal.app" style={{ color: '#2563eb' }}>
            support@postpal.app
          </a>
        </p>
      </div>
    </BaseEmail>
  );
}

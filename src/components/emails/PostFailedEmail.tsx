import React from 'react';
import { BaseEmail } from './BaseEmail';

interface PostFailedEmailProps {
  platform?: string;
  content?: string;
  errorMessage?: string;
  retryUrl?: string;
  supportUrl?: string;
}

export function PostFailedEmail({
  platform = 'Instagram',
  content = 'Your post content here',
  errorMessage = 'Unknown error occurred',
  retryUrl = '#',
  supportUrl = '#',
}: PostFailedEmailProps) {
  return (
    <BaseEmail
      title="Post Failed to Publish ⚠️"
      preview="Your post could not be published. Please check the details and try again."
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#dc2626', fontSize: '24px', marginBottom: '16px' }}>
          Post Failed to Publish ⚠️
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Unfortunately, your post could not be published to {platform}. Don't worry, we'll help you fix this!
        </p>
      </div>

      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '8px' }}>Post Details</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Platform:</strong> {platform}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Status:</strong> Failed</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Error:</strong> {errorMessage}</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>Post Content:</h3>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '16px',
          fontStyle: 'italic',
          color: '#374151'
        }}>
          "{content}"
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>Common causes and solutions:</h3>
        <ul style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}><strong>API Connection:</strong> Check your social media account connection</li>
          <li style={{ marginBottom: '8px' }}><strong>Content Issues:</strong> Ensure content meets platform guidelines</li>
          <li style={{ marginBottom: '8px' }}><strong>Rate Limits:</strong> You may have hit posting limits</li>
          <li style={{ marginBottom: '8px' }}><strong>Account Issues:</strong> Verify your account is active and verified</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={retryUrl}
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
          Try Again
        </a>
        <a
          href={supportUrl}
          style={{
            backgroundColor: 'transparent',
            color: '#dc2626',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            border: '1px solid #dc2626',
          }}
        >
          Get Help
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '8px' }}>Need immediate assistance?</h4>
        <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>
          Our support team is here to help! Contact us at{' '}
          <a href="mailto:support@postpal.app" style={{ color: '#1e40af' }}>
            support@postpal.app
          </a>
        </p>
      </div>
    </BaseEmail>
  );
}

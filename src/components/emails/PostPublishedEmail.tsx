import React from 'react';
import { BaseEmail } from './BaseEmail';

interface PostPublishedEmailProps {
  platform?: string;
  content?: string;
  publishedTime?: string;
  analyticsUrl?: string;
}

export function PostPublishedEmail({
  platform = 'Instagram',
  content = 'Your amazing post content here!',
  publishedTime = new Date().toLocaleString(),
  analyticsUrl = '#',
}: PostPublishedEmailProps) {
  return (
    <BaseEmail
      title="Post Published! 🎉"
      preview="Your post has been successfully published to your social media account."
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#059669', fontSize: '24px', marginBottom: '16px' }}>
          Post Published! 🎉
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Great news! Your post has been successfully published to {platform}.
        </p>
      </div>

      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#059669', fontSize: '18px', marginBottom: '8px' }}>Post Details</h3>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Platform:</strong> {platform}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Published:</strong> {publishedTime}</p>
        <p style={{ margin: '4px 0', color: '#374151' }}><strong>Status:</strong> Live</p>
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
        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#111827' }}>What's next?</h3>
        <ul style={{ paddingLeft: '20px', color: '#374151' }}>
          <li style={{ marginBottom: '8px' }}>Monitor engagement and interactions</li>
          <li style={{ marginBottom: '8px' }}>Respond to comments and messages</li>
          <li style={{ marginBottom: '8px' }}>Track performance in analytics</li>
          <li style={{ marginBottom: '8px' }}>Plan your next content</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href={analyticsUrl}
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
          View Analytics
        </a>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4 style={{ color: '#1e40af', fontSize: '16px', marginBottom: '8px' }}>Pro Tip 💡</h4>
        <p style={{ fontSize: '14px', color: '#1e40af', margin: '0' }}>
          The first few hours after posting are crucial for engagement. Make sure to respond to early comments to boost your post's visibility!
        </p>
      </div>
    </BaseEmail>
  );
}

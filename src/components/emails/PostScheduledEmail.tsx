import {
  Button,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface PostScheduledEmailProps {
  platform: string;
  scheduledTime: string;
  content: string;
  dashboardUrl: string;
}

export function PostScheduledEmail({ 
  platform, 
  scheduledTime, 
  content, 
  dashboardUrl 
}: PostScheduledEmailProps) {
  const getPlatformEmoji = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'linkedin': return '💼';
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  const formatScheduledTime = (time: string) => {
    return new Date(time).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <BaseEmail
      preview={`Your post has been scheduled for ${platform} at ${formatScheduledTime(scheduledTime)}`}
      title="Post Scheduled Successfully! 📅"
    >
      <Text style={paragraph}>
        Great news! Your post has been successfully scheduled.
      </Text>
      
      <Section style={postDetails}>
        <Text style={detailLabel}>Platform:</Text>
        <Text style={detailValue}>
          {getPlatformEmoji(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Text>
        
        <Text style={detailLabel}>Scheduled Time:</Text>
        <Text style={detailValue}>{formatScheduledTime(scheduledTime)}</Text>
        
        <Text style={detailLabel}>Content Preview:</Text>
        <Text style={contentPreview}>
          "{content.length > 100 ? content.substring(0, 100) + '...' : content}"
        </Text>
      </Section>
      
      <Text style={paragraph}>
        Your post will be automatically published at the scheduled time. You can manage all your scheduled posts from your dashboard.
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          View Dashboard
        </Button>
      </Section>
      
      <Text style={paragraph}>
        Need to make changes? You can edit or cancel your scheduled posts anytime from your dashboard.
      </Text>
      
      <Text style={paragraph}>
        Happy posting!<br/>
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

const postDetails = {
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

const contentPreview = {
  fontSize: '16px',
  color: '#374151',
  fontStyle: 'italic',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  padding: '12px',
  margin: '8px 0 16px',
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


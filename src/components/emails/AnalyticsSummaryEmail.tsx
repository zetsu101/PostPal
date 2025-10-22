import React from 'react';
import { BaseEmail } from './BaseEmail';
import { Text, Section, Button, Hr } from '@react-email/components';

interface AnalyticsSummaryEmailProps {
  userName: string;
  totalPosts: number;
  totalEngagement: number;
  topPlatform: string;
  analyticsUrl: string;
}

export function AnalyticsSummaryEmail({
  userName,
  totalPosts,
  totalEngagement,
  topPlatform,
  analyticsUrl,
}: AnalyticsSummaryEmailProps) {
  return (
    <BaseEmail
      preview="Your weekly analytics summary is ready!"
      title="📊 Your Weekly Analytics Summary"
    >
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Here's your weekly performance summary:
      </Text>

      <Section style={metricsContainer}>
        <div style={metricItem}>
          <Text style={metricValue}>{totalPosts}</Text>
          <Text style={metricLabel}>Posts Published</Text>
        </div>
        <div style={metricItem}>
          <Text style={metricValue}>{totalEngagement.toLocaleString()}</Text>
          <Text style={metricLabel}>Total Engagement</Text>
        </div>
        <div style={metricItem}>
          <Text style={metricValue}>{topPlatform}</Text>
          <Text style={metricLabel}>Top Platform</Text>
        </div>
      </Section>

      <Text style={paragraph}>
        Keep up the great work! Your content is performing well across all platforms.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={analyticsUrl}>
          View Full Analytics
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={footerText}>
        Want to improve your performance? Try our AI content optimizer for better engagement rates.
      </Text>
    </BaseEmail>
  );
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const metricsContainer = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap' as const,
};

const metricItem = {
  textAlign: 'center' as const,
  margin: '0 16px',
};

const metricValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const metricLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '0',
};
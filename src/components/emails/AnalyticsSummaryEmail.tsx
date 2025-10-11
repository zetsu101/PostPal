import {
  Button,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

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
  analyticsUrl 
}: AnalyticsSummaryEmailProps) {
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

  const formatEngagement = (engagement: number) => {
    if (engagement >= 1000000) {
      return `${(engagement / 1000000).toFixed(1)}M`;
    } else if (engagement >= 1000) {
      return `${(engagement / 1000).toFixed(1)}K`;
    }
    return engagement.toString();
  };

  return (
    <BaseEmail
      preview={`Your weekly analytics summary: ${totalPosts} posts, ${formatEngagement(totalEngagement)} total engagement`}
      title="Your Weekly Analytics Summary 📊"
    >
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Here's your weekly performance summary. You've been doing great!
      </Text>
      
      <Section style={analyticsCard}>
        <Text style={metricLabel}>Posts Published</Text>
        <Text style={metricValue}>{totalPosts}</Text>
        
        <Text style={metricLabel}>Total Engagement</Text>
        <Text style={metricValue}>{formatEngagement(totalEngagement)}</Text>
        
        <Text style={metricLabel}>Top Platform</Text>
        <Text style={metricValue}>
          {getPlatformEmoji(topPlatform)} {topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1)}
        </Text>
      </Section>
      
      <Text style={paragraph}>
        <strong>Key Insights:</strong>
      </Text>
      
      <Text style={insight}>
        🎯 Your content is performing well across all platforms<br/>
        📈 Engagement is growing steadily<br/>
        ⭐ {topPlatform} is your strongest platform this week
      </Text>
      
      <Text style={paragraph}>
        Want to dive deeper into your analytics? Check out your detailed performance metrics.
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={analyticsUrl}>
          View Detailed Analytics
        </Button>
      </Section>
      
      <Text style={paragraph}>
        <strong>Pro Tip:</strong> Try posting at peak engagement times to maximize your reach. 
        Your analytics show that content posted between 2-4 PM performs 23% better!
      </Text>
      
      <Text style={paragraph}>
        Keep up the great work!<br/>
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

const analyticsCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const metricLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#6b7280',
  margin: '16px 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const metricValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#3b82f6',
  margin: '0 0 24px',
};

const insight = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '16px 0',
  paddingLeft: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
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


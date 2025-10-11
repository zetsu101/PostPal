import {
  Button,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName, loginUrl, dashboardUrl }: WelcomeEmailProps) {
  return (
    <BaseEmail
      preview="Welcome to PostPal! Let's get started with AI-powered social media content creation."
      title="Welcome to PostPal! 🚀"
    >
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Welcome to PostPal! We're excited to have you join our community of content creators who are revolutionizing their social media presence with AI.
      </Text>
      
      <Text style={paragraph}>
        Here's what you can do with PostPal:
      </Text>
      
      <Text style={list}>
        ✨ <strong>Generate AI-powered content</strong> for all major social platforms<br/>
        📊 <strong>Track performance</strong> with detailed analytics<br/>
        📅 <strong>Schedule posts</strong> to maintain consistency<br/>
        🎯 <strong>Optimize engagement</strong> with smart recommendations
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Get Started
        </Button>
      </Section>
      
      <Text style={paragraph}>
        Need help getting started? Check out our{' '}
        <a href="https://postpal.app/help" style={link}>
          getting started guide
        </a>
        {' '}or reach out to our support team.
      </Text>
      
      <Text style={paragraph}>
        Happy creating!<br/>
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

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

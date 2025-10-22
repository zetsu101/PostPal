import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseEmailProps {
  preview: string;
  title: string;
  children: React.ReactNode;
  footerText?: string;
}

export function BaseEmail({ 
  preview, 
  title, 
  children, 
  footerText = "Thanks for using PostPal!" 
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://postpal.app/logo.png"
              width="120"
              height="40"
              alt="PostPal"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>{title}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>
              {footerText}
            </Text>
            <Text style={footerLink}>
              <Link href="https://postpal.app" style={link}>
                PostPal
              </Link>
              {' • '}
              <Link href="https://postpal.app/settings" style={link}>
                Settings
              </Link>
              {' • '}
              <Link href="https://postpal.app/support" style={link}>
                Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '24px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const footerLink = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};


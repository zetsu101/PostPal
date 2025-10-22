import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Performance Monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set environment
  environment: process.env.NODE_ENV,
  
  // Set release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Configure what data to send
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }
    
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send network errors
        if (error.message.includes('Network Error') || 
            error.message.includes('fetch')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Add user context
  beforeSendTransaction(event) {
    // Don't send transactions in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Provides consistent horizontal page gutters and max width
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}



"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white hover:from-[#5F9EC7] hover:to-[#20B2AA] focus:ring-[#87CEFA] shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-[#87CEFA] text-[#87CEFA] hover:bg-[#87CEFA] hover:text-white focus:ring-[#87CEFA]',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg hover:shadow-xl',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm md:text-base rounded-lg',
    lg: 'px-6 py-3 text-base md:text-lg rounded-xl',
    xl: 'px-8 py-4 text-lg md:text-xl rounded-xl'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin mr-2" size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}

// Specialized button components for common use cases
export function IconButton({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'icon' | 'iconPosition'>) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className={`p-2 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

export function LoadingButton({
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <Button loading={loading} disabled={loading} {...props}>
      {children}
    </Button>
  );
}



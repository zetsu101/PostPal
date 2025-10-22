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
    primary: 'bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white hover:from-blue-500 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500 dark:focus:ring-gray-400',
    outline: 'border-2 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-400 dark:hover:bg-blue-500 hover:text-white focus:ring-blue-500 dark:focus:ring-blue-400',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 dark:focus:ring-gray-400',
    danger: 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500 dark:focus:ring-red-400 shadow-lg hover:shadow-xl',
    success: 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 focus:ring-green-500 dark:focus:ring-green-400 shadow-lg hover:shadow-xl'
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



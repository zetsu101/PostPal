"use client";
import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="mt-2 md:mt-0 flex items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}



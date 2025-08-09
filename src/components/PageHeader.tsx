"use client";
import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937]">{title}</h1>
          {subtitle && (
            <p className="text-[#6B7280] text-lg mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="mt-2 md:mt-0 flex items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}



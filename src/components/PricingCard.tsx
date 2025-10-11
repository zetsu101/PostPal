"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import Button from './ui/Button';

interface PricingCardProps {
  plan: 'free' | 'pro' | 'enterprise';
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  onSelect: (plan: string) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export default function PricingCard({
  plan,
  name,
  description,
  price,
  features,
  isPopular = false,
  onSelect,
  isSelected = false,
  isLoading = false,
}: PricingCardProps) {
  const getPlanIcon = () => {
    switch (plan) {
      case 'free':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'pro':
        return <Star className="w-6 h-6 text-purple-500" />;
      case 'enterprise':
        return <Star className="w-6 h-6 text-gold-500" />;
    }
  };

  const getGradientColors = () => {
    if (isPopular) {
      return 'from-purple-500 to-pink-500';
    }
    switch (plan) {
      case 'free':
        return 'from-blue-500 to-blue-600';
      case 'pro':
        return 'from-purple-500 to-purple-600';
      case 'enterprise':
        return 'from-yellow-500 to-orange-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-white rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      } ${isPopular ? 'scale-105' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getPlanIcon()}
            <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
          </div>
          {isSelected && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6">{description}</p>

        <div className="mb-8">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">${price}</span>
            {price > 0 && <span className="text-gray-500 ml-1">/month</span>}
            {price === 0 && <span className="text-gray-500 ml-1">forever</span>}
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(plan)}
          disabled={isLoading || isSelected}
          className={`w-full ${
            isPopular
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : `bg-gradient-to-r ${getGradientColors()} hover:opacity-90`
          } text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
            isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : isSelected ? (
            'Current Plan'
          ) : price === 0 ? (
            'Get Started Free'
          ) : (
            `Upgrade to ${name}`
          )}
        </Button>
      </div>
    </motion.div>
  );
}

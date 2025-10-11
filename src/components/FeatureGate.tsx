"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import Button from './ui/Button';
import { subscriptionService } from '@/lib/subscription-service';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userId?: string;
}

export default function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  userId = 'current-user' 
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature, userId]);

  const checkAccess = async () => {
    try {
      const access = await subscriptionService.canUserAccessFeature(userId, feature);
      setHasAccess(access);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
}

function UpgradePrompt({ feature }: { feature: string }) {
  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case 'ai_posts':
        return {
          title: 'Unlock Unlimited AI Posts',
          description: 'Generate unlimited AI-powered content for all your social media platforms.',
          icon: <Zap className="w-8 h-8 text-blue-500" />,
          requiredPlan: 'Pro',
        };
      case 'advanced_analytics':
        return {
          title: 'Advanced Analytics',
          description: 'Get detailed insights into your content performance and audience engagement.',
          icon: <Star className="w-8 h-8 text-purple-500" />,
          requiredPlan: 'Pro',
        };
      case 'content_scheduling':
        return {
          title: 'Content Scheduling',
          description: 'Schedule your posts in advance and maintain a consistent posting schedule.',
          icon: <Lock className="w-8 h-8 text-green-500" />,
          requiredPlan: 'Pro',
        };
      case 'team_collaboration':
        return {
          title: 'Team Collaboration',
          description: 'Invite team members and collaborate on content creation and management.',
          icon: <Crown className="w-8 h-8 text-yellow-500" />,
          requiredPlan: 'Pro',
        };
      case 'api_access':
        return {
          title: 'API Access',
          description: 'Integrate PostPal with your existing tools and workflows.',
          icon: <Crown className="w-8 h-8 text-gold-500" />,
          requiredPlan: 'Enterprise',
        };
      default:
        return {
          title: 'Premium Feature',
          description: 'This feature is available with our premium plans.',
          icon: <Lock className="w-8 h-8 text-gray-500" />,
          requiredPlan: 'Pro',
        };
    }
  };

  const featureInfo = getFeatureInfo(feature);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm"
    >
      <div className="flex justify-center mb-4">
        {featureInfo.icon}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {featureInfo.title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {featureInfo.description}
      </p>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-2">
          Available with <span className="font-semibold text-blue-600">{featureInfo.requiredPlan}</span> plan and above
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => window.location.href = '/pricing'}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to {featureInfo.requiredPlan}
        </Button>
        
        <Button
          onClick={() => window.location.href = '/billing'}
          variant="outline"
        >
          View Current Plan
        </Button>
      </div>
    </motion.div>
  );
}

// Higher-order component for easier usage
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  userId?: string
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} userId={userId}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
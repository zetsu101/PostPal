"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscriptionManager } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  userId?: string;
}

export default function FeatureGate({ 
  children, 
  feature, 
  fallback, 
  showUpgradePrompt = true,
  userId 
}: FeatureGateProps) {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const resolvedUserId = userId || user?.id || '1';
  const hasAccess = subscriptionManager.hasFeatureAccess(resolvedUserId, feature);
  const upgradePlans = subscriptionManager.getUpgradeRecommendations(resolvedUserId);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <>
      {/* Feature Locked Overlay */}
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Premium Feature</h3>
            <p className="text-[#6B7280] mb-4">
              This feature is available on {upgradePlans[0]?.name || 'Pro'} plan and above.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-[#1F2937] mb-4">Unlock Premium Features</h3>
                <p className="text-[#6B7280] mb-6">
                  Upgrade your plan to access advanced features and unlock your full potential.
                </p>
                
                <div className="space-y-3 mb-6">
                  {upgradePlans.slice(0, 2).map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#1F2937]">{plan.name}</h4>
                        <span className="text-lg font-bold text-[#87CEFA]">
                          ${plan.price}/month
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-3">{plan.description}</p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="w-full px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
                      >
                        Choose {plan.name}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Usage limit component
interface UsageLimitProps {
  children: React.ReactNode;
  resource: 'postsThisMonth' | 'aiGenerationsThisMonth' | 'reportsThisMonth' | 'storageUsedGB' | 'apiCallsThisMonth';
  fallback?: React.ReactNode;
  userId?: string;
}

export function UsageLimit({ 
  children, 
  resource, 
  fallback,
  userId = 'user_1' 
}: UsageLimitProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasLimit = subscriptionManager.checkUsageLimit(userId, resource);
  const upgradePlans = subscriptionManager.getUpgradeRecommendations(userId);

  if (hasLimit) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {/* Usage Limit Overlay */}
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Usage Limit Reached</h3>
            <p className="text-[#6B7280] mb-4">
              You&apos;ve reached your monthly limit. Upgrade to continue using this feature.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-2xl font-bold text-[#1F2937] mb-4">Upgrade for More</h3>
                <p className="text-[#6B7280] mb-6">
                  Get higher limits and unlock unlimited usage with our premium plans.
                </p>
                
                <div className="space-y-3 mb-6">
                  {upgradePlans.slice(0, 2).map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#1F2937]">{plan.name}</h4>
                        <span className="text-lg font-bold text-[#87CEFA]">
                          ${plan.price}/month
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-3">{plan.description}</p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="w-full px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
                      >
                        Choose {plan.name}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 
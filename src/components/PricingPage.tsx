"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SUBSCRIPTION_PLANS, 
  YEARLY_PLANS, 
  subscriptionManager, 
  formatPrice,
  type SubscriptionPlan 
} from "@/lib/subscription";
import { useAuth } from "@/lib/auth";

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = billingCycle === 'monthly' ? SUBSCRIPTION_PLANS : YEARLY_PLANS;
  const currentUserId = user?.id || '1';
  const currentPlan = subscriptionManager.getUserPlan(currentUserId);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    try {
      const success = await subscriptionManager.upgradeSubscription(currentUserId, selectedPlan);
      if (success) {
        setShowUpgradeModal(false);
        // In a real app, you'd redirect to payment processing
        alert('Subscription upgraded successfully!');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPopularBadge = (plan: SubscriptionPlan) => {
    if (!plan.popular) return null;
    return (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </span>
      </div>
    );
  };

  const getCurrentPlanBadge = (planId: string) => {
    if (currentPlan?.id === planId) {
      return (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[#10B981] text-white px-4 py-1 rounded-full text-sm font-semibold">
            Current Plan
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280] mb-8 max-w-3xl mx-auto"
          >
            Start free and scale as you grow. All plans include our core features with different usage limits.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                billingCycle === 'yearly' ? 'bg-[#87CEFA]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${billingCycle === 'yearly' ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>
              Yearly
              <span className="ml-2 text-sm bg-[#10B981] text-white px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-[#87CEFA] scale-105' 
                  : currentPlan?.id === plan.id 
                    ? 'border-[#10B981]' 
                    : 'border-gray-200 hover:border-[#87CEFA]/50'
              }`}
            >
              {getPopularBadge(plan)}
              {getCurrentPlanBadge(plan.id)}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#1F2937] mb-2">{plan.name}</h3>
                <p className="text-[#6B7280] mb-4">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#1F2937]">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-[#6B7280]">
                      per {billingCycle === 'monthly' ? 'month' : 'year'}
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[#6B7280] text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={currentPlan?.id === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  currentPlan?.id === plan.id
                    ? 'bg-gray-100 text-[#6B7280] cursor-not-allowed'
                    : plan.popular
                      ? 'bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white hover:shadow-lg hover:scale-105'
                      : 'bg-white border-2 border-[#87CEFA] text-[#87CEFA] hover:bg-[#87CEFA] hover:text-white'
                }`}
              >
                {currentPlan?.id === plan.id ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-[#1F2937] text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-3">Can I change my plan anytime?</h3>
              <p className="text-[#6B7280]">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-3">Is there a free trial?</h3>
              <p className="text-[#6B7280]">Yes, all paid plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-3">What payment methods do you accept?</h3>
              <p className="text-[#6B7280]">We accept all major credit cards, PayPal, and Apple Pay for secure payments.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-3">Can I cancel anytime?</h3>
              <p className="text-[#6B7280]">Absolutely! You can cancel your subscription at any time with no cancellation fees.</p>
            </div>
          </div>
        </motion.div>
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
                <h3 className="text-2xl font-bold text-[#1F2937] mb-4">Upgrade Your Plan</h3>
                <p className="text-[#6B7280] mb-6">
                  You&apos;re about to upgrade to the {selectedPlan && plans.find(p => p.id === selectedPlan)?.name} plan.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-lg font-semibold text-[#1F2937]">
                    {selectedPlan && formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    per {billingCycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
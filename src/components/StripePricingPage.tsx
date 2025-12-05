"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Star } from 'lucide-react';
import PricingCard from './PricingCard';
import { useToast } from './ui/Toast';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe';
import { getStripe } from '@/lib/stripe';

export default function StripePricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<SubscriptionPlan>('free');
  const { addToast } = useToast();

  useEffect(() => {
    // In a real app, fetch user's current plan from your API
    // For now, we'll use localStorage or mock data
    const savedPlan = localStorage.getItem('userPlan') as SubscriptionPlan || 'free';
    setCurrentUserPlan(savedPlan);
    setSelectedPlan(savedPlan);
  }, []);

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (plan === 'free') {
      setSelectedPlan(plan);
      addToast({
        title: 'Plan Selected',
        message: 'You are now on the free plan.',
        type: 'info',
      });
      return;
    }

    if (plan === currentUserPlan) {
      addToast({
        title: 'Current Plan',
        message: 'This is your current plan.',
        type: 'info',
      });
      return;
    }

    setIsLoading(true);
    try {
      const priceId = SUBSCRIPTION_PLANS[plan].priceId;
      if (!priceId) {
        throw new Error('Price ID not configured');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          metadata: {
            plan,
            userId: 'current-user-id', // In real app, get from auth context
          },
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      addToast({
        title: 'Payment Error',
        message: 'Failed to start checkout process. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] bg-clip-text text-transparent ml-4">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Scale your social media presence with our powerful AI-driven content creation tools. 
              Start free and upgrade as you grow.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan], index) => {
            const planType = planKey as SubscriptionPlan;
            const isPopular = planKey === 'pro';
            const isSelected = selectedPlan === planType;
            const isCurrentPlan = currentUserPlan === planType;

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PricingCard
                  plan={planType}
                  name={plan.name}
                  description={plan.description}
                  price={plan.price}
                  features={[...plan.features]}
                  isPopular={isPopular}
                  onSelect={handlePlanSelect}
                  isSelected={isCurrentPlan}
                  isLoading={isLoading}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-16 border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Compare All Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">AI-Generated Posts</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">5/month</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Unlimited</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">Social Media Accounts</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">2</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Unlimited</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">Analytics</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Basic</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Advanced</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Custom</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">Content Scheduling</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">❌</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">✅</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">Team Collaboration</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">❌</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">✅</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">API Access</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">❌</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">❌</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">Support</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Standard</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Priority</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-300">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-300">Yes! Our free plan includes 5 AI-generated posts per month with no credit card required.</p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-300">We accept all major credit cards through our secure Stripe payment processor.</p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-300">Absolutely! Cancel anytime with no cancellation fees. Your plan remains active until the end of your billing period.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

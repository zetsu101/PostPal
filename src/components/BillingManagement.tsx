"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  subscriptionManager, 
  formatPrice, 
  formatUsagePercentage,
  getPlanColor,
  type UsageMetrics 
} from "@/lib/subscription";
import { useAuth } from "@/lib/auth";

export default function BillingManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUserId = user?.id || '1';
  const subscription = subscriptionManager.getUserSubscription(currentUserId);
  const plan = subscriptionManager.getUserPlan(currentUserId);
  const usageMetrics = subscriptionManager.getUsageMetrics(currentUserId);
  const billingInfo = subscriptionManager.getBillingInfo(currentUserId);
  const invoices = subscriptionManager.getInvoiceHistory(currentUserId);

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      const success = await subscriptionManager.cancelSubscription(currentUserId);
      if (success) {
        setShowCancelModal(false);
        alert('Subscription will be canceled at the end of the current billing period.');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-[#EF4444]';
    if (percentage >= 75) return 'bg-[#F59E0B]';
    return 'bg-[#10B981]';
  };

  const getUsageBarWidth = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    const percentage = Math.min((used / limit) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Billing & Subscription</h2>
          <p className="text-[#6B7280]">Manage your subscription, billing information, and usage</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
          >
            Change Plan
          </button>
          {subscription && !subscription.cancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "usage", label: "Usage", icon: "📈" },
          { id: "billing", label: "Billing", icon: "💳" },
          { id: "invoices", label: "Invoices", icon: "📄" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#87CEFA] shadow-md"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Current Plan</h3>
                {subscription?.cancelAtPeriodEnd && (
                  <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full text-sm font-medium">
                    Canceling
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-[#1F2937] mb-2">{plan?.name}</div>
                  <div className="text-[#6B7280] mb-4">{plan?.description}</div>
                  <div className="text-3xl font-bold text-[#87CEFA]">
                    {plan?.price === 0 ? 'Free' : formatPrice(plan?.price || 0)}
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    per {plan?.billingCycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-[#6B7280] mb-2">Billing Period</div>
                  <div className="text-[#1F2937] font-medium">
                    {subscription && new Date(subscription.currentPeriodStart).toLocaleDateString()} - {subscription && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-[#6B7280] mb-2">Status</div>
                  <div className={`font-medium ${
                    subscription?.status === 'active' ? 'text-[#10B981]' : 
                    subscription?.status === 'past_due' ? 'text-[#EF4444]' : 
                    'text-[#6B7280]'
                  }`}>
                    {subscription?.status?.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-[#1F2937] mb-1">Usage</div>
                <div className="text-sm text-[#6B7280]">Track your usage</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl mb-2">💳</div>
                <div className="font-semibold text-[#1F2937] mb-1">Payment</div>
                <div className="text-sm text-[#6B7280]">Update payment method</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-[#1F2937] mb-1">Invoices</div>
                <div className="text-sm text-[#6B7280]">View billing history</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold text-[#1F2937] mb-1">Settings</div>
                <div className="text-sm text-[#6B7280]">Manage preferences</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "usage" && usageMetrics && (
          <motion.div
            key="usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Usage Overview */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Usage This Month</h3>
              
              <div className="space-y-6">
                {/* Posts */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7280]">Posts</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.postsUsed} / {usageMetrics.postsLimit === -1 ? '∞' : usageMetrics.postsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(formatUsagePercentage(usageMetrics.postsUsed, usageMetrics.postsLimit))}`}
                      style={{ width: getUsageBarWidth(usageMetrics.postsUsed, usageMetrics.postsLimit) }}
                    />
                  </div>
                </div>

                {/* AI Generations */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7280]">AI Generations</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.aiGenerationsUsed} / {usageMetrics.aiGenerationsLimit === -1 ? '∞' : usageMetrics.aiGenerationsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(formatUsagePercentage(usageMetrics.aiGenerationsUsed, usageMetrics.aiGenerationsLimit))}`}
                      style={{ width: getUsageBarWidth(usageMetrics.aiGenerationsUsed, usageMetrics.aiGenerationsLimit) }}
                    />
                  </div>
                </div>

                {/* Reports */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7280]">Analytics Reports</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.reportsUsed} / {usageMetrics.reportsLimit === -1 ? '∞' : usageMetrics.reportsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(formatUsagePercentage(usageMetrics.reportsUsed, usageMetrics.reportsLimit))}`}
                      style={{ width: getUsageBarWidth(usageMetrics.reportsUsed, usageMetrics.reportsLimit) }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7280]">Storage</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.storageUsedGB.toFixed(1)}GB / {usageMetrics.storageLimitGB === -1 ? '∞' : usageMetrics.storageLimitGB}GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(formatUsagePercentage(usageMetrics.storageUsedGB, usageMetrics.storageLimitGB))}`}
                      style={{ width: getUsageBarWidth(usageMetrics.storageUsedGB, usageMetrics.storageLimitGB) }}
                    />
                  </div>
                </div>

                {/* API Calls */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#6B7280]">API Calls</span>
                    <span className="text-sm font-medium">
                      {usageMetrics.apiCallsUsed} / {usageMetrics.apiCallsLimit === -1 ? '∞' : usageMetrics.apiCallsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(formatUsagePercentage(usageMetrics.apiCallsUsed, usageMetrics.apiCallsLimit))}`}
                      style={{ width: getUsageBarWidth(usageMetrics.apiCallsUsed, usageMetrics.apiCallsLimit) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "billing" && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Billing Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Billing Information</h3>
              
              {billingInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Name</label>
                      <div className="text-[#1F2937]">{billingInfo.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                      <div className="text-[#1F2937]">{billingInfo.email}</div>
                    </div>
                  </div>
                  
                  {billingInfo.address && (
                    <div>
                      <label className="block text-sm font-medium text-[#6B7280] mb-1">Address</label>
                      <div className="text-[#1F2937]">
                        {billingInfo.address.line1}<br />
                        {billingInfo.address.line2 && <>{billingInfo.address.line2}<br /></>}
                        {billingInfo.address.city}, {billingInfo.address.state} {billingInfo.address.postalCode}<br />
                        {billingInfo.address.country}
                      </div>
                    </div>
                  )}
                  
                  <button className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors">
                    Update Billing Information
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💳</div>
                  <p className="text-[#6B7280] mb-4">No billing information on file</p>
                  <button className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors">
                    Add Billing Information
                  </button>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Payment Methods</h3>
              
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-[#6B7280] mb-4">No payment methods on file</p>
                <button className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors">
                  Add Payment Method
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "invoices" && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Invoice History */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Invoice History</h3>
              
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-[#1F2937]">{invoice.description}</div>
                        <div className="text-sm text-[#6B7280]">{new Date(invoice.date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-[#1F2937]">{formatPrice(invoice.amount, invoice.currency)}</div>
                          <div className={`text-sm ${
                            invoice.status === 'paid' ? 'text-[#10B981]' :
                            invoice.status === 'pending' ? 'text-[#F59E0B]' :
                            'text-[#EF4444]'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-gray-100 text-[#6B7280] rounded text-sm hover:bg-gray-200 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-[#6B7280]">No invoices yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Subscription Modal */}
      <AnimatePresence>
        {showCancelModal && (
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
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-[#1F2937] mb-4">Cancel Subscription?</h3>
                <p className="text-[#6B7280] mb-6">
                  Your subscription will remain active until the end of your current billing period. You can reactivate anytime.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Cancel Subscription'}
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
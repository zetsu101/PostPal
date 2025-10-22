"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe';

interface BillingInfo {
  customerId: string;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    plan: SubscriptionPlan;
  };
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    created: string;
    invoicePdf?: string;
  }>;
}

export default function BillingDashboard() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = async () => {
    try {
      // In a real app, this would fetch from your API
      // For now, we'll use mock data
      const mockBillingInfo: BillingInfo = {
        customerId: 'cus_mock123',
        subscription: {
          id: 'sub_mock123',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          plan: 'pro',
        },
        invoices: [
          {
            id: 'in_mock123',
            amount: 2900, // $29.00
            status: 'paid',
            created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            invoicePdf: 'https://example.com/invoice.pdf',
          },
          {
            id: 'in_mock124',
            amount: 2900,
            status: 'paid',
            created: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            invoicePdf: 'https://example.com/invoice2.pdf',
          },
        ],
      };
      
      setBillingInfo(mockBillingInfo);
    } catch (error) {
      console.error('Failed to load billing info:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load billing information',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!billingInfo?.customerId) return;

    setIsOpeningPortal(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: billingInfo.customerId,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open customer portal');
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      addToast({
        title: 'Error',
        message: 'Failed to open billing portal',
        type: 'error',
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const downloadInvoice = (invoiceId: string, invoicePdf?: string) => {
    if (invoicePdf) {
      window.open(invoicePdf, '_blank');
    } else {
      addToast({
        title: 'Invoice Download',
        message: 'Invoice download not available',
        type: 'info',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'canceled':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'past_due':
        return 'text-red-600 bg-red-100';
      case 'canceled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Information</h3>
        <p className="text-gray-500">You're currently on the free plan.</p>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[billingInfo.subscription.plan];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
          <Button
            onClick={openCustomerPortal}
            disabled={isOpeningPortal}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isOpeningPortal ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Opening...
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentPlan.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(billingInfo.subscription.status)}
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(billingInfo.subscription.status)}`}>
                {billingInfo.subscription.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600">{currentPlan.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Next Billing Date</h4>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">
                {new Date(billingInfo.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
            {billingInfo.subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-red-600 mt-2">Subscription will cancel at period end</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Plan Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {currentPlan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingInfo.invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">
                    {new Date(invoice.created).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    ${(invoice.amount / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => downloadInvoice(invoice.id, invoice.invoicePdf)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

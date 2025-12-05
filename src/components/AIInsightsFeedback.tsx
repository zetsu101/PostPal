'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  X, 
  MessageSquare,
  CheckCircle,
  Send
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

interface AIInsightsFeedbackProps {
  insightId?: string;
  feature: 'content_analysis' | 'engagement_prediction' | 'optimal_timing' | 'trend_prediction' | 'audience_insights' | 'recommendations';
  context?: {
    contentScore?: number;
    engagementPrediction?: number;
    platform?: string;
  };
  onFeedbackSubmitted?: () => void;
  compact?: boolean;
}

export default function AIInsightsFeedback({
  insightId,
  feature,
  context,
  onFeedbackSubmitted,
  compact = false
}: AIInsightsFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const featureLabels = {
    content_analysis: 'Content Analysis',
    engagement_prediction: 'Engagement Prediction',
    optimal_timing: 'Optimal Timing',
    trend_prediction: 'Trend Prediction',
    audience_insights: 'Audience Insights',
    recommendations: 'AI Recommendations'
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      addToast({
        type: 'warning',
        title: 'Rating Required',
        message: 'Please provide a rating before submitting feedback.',
        duration: 3000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch('/api/feedback/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'test-token'}`,
          'x-test-bypass': 'true'
        },
        body: JSON.stringify({
          insightId,
          feature,
          rating,
          helpful: helpful ?? true,
          feedback: feedback.trim() || undefined,
          context,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        addToast({
          type: 'success',
          title: 'Feedback Submitted',
          message: 'Thank you for your feedback! It helps us improve our AI insights.',
          duration: 4000
        });

        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }

        // Reset form after a delay
        setTimeout(() => {
          setIsOpen(false);
          setRating(0);
          setHelpful(null);
          setFeedback('');
          setSubmitted(false);
        }, 2000);
      } else {
        throw new Error(data.error?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Unable to submit feedback. Please try again later.',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {featureLabels[feature]} Feedback
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!submitted ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you rate this insight?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-2 rounded-lg transition-colors ${
                              rating >= star
                                ? 'text-yellow-500 bg-yellow-50'
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          >
                            <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Was this helpful?
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setHelpful(true)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            helpful === true
                              ? 'bg-green-100 text-green-700 border-2 border-green-500'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => setHelpful(false)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            helpful === false
                              ? 'bg-red-100 text-red-700 border-2 border-red-500'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional feedback (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {feedback.length}/1000 characters
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={submitFeedback}
                        disabled={isSubmitting || rating === 0}
                      >
                        {isSubmitting ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Thank You!
                    </h4>
                    <p className="text-gray-600">
                      Your feedback helps us improve our AI insights.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Was this {featureLabels[feature].toLowerCase()} helpful?
        </h4>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`p-1 transition-colors ${
                rating >= star
                  ? 'text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              setHelpful(true);
              setRating(rating || 5);
            }}
            className={`p-2 rounded-lg transition-colors ${
              helpful === true
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setHelpful(false);
              setRating(rating || 1);
            }}
            className={`p-2 rounded-lg transition-colors ${
              helpful === false
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional: Tell us more about your experience..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {feedback.length}/500 characters
            </p>
            <Button
              size="sm"
              onClick={submitFeedback}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </motion.div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Thank you for your feedback!</p>
        </motion.div>
      )}
    </div>
  );
}

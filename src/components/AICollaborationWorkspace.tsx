'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Brain, 
  Zap, 
  Share2, 
  MessageSquare, 
  ThumbsUp, 
  Edit3, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Crown,
  Star,
  Clock,
  Activity
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  lastSeen: Date;
  currentActivity?: string;
}

interface CollaborationSession {
  id: string;
  contentId: string;
  title: string;
  collaborators: Collaborator[];
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface RealTimeUpdate {
  type: 'content_edit' | 'comment' | 'suggestion' | 'approval' | 'user_join' | 'user_leave';
  userId: string;
  userName: string;
  data: any;
  timestamp: number;
}

interface AICollaborationFeature {
  contentId: string;
  sessionId: string;
  collaborators: Collaborator[];
  realTimeUpdates: RealTimeUpdate[];
  aiSuggestions: any[];
  isActive: boolean;
}

export default function AICollaborationWorkspace() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  const { isConnected, lastMessage, sendMessage } = useAIInsightsWebSocket();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const updatesEndRef = useRef<HTMLDivElement>(null);

  // Mock collaborators for demo
  useEffect(() => {
    setCollaborators([
      {
        id: 'user-1',
        name: 'Sarah Johnson',
        email: 'sarah@postpal.com',
        role: 'owner',
        isOnline: true,
        lastSeen: new Date(),
        currentActivity: 'Editing content'
      },
      {
        id: 'user-2',
        name: 'Mike Chen',
        email: 'mike@postpal.com',
        role: 'editor',
        isOnline: true,
        lastSeen: new Date(),
        currentActivity: 'Reviewing suggestions'
      },
      {
        id: 'user-3',
        name: 'Emily Davis',
        email: 'emily@postpal.com',
        role: 'viewer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        currentActivity: undefined
      }
    ]);
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'collaboration_update') {
        setRealTimeUpdates(prev => [...prev.slice(-9), {
          type: update.data.type,
          userId: update.data.userId,
          userName: update.data.userName,
          data: update.data.data,
          timestamp: update.timestamp
        }]);
      }
      
      if (update.type === 'ai_suggestion') {
        setAiSuggestions(prev => [...prev.slice(-4), update.data]);
      }
    }
  }, [lastMessage]);

  // Auto-scroll to latest updates
  useEffect(() => {
    updatesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realTimeUpdates]);

  // Start collaboration session
  const startCollaboration = async () => {
    if (!content.trim()) {
      alert('Please add some content to collaborate on');
      return;
    }

    setIsCollaborating(true);
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Send collaboration start message
    sendMessage({
      type: 'start_collaboration',
      data: {
        sessionId: newSessionId,
        contentId: `content_${Date.now()}`,
        content: content,
        platform: platform,
        collaborators: collaborators.map(c => ({ id: c.id, name: c.name, role: c.role }))
      }
    });

    // Add initial activity
    setRealTimeUpdates(prev => [...prev, {
      type: 'user_join',
      userId: 'current-user',
      userName: 'You',
      data: { action: 'started collaboration session' },
      timestamp: Date.now()
    }]);
  };

  // Stop collaboration
  const stopCollaboration = () => {
    setIsCollaborating(false);
    setSessionId(null);
    
    sendMessage({
      type: 'end_collaboration',
      data: { sessionId }
    });
  };

  // Send comment
  const sendComment = () => {
    if (!newComment.trim() || !sessionId) return;

    const comment = {
      id: `comment_${Date.now()}`,
      text: newComment,
      userId: 'current-user',
      userName: 'You',
      timestamp: Date.now()
    };

    setRealTimeUpdates(prev => [...prev, {
      type: 'comment',
      userId: 'current-user',
      userName: 'You',
      data: comment,
      timestamp: Date.now()
    }]);

    sendMessage({
      type: 'collaboration_message',
      data: {
        sessionId,
        type: 'comment',
        message: comment
      }
    });

    setNewComment('');
  };

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!content.trim()) return;

    setIsGeneratingSuggestions(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: {
            text: content,
            sentiment: 0,
            readability: 60,
            urgency: 0,
            callToAction: false,
            trendingTopics: [],
            scheduledTime: new Date().toISOString()
          },
          platform,
          audienceData: null,
          historicalData: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const suggestions = [
          {
            id: `suggestion_${Date.now()}`,
            type: 'content_improvement',
            title: 'Content Enhancement',
            description: 'AI suggests improving engagement',
            details: data.data.recommendations.slice(0, 3),
            confidence: data.data.engagementPrediction.confidence,
            priority: 'medium'
          },
          {
            id: `suggestion_${Date.now() + 1}`,
            type: 'hashtag_optimization',
            title: 'Hashtag Optimization',
            description: 'Add trending hashtags for better reach',
            details: ['#AI', '#SocialMedia', '#Innovation', '#Tech'],
            confidence: 0.85,
            priority: 'high'
          },
          {
            id: `suggestion_${Date.now() + 2}`,
            type: 'timing_optimization',
            title: 'Optimal Timing',
            description: 'Post during peak engagement hours',
            details: ['Tuesday 9 AM', 'Wednesday 1 PM', 'Thursday 5 PM'],
            confidence: 0.78,
            priority: 'medium'
          }
        ];

        setAiSuggestions(suggestions);

        // Send AI suggestions to collaborators
        sendMessage({
          type: 'ai_suggestions',
          data: {
            sessionId,
            suggestions: suggestions
          }
        });

        setRealTimeUpdates(prev => [...prev, {
          type: 'suggestion',
          userId: 'ai-assistant',
          userName: 'AI Assistant',
          data: { 
            action: 'generated new suggestions',
            count: suggestions.length
          },
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion: any) => {
    if (suggestion.type === 'hashtag_optimization') {
      const hashtags = suggestion.details.join(' ');
      setContent(prev => prev + ' ' + hashtags);
    }

    setRealTimeUpdates(prev => [...prev, {
      type: 'suggestion',
      userId: 'current-user',
      userName: 'You',
      data: { 
        action: 'applied suggestion',
        suggestionType: suggestion.type,
        suggestionTitle: suggestion.title
      },
      timestamp: Date.now()
    }]);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content_edit': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'suggestion': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'approval': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'user_join': return <Users className="w-4 h-4 text-blue-500" />;
      case 'user_leave': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI Collaboration Workspace
              </h1>
              <p className="text-gray-600">
                Real-time collaboration with AI-powered suggestions and insights
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <Activity className="w-4 h-4" />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {isCollaborating && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                  <span>Collaborating</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-purple-500" />
                  Content Editor
                </h2>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your content here..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={isCollaborating ? stopCollaboration : startCollaboration}
                    className={`px-4 py-2 rounded-lg text-white flex items-center ${
                      isCollaborating 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isCollaborating ? 'Stop Collaboration' : 'Start Collaboration'}
                  </button>

                  <button
                    onClick={generateAISuggestions}
                    disabled={isGeneratingSuggestions || !content.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGeneratingSuggestions ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingSuggestions ? 'Generating...' : 'AI Suggestions'}
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {content.length} characters
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  AI Suggestions
                </h3>
                
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          
                          {suggestion.details && (
                            <div className="mt-2">
                              {Array.isArray(suggestion.details) ? (
                                <div className="flex flex-wrap gap-1">
                                  {suggestion.details.map((detail: any, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                      {detail}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700">{suggestion.details}</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <div className={`px-2 py-1 rounded text-xs ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {suggestion.priority}
                          </div>
                          
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Collaborators Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Collaborators
              </h3>
              
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {collaborator.name}
                        </p>
                        {getRoleIcon(collaborator.role)}
                      </div>
                      
                      {collaborator.currentActivity && (
                        <p className="text-xs text-gray-500 truncate">
                          {collaborator.currentActivity}
                        </p>
                      )}
                      
                      {!collaborator.isOnline && (
                        <p className="text-xs text-gray-400">
                          Last seen {Math.floor((Date.now() - collaborator.lastSeen.getTime()) / 60000)}m ago
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Updates */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Live Updates
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {realTimeUpdates.map((update, index) => (
                    <motion.div
                      key={`${update.timestamp}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(update.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {update.userName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {update.type === 'comment' ? update.data.text :
                           update.type === 'suggestion' ? update.data.action :
                           update.type === 'user_join' ? 'joined the session' :
                           update.type === 'user_leave' ? 'left the session' :
                           'updated content'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <div ref={updatesEndRef} />
              </div>

              {/* Comment Input */}
              {isCollaborating && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                    />
                    <button
                      onClick={sendComment}
                      disabled={!newComment.trim()}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

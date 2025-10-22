'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Edit3, 
  MessageSquare, 
  Send, 
  Smile, 
  Image, 
  Link, 
  Hash,
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Code,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Share2,
  Copy,
  Download,
  Upload,
  Trash2,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  cursorPosition?: number;
  currentActivity?: string;
  color: string;
}

interface ContentChange {
  id: string;
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'format';
  position: number;
  content?: string;
  length?: number;
  timestamp: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  resolved: boolean;
  position?: number;
  replies: Comment[];
}

interface AISuggestion {
  id: string;
  type: 'content' | 'hashtag' | 'timing' | 'style';
  title: string;
  description: string;
  content: string;
  confidence: number;
  applied: boolean;
}

export default function LiveContentCollaboration() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { isConnected, lastMessage, sendMessage } = useAIInsightsWebSocket();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Mock collaborators
  useEffect(() => {
    setCollaborators([
      {
        id: 'user-1',
        name: 'Sarah Johnson',
        email: 'sarah@postpal.com',
        role: 'owner',
        isOnline: true,
        color: '#3B82F6',
        currentActivity: 'Editing content'
      },
      {
        id: 'user-2',
        name: 'Mike Chen',
        email: 'mike@postpal.com',
        role: 'editor',
        isOnline: true,
        color: '#10B981',
        currentActivity: 'Adding comments'
      },
      {
        id: 'user-3',
        name: 'Emily Davis',
        email: 'emily@postpal.com',
        role: 'viewer',
        isOnline: false,
        color: '#F59E0B',
        currentActivity: undefined
      }
    ]);
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'collaboration_update') {
        const data = update.data;
        
        switch (data.type) {
          case 'content_change':
            handleContentChange(data);
            break;
          case 'comment_added':
            setComments(prev => [...prev, data.comment]);
            break;
          case 'ai_suggestion':
            setAiSuggestions(prev => [...prev, data.suggestion]);
            break;
          case 'user_activity':
            updateUserActivity(data.userId, data.activity);
            break;
        }
      }
    }
  }, [lastMessage]);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Handle content changes
  const handleContentChange = (change: ContentChange) => {
    if (change.userId === 'current-user') return; // Don't apply our own changes
    
    setContent(prev => {
      let newContent = prev;
      
      if (change.type === 'insert' && change.content) {
        newContent = prev.slice(0, change.position) + change.content + prev.slice(change.position);
      } else if (change.type === 'delete' && change.length) {
        newContent = prev.slice(0, change.position) + prev.slice(change.position + change.length);
      }
      
      return newContent;
    });
  };

  // Update user activity
  const updateUserActivity = (userId: string, activity: string) => {
    setCollaborators(prev => 
      prev.map(collaborator => 
        collaborator.id === userId 
          ? { ...collaborator, currentActivity: activity }
          : collaborator
      )
    );
  };

  // Start live collaboration
  const startLiveCollaboration = () => {
    if (!content.trim()) {
      alert('Please add some content to collaborate on');
      return;
    }

    setIsLive(true);
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Save initial content to history
    setContentHistory([content]);
    setHistoryIndex(0);

    // Send collaboration start message
    sendMessage({
      type: 'start_collaboration',
      data: {
        sessionId: newSessionId,
        contentId: `content_${Date.now()}`,
        title: title || 'Untitled Content',
        content: content,
        platform: platform,
        collaborators: collaborators.map(c => ({ 
          id: c.id, 
          name: c.name, 
          role: c.role,
          color: c.color
        }))
      }
    });
  };

  // Stop live collaboration
  const stopLiveCollaboration = () => {
    setIsLive(false);
    setSessionId(null);
    
    sendMessage({
      type: 'end_collaboration',
      data: { sessionId }
    });
  };

  // Handle content input
  const handleContentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldContent = content;
    
    setContent(newContent);

    // Save to history
    if (newContent !== oldContent) {
      const newHistory = contentHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setContentHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Send change to collaborators
    if (isLive && sessionId) {
      const change: ContentChange = {
        id: `change_${Date.now()}`,
        userId: 'current-user',
        userName: 'You',
        type: newContent.length > oldContent.length ? 'insert' : 'delete',
        position: e.target.selectionStart || 0,
        content: newContent.length > oldContent.length ? newContent.slice(oldContent.length) : undefined,
        length: newContent.length < oldContent.length ? oldContent.length - newContent.length : undefined,
        timestamp: Date.now()
      };

      sendMessage({
        type: 'collaboration_message',
        data: {
          sessionId,
          type: 'content_change',
          change: change
        }
      });
    }
  };

  // Add comment
  const addComment = () => {
    if (!newComment.trim() || !sessionId) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content: newComment,
      timestamp: Date.now(),
      resolved: false,
      replies: []
    };

    setComments(prev => [...prev, comment]);

    sendMessage({
      type: 'collaboration_message',
      data: {
        sessionId,
        type: 'comment_added',
        comment: comment
      }
    });

    setNewComment('');
  };

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!content.trim()) return;

    setIsGeneratingAI(true);

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
        
        const suggestions: AISuggestion[] = [
          {
            id: `suggestion_${Date.now()}`,
            type: 'content',
            title: 'Content Enhancement',
            description: 'Improve engagement with these suggestions',
            content: data.data.recommendations.join(' '),
            confidence: data.data.engagementPrediction.confidence,
            applied: false
          },
          {
            id: `suggestion_${Date.now() + 1}`,
            type: 'hashtag',
            title: 'Hashtag Optimization',
            description: 'Add trending hashtags for better reach',
            content: '#AI #SocialMedia #Innovation #Tech #Content',
            confidence: 0.85,
            applied: false
          },
          {
            id: `suggestion_${Date.now() + 2}`,
            type: 'timing',
            title: 'Optimal Timing',
            description: 'Best times to post for maximum engagement',
            content: 'Tuesday 9 AM, Wednesday 1 PM, Thursday 5 PM',
            confidence: 0.78,
            applied: false
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
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.type === 'hashtag') {
      setContent(prev => prev + ' ' + suggestion.content);
    } else if (suggestion.type === 'content') {
      setContent(prev => prev + '\n\n' + suggestion.content);
    }

    setAiSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, applied: true } : s)
    );

    // Send suggestion application to collaborators
    if (isLive && sessionId) {
      sendMessage({
        type: 'collaboration_message',
        data: {
          sessionId,
          type: 'suggestion_applied',
          suggestion: suggestion
        }
      });
    }
  };

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(contentHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < contentHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(contentHistory[historyIndex + 1]);
    }
  };

  // Get collaborator color
  const getCollaboratorColor = (userId: string) => {
    const collaborator = collaborators.find(c => c.id === userId);
    return collaborator?.color || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Live Content Collaboration
              </h1>
              <p className="text-gray-600">
                Real-time collaborative content creation with AI assistance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {isLive && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Content title..."
                    className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none"
                  />
                  
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={redo}
                    disabled={historyIndex >= contentHistory.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Editor */}
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentInput}
                placeholder="Start writing your content here..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              />

              {/* Editor Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                    <Underline className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                    <List className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={isLive ? stopLiveCollaboration : startLiveCollaboration}
                    className={`px-4 py-2 rounded-lg text-white flex items-center ${
                      isLive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isLive ? 'Stop Collaboration' : 'Start Live Collaboration'}
                  </button>

                  <button
                    onClick={generateAISuggestions}
                    disabled={isGeneratingAI || !content.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingAI ? 'Generating...' : 'AI Suggestions'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-500" />
                    AI Suggestions
                  </h3>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showSuggestions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 ${
                        suggestion.applied ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          <p className="text-sm text-gray-700 mt-2">{suggestion.content}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <div className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </div>
                          
                          {suggestion.applied ? (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Applied
                            </div>
                          ) : (
                            <button
                              onClick={() => applySuggestion(suggestion)}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Collaborators
              </h3>
              
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: collaborator.color }}
                      >
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
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
                        <span className={`text-xs px-2 py-1 rounded ${
                          collaborator.role === 'owner' ? 'bg-yellow-100 text-yellow-700' :
                          collaborator.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {collaborator.role}
                        </span>
                      </div>
                      
                      {collaborator.currentActivity && (
                        <p className="text-xs text-gray-500 truncate">
                          {collaborator.currentActivity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                  Comments
                </h3>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showComments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {showComments && (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: getCollaboratorColor(comment.userId) }}
                        >
                          {comment.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.userName}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>

                  {/* Comment Input */}
                  {isLive && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && addComment()}
                      />
                      <button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

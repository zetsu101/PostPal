"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Folder, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Share2,
  Star,
  Tag,
  Calendar,
  Eye,
  EyeOff,
  Grid,
  List,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderPlus,
  BookmarkPlus,
  RefreshCw,
  Upload,
  Download as DownloadIcon
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { GeneratedContent } from '@/lib/ai-service';

interface SavedContent extends GeneratedContent {
  id: string;
  title: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isTemplate: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: any;
  count: number;
}

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Content', color: 'from-gray-500 to-gray-600', icon: Bookmark, count: 0 },
  { id: 'captions', name: 'Captions', color: 'from-purple-500 to-pink-500', icon: Sparkles, count: 0 },
  { id: 'hashtags', name: 'Hashtags', color: 'from-blue-500 to-blue-600', icon: Tag, count: 0 },
  { id: 'image-prompts', name: 'Image Prompts', color: 'from-green-500 to-green-600', icon: Eye, count: 0 },
  { id: 'video-scripts', name: 'Video Scripts', color: 'from-orange-500 to-red-500', icon: Zap, count: 0 },
  { id: 'carousel', name: 'Carousel Content', color: 'from-teal-500 to-cyan-500', icon: BarChart3, count: 0 },
  { id: 'templates', name: 'Templates', color: 'from-indigo-500 to-purple-500', icon: Target, count: 0 },
  { id: 'favorites', name: 'Favorites', color: 'from-yellow-500 to-orange-500', icon: Star, count: 0 },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', color: 'from-blue-600 to-blue-700' },
  { id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-blue-600' },
  { id: 'twitter', name: 'Twitter', color: 'from-blue-400 to-blue-500' },
  { id: 'tiktok', name: 'TikTok', color: 'from-black to-gray-800' },
];

export default function SavedPage() {
  const { addToast } = useToast();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<SavedContent | null>(null);

  // Mock data generation
  useEffect(() => {
    const generateMockContent = () => {
      const content: SavedContent[] = [];
      const contentTypes = ['caption', 'hashtags', 'image-prompt', 'video-script', 'carousel-content'] as const;
      const platforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'] as const;
      const categories = ['captions', 'hashtags', 'image-prompts', 'video-scripts', 'carousel', 'templates'] as const;
      
      for (let i = 0; i < 25; i++) {
        const contentType = contentTypes[i % contentTypes.length];
        const platform = platforms[i % platforms.length];
        const category = categories[i % categories.length];
        
        content.push({
          id: `content-${i}`,
          title: `Saved ${contentType.replace('-', ' ')} ${i + 1}`,
          type: contentType,
          content: `This is a sample ${contentType} content for ${platform}. It includes engaging content that will resonate with our audience.`,
          prompt: {
            topic: `Topic ${i + 1}`,
            platform,
            contentType: 'post',
            tone: 'professional',
            targetAudience: 'Business professionals',
            hashtagCount: 5,
            language: 'English',
            includeEmojis: true,
          },
          metadata: {
            wordCount: Math.floor(Math.random() * 200) + 50,
            hashtagCount: Math.floor(Math.random() * 10) + 1,
            emojiCount: Math.floor(Math.random() * 5),
            estimatedReadTime: Math.floor(Math.random() * 3) + 1,
            generatedAt: new Date(),
          },
          category,
          tags: ['business', 'marketing', 'social-media', 'content-creation'],
          isFavorite: Math.random() > 0.7,
          isTemplate: Math.random() > 0.8,
          usageCount: Math.floor(Math.random() * 10),
          lastUsed: Math.random() > 0.5 ? new Date() : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      return content;
    };

    setTimeout(() => {
      setSavedContent(generateMockContent());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Update category counts
  useEffect(() => {
    const updatedCategories = CATEGORIES.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? savedContent.length 
        : category.id === 'favorites'
          ? savedContent.filter(content => content.isFavorite).length
          : savedContent.filter(content => content.category === category.id).length
    }));
    // In a real app, you'd update the categories state here
  }, [savedContent]);

  const filteredContent = savedContent.filter(content => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'favorites' ? content.isFavorite : content.category === selectedCategory);
    const matchesPlatform = filterPlatform === 'all' || content.prompt.platform === filterPlatform;
    const matchesSearch = searchQuery === '' || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  const handleFavorite = (contentId: string) => {
    setSavedContent(prev => prev.map(content => 
      content.id === contentId 
        ? { ...content, isFavorite: !content.isFavorite }
        : content
    ));
    addToast({
      title: 'Favorite Updated',
      message: 'Content favorite status has been updated',
      type: 'success',
    });
  };

  const handleDuplicate = (content: SavedContent) => {
    const newContent: SavedContent = {
      ...content,
      id: `content-${Date.now()}`,
      title: `${content.title} (Copy)`,
      isFavorite: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSavedContent(prev => [...prev, newContent]);
    addToast({
      title: 'Content Duplicated',
      message: 'A copy has been created',
      type: 'success',
    });
  };

  const handleDelete = (content: SavedContent) => {
    setContentToDelete(content);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (contentToDelete) {
      setSavedContent(prev => prev.filter(content => content.id !== contentToDelete.id));
      addToast({
        title: 'Content Deleted',
        message: 'The content has been permanently removed',
        type: 'success',
      });
    }
    setShowDeleteModal(false);
    setContentToDelete(null);
  };

  const handleUseContent = (content: SavedContent) => {
    setSavedContent(prev => prev.map(c => 
      c.id === content.id 
        ? { ...c, usageCount: c.usageCount + 1, lastUsed: new Date() }
        : c
    ));
    addToast({
      title: 'Content Used',
      message: 'Content has been marked as used',
      type: 'success',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        title: 'Copied!',
        message: 'Content copied to clipboard',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Copy Failed',
        message: 'Please copy manually',
        type: 'error',
      });
    }
  };

  const downloadContent = (content: SavedContent) => {
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}-${content.prompt.platform}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Downloaded!',
      message: 'Content saved to your device',
      type: 'success',
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Bookmark;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.color || 'from-gray-500 to-gray-600';
  };

  const getPlatformColor = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    return platformData?.color || 'from-gray-500 to-gray-600';
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#87CEFA]" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Content Library"
        subtitle="Save, organize, and reuse your generated content with templates and categories"
        actions={
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] hover:from-[#87CEFA]/90 hover:to-[#40E0D0]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Content
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        }
      />

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <Button variant="outline" size="sm">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = category.id === 'all' 
              ? savedContent.length 
              : category.id === 'favorites'
                ? savedContent.filter(content => content.isFavorite).length
                : savedContent.filter(content => content.category === category.id).length;
            
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? `border-[#87CEFA] bg-gradient-to-r ${category.color} text-white`
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs opacity-75">{count} items</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
              />
            </div>
            
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{filteredContent.length} items found</span>
          <div className="flex items-center gap-4">
            <span>Sort by:</span>
            <select className="border-none bg-transparent focus:outline-none focus:ring-0">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="usage">Most Used</option>
              <option value="favorite">Favorites First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                viewMode === 'grid' ? 'p-6' : 'p-4'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(content.category)} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const Icon = getCategoryIcon(content.category);
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{content.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(content.prompt.platform)} text-white`}>
                        {content.prompt.platform}
                      </span>
                      {content.isTemplate && (
                        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                          Template
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFavorite(content.id)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      content.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={content.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">{content.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {content.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {content.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{content.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <span>{content.metadata.wordCount} words</span>
                  <span>{content.usageCount} uses</span>
                  {content.lastUsed && (
                    <span>{content.lastUsed.toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUseContent(content)}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] hover:from-[#87CEFA]/90 hover:to-[#40E0D0]/90"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Use
                </Button>
                <Button
                  onClick={() => copyToClipboard(content.content)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => downloadContent(content)}
                  variant="outline"
                  size="sm"
                >
                  <DownloadIcon className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => handleDuplicate(content)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => handleDelete(content)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterPlatform !== 'all' || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by saving some content from your AI generator'}
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] hover:from-[#87CEFA]/90 hover:to-[#40E0D0]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Your First Content
          </Button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Content?</h3>
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. The content will be permanently removed from your library.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
} 
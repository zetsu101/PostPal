"use client";
import { useState } from "react";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button, { IconButton, LoadingButton } from "@/components/ui/Button";
import Skeleton, { CardSkeleton, MetricSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageTransition, StaggeredContainer, StaggeredItem } from "@/components/ui/PageTransition";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { InteractiveCard, MetricCard } from "@/components/ui/InteractiveCard";
import { EnhancedLoading, ContentLoading } from "@/components/ui/EnhancedLoading";
import { SwipeableCard, TouchFeedback, MobileOptimizedList } from "@/components/ui/MobileEnhancements";
import { 
  Plus, 
  Settings, 
  Download, 
  Share2, 
  Heart, 
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Palette,
  Sparkles,
  Smartphone,
  Globe,
  Sun,
  Monitor,
  Moon
} from "lucide-react";

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const { addToast } = useToast();

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} notification example`,
      duration: 4000
    });
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleSkeletonDemo = () => {
    setShowSkeletons(true);
    setTimeout(() => setShowSkeletons(false), 3000);
  };

  return (
    <PageTransition>
      <Container className="py-8">
        <PageHeader
          title="UX Components Demo"
          subtitle="Showcasing the enhanced user experience components"
          actions={
            <div className="flex gap-3">
              <ThemeToggle />
              <Button variant="outline" icon={<Settings />}>
                Settings
              </Button>
              <Button variant="primary" icon={<Download />}>
                Export
              </Button>
            </div>
          }
        />

        <div className="space-y-12">
          {/* Theme Showcase Section */}
          <section className="card p-8">
            <div className="text-center mb-8">
              <Palette className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Beautiful Dark Mode
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience the magic of automatic theme switching. Your PostPal app now supports light, dark, and system themes with smooth transitions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <Sun className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Light Theme</h3>
                <p className="text-gray-600 dark:text-gray-300">Clean, bright interface perfect for daytime use</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-xl">
                <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">System Theme</h3>
                <p className="text-gray-600 dark:text-gray-300">Automatically matches your OS preference</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-gray-900 to-slate-900 dark:from-gray-100 dark:to-slate-100 rounded-xl">
                <Moon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white dark:text-gray-900 mb-2">Dark Theme</h3>
                <p className="text-gray-300 dark:text-gray-600">Easy on the eyes for nighttime productivity</p>
              </div>
            </div>
          </section>

          {/* Enhanced Buttons Section */}
          <section>
            <StaggeredContainer>
              <StaggeredItem>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Enhanced Buttons</h2>
              </StaggeredItem>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StaggeredItem>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Variants</h3>
                    <div className="space-y-3">
                      <Button variant="primary" fullWidth>Primary Button</Button>
                      <Button variant="secondary" fullWidth>Secondary Button</Button>
                      <Button variant="outline" fullWidth>Outline Button</Button>
                      <Button variant="ghost" fullWidth>Ghost Button</Button>
                      <Button variant="danger" fullWidth>Danger Button</Button>
                      <Button variant="success" fullWidth>Success Button</Button>
                    </div>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Sizes</h3>
                    <div className="space-y-3">
                      <Button size="sm">Small Button</Button>
                      <Button size="md">Medium Button</Button>
                      <Button size="lg">Large Button</Button>
                      <Button size="xl">Extra Large</Button>
                    </div>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">States</h3>
                    <div className="space-y-3">
                      <LoadingButton loading={isLoading} onClick={handleLoadingDemo}>
                        {isLoading ? 'Loading...' : 'Click to Load'}
                      </LoadingButton>
                      <Button disabled>Disabled Button</Button>
                      <IconButton>
                        <Heart />
                      </IconButton>
                    </div>
                  </div>
                </StaggeredItem>
              </div>
            </StaggeredContainer>
          </section>

          {/* Toast Notifications Section */}
          <section>
            <StaggeredContainer>
              <StaggeredItem>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Toast Notifications</h2>
              </StaggeredItem>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StaggeredItem>
                  <Button variant="success" onClick={() => handleShowToast('success')}>
                    Success Toast
                  </Button>
                </StaggeredItem>
                <StaggeredItem>
                  <Button variant="danger" onClick={() => handleShowToast('error')}>
                    Error Toast
                  </Button>
                </StaggeredItem>
                <StaggeredItem>
                  <Button variant="outline" onClick={() => handleShowToast('warning')}>
                    Warning Toast
                  </Button>
                </StaggeredItem>
                <StaggeredItem>
                  <Button variant="secondary" onClick={() => handleShowToast('info')}>
                    Info Toast
                  </Button>
                </StaggeredItem>
              </div>
            </StaggeredContainer>
          </section>

          {/* Skeleton Loading States Section */}
          <section>
            <StaggeredContainer>
              <div className="flex items-center justify-between mb-6">
                <StaggeredItem>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skeleton Loading States</h2>
                </StaggeredItem>
                <StaggeredItem>
                  <Button variant="outline" onClick={handleSkeletonDemo}>
                    {showSkeletons ? 'Hide' : 'Show'} Skeletons
                  </Button>
                </StaggeredItem>
              </div>

              {showSkeletons ? (
                <div className="space-y-8">
                  {/* Basic Skeletons */}
                  <StaggeredItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Basic Skeletons</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="rounded" width={120} height={32} />
                      </div>
                    </div>
                  </StaggeredItem>

                  {/* Metric Skeletons */}
                  <StaggeredItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Metric Cards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <MetricSkeleton key={index} />
                        ))}
                      </div>
                    </div>
                  </StaggeredItem>

                  {/* Chart Skeleton */}
                  <StaggeredItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Chart Loading</h3>
                      <ChartSkeleton />
                    </div>
                  </StaggeredItem>

                  {/* Card Skeletons */}
                  <StaggeredItem>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Content Cards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <CardSkeleton key={index} />
                        ))}
                      </div>
                    </div>
                  </StaggeredItem>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>Click &quot;Show Skeletons&quot; to see loading states in action</p>
                </div>
              )}
            </StaggeredContainer>
          </section>

          {/* Interactive Demo Section */}
          <section>
            <StaggeredContainer>
              <StaggeredItem>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Interactive Demo</h2>
              </StaggeredItem>
              <div className="card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StaggeredItem>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button variant="primary" icon={<Plus />} fullWidth>
                          Create New Post
                        </Button>
                        <Button variant="outline" icon={<Share2 />} fullWidth>
                          Share Content
                        </Button>
                        <Button variant="ghost" icon={<Users />} fullWidth>
                          Invite Team
                        </Button>
                      </div>
                    </div>
                  </StaggeredItem>

                  <StaggeredItem>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analytics Overview</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                          <TrendingUp className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">+24%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Engagement</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2K</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Reach</div>
                        </div>
                      </div>
                    </div>
                  </StaggeredItem>
                </div>
              </div>
            </StaggeredContainer>
          </section>

          {/* Features Showcase */}
          <section className="card p-8">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What&apos;s New in PostPal
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the next generation of social media management with our enhanced UX components
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Dark Mode</h3>
                <p className="text-gray-600 dark:text-gray-300">Beautiful themes with automatic system detection</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Mobile First</h3>
                <p className="text-gray-600 dark:text-gray-300">Touch-friendly interface with responsive design</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Global Ready</h3>
                <p className="text-gray-600 dark:text-gray-300">Internationalization and accessibility support</p>
              </div>
            </div>
          </section>

          {/* Enhanced Loading Components */}
          <section className="card p-8">
            <div className="text-center mb-8">
              <Zap className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Enhanced Loading States
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Beautiful, animated loading components for every use case
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <EnhancedLoading type="pulse" size="lg" text="Pulse Loading" />
              </div>
              <div className="text-center p-6">
                <EnhancedLoading type="wave" size="lg" text="Wave Loading" />
              </div>
              <div className="text-center p-6">
                <EnhancedLoading type="dots" size="lg" text="Dots Loading" />
              </div>
              <div className="text-center p-6">
                <EnhancedLoading type="spinner" size="lg" text="Spinner Loading" />
              </div>
              <div className="text-center p-6">
                <EnhancedLoading type="progress" size="lg" text="Progress Loading" showProgress progress={75} />
              </div>
              <div className="text-center p-6">
                <ContentLoading message="Content is loading..." />
              </div>
            </div>
          </section>

          {/* Interactive Cards */}
          <section className="card p-8">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Interactive Cards
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Hover effects, animations, and interactive feedback
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InteractiveCard hoverEffect="lift" className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lift Effect</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hover to see the lift animation</p>
                </div>
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="glow" className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Glow Effect</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hover to see the glow animation</p>
                </div>
              </InteractiveCard>
              
              <InteractiveCard hoverEffect="scale" className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-lg">📏</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scale Effect</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hover to see the scale animation</p>
                </div>
              </InteractiveCard>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard 
                title="Total Engagement" 
                value="24.5K" 
                change="+12.3%" 
                trend="up"
              />
              <MetricCard 
                title="Reach" 
                value="156.2K" 
                change="-2.1%" 
                trend="down"
              />
            </div>
          </section>

          {/* Mobile Enhancements */}
          <section className="card p-8">
            <div className="text-center mb-8">
              <Smartphone className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Mobile Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Touch gestures, pull-to-refresh, and mobile-optimized interactions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Touch Feedback</h3>
                <div className="space-y-3">
                  <TouchFeedback feedback="ripple">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      Tap for Ripple Effect
                    </div>
                  </TouchFeedback>
                  
                  <TouchFeedback feedback="scale">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      Tap for Scale Effect
                    </div>
                  </TouchFeedback>
                  
                  <TouchFeedback feedback="glow">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      Tap for Glow Effect
                    </div>
                  </TouchFeedback>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Swipeable Cards</h3>
                <SwipeableCard 
                  onSwipeLeft={() => addToast({ type: 'info', title: 'Swiped Left', message: 'You swiped left!' })}
                  onSwipeRight={() => addToast({ type: 'success', title: 'Swiped Right', message: 'You swiped right!' })}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">👆</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Swipe Me!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Try swiping left or right</p>
                  </div>
                </SwipeableCard>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mobile Optimized List</h3>
              <MobileOptimizedList
                items={[
                  { id: 1, content: <div className="flex items-center gap-3"><span>📱</span> <span>Mobile First Design</span></div> },
                  { id: 2, content: <div className="flex items-center gap-3"><span>👆</span> <span>Touch Gestures</span></div> },
                  { id: 3, content: <div className="flex items-center gap-3"><span>🔄</span> <span>Pull to Refresh</span></div> },
                  { id: 4, content: <div className="flex items-center gap-3"><span>✨</span> <span>Smooth Animations</span></div> }
                ]}
                onItemPress={(id) => addToast({ type: 'success', title: 'Item Pressed', message: `You pressed item ${id}` })}
              />
            </div>
          </section>
        </div>
      </Container>
    </PageTransition>
  );
}

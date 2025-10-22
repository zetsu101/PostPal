"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, Search, User } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";
import NotificationCenter from "./ui/NotificationCenter";
import KeyboardShortcutsHelp from "./ui/KeyboardShortcutsHelp";
import { useKeyboardShortcuts, createAppShortcuts } from "@/lib/keyboard-shortcuts";
import { safeLocalStorage, safeWindow } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: "🏠" },
  { name: "Create", href: "/create", icon: "✏️" },
  { name: "AI Generator", href: "/ai-generator", icon: "🤖" },
  { name: "AI Optimizer", href: "/ai-optimizer", icon: "⚡" },
  { name: "AI Insights", href: "/ai-insights", icon: "🧠" },
  { name: "Media", href: "/media", icon: "📁" },
  { name: "Calendar", href: "/calendar", icon: "📅" },
  { name: "Analytics", href: "/analytics", icon: "📊" },
  { name: "Performance", href: "/performance", icon: "🚀" },
  { name: "Monitoring", href: "/monitoring", icon: "📈" },
  { name: "Team", href: "/team", icon: "👥" },
  { name: "Billing", href: "/billing", icon: "💳" },
  { name: "Saved Posts", href: "/saved", icon: "💾" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  // Defensive: avoid rendering until client to prevent illegal invocation on certain bound methods
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up keyboard shortcuts
  useKeyboardShortcuts(createAppShortcuts(router), [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Avoid PWA features during demo to reduce client exceptions */}
      {/* <MobileFeatures /> */}
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 min-h-screen relative">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PostPal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 pb-32">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile & Logout */}
          {isClient && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="text-white font-semibold">{user?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all"
              >
                <span className="text-lg">🚪</span>
                Logout
              </button>
              <button
                onClick={() => {
                  safeLocalStorage.removeItem('postpal_token');
                  safeLocalStorage.removeItem('postpal_user');
                  if (safeWindow.location) {
                    safeWindow.location.href = '/login';
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all mt-2"
              >
                <span className="text-lg">🗑️</span>
                Clear Session
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <div className="flex items-center gap-4">
              <div className="block sm:hidden">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PostPal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Social Media Management</p>
              </div>
            </div>

            {/* Center - Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search posts, analytics, settings..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <NotificationCenter />
              
              {/* User Menu */}
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <User size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        {/* Main Content */}
        <div className="pb-20">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex justify-around">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp />
    </div>
  );
} 
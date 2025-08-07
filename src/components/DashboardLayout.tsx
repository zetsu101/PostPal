"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileFeatures from "./MobileFeatures";

const navigation = [
  { name: "Home", href: "/dashboard", icon: "🏠" },
  { name: "Create", href: "/create", icon: "✏️" },
  { name: "Calendar", href: "/calendar", icon: "📅" },
  { name: "Analytics", href: "/analytics", icon: "📊" },
  { name: "Team", href: "/team", icon: "👥" },
  { name: "Billing", href: "/billing", icon: "💳" },
  { name: "Saved Posts", href: "/saved", icon: "💾" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileFeatures />
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PostPal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900"
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
    </div>
  );
} 
import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import MigrationBanner from "@/components/MigrationBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostPal - AI-Powered Social Media Management",
  description: "Create, schedule, and optimize your social media content with AI-powered tools. Manage all your social accounts from one platform.",
  keywords: "social media management, AI content generation, social media scheduling, hashtag optimization, social media analytics",
  authors: [{ name: "PostPal Team" }],
  creator: "PostPal",
  publisher: "PostPal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://postpal.app"),
  openGraph: {
    title: "PostPal - AI-Powered Social Media Management",
    description: "Create, schedule, and optimize your social media content with AI-powered tools.",
    url: "https://postpal.app",
    siteName: "PostPal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PostPal - Social Media Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPal - AI-Powered Social Media Management",
    description: "Create, schedule, and optimize your social media content with AI-powered tools.",
    images: ["/twitter-image.png"],
    creator: "@postpal_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PostPal",
    startupImage: [
      {
        url: "/apple-touch-startup-image-768x1004.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "PostPal",
    "application-name": "PostPal",
    "msapplication-TileColor": "#87CEFA",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// theme color is set via metadata meta tags below; no separate export

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="PostPal" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PostPal" />
        <meta name="description" content="AI-Powered Social Media Management Platform" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#87CEFA" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#87CEFA" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#87CEFA" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Font CSS Variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-inter: ${inter.variable};
                --font-lato: ${lato.variable};
              }
            `,
          }}
        />
        
        {/* Force-unregister any previously installed service workers (old cache) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations()
                    .then(function(regs){ regs.forEach(function(r){ r.unregister(); }); })
                    .catch(function(){ /* ignore */ });
                  if (window.caches && caches.keys) {
                    caches.keys().then(function(keys){ keys.forEach(function(k){ caches.delete(k); }); });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <MigrationBanner />
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

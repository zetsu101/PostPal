# PostPal - AI-Powered Social Media Content Assistant

PostPal is a modern web application that helps creators, brands, and freelancers generate engaging social media content using AI. The platform provides post ideas, captions, hashtags, and a drag-and-drop calendar for content planning.

## 🚀 Features

### **Core Features**
- **AI Content Generation**: Get personalized post ideas, captions, and hashtags based on your brand profile
- **Multi-Platform Support**: Create content for Instagram, TikTok, LinkedIn, Facebook, and Twitter
- **Interactive Onboarding**: Guided setup process to understand your brand, audience, and goals
- **Content Calendar**: Plan and schedule your posts with a visual calendar interface
- **Post Editor**: Rich editing interface with preview functionality
- **Saved Posts**: Store and manage your favorite content ideas
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### **Advanced Analytics & Reporting** 🆕
- **Comprehensive Analytics Dashboard**: Real-time performance metrics and insights
- **AI-Powered Insights**: Automated analysis of content performance and trends
- **Competitor Analysis**: Benchmark against industry leaders and competitors
- **Audience Demographics**: Detailed audience insights and behavior analysis
- **Content Performance Tracking**: Track engagement, reach, and growth metrics
- **Custom Reports**: Generate PDF, CSV, and JSON reports with white-label branding
- **ROI & Business Metrics**: Track conversion rates, lead generation, and return on investment
- **Predictive Analytics**: AI-driven recommendations for content optimization
- **Cross-Platform Comparison**: Compare performance across different social media platforms
- **Trend Analysis**: Identify industry trends and optimal posting strategies

### **Subscription & Monetization System** 🆕
- **Multi-Tier Pricing**: Free, Pro ($19/month), Business ($49/month), Enterprise ($199/month)
- **Feature Gating**: Restrict access to premium features based on subscription
- **Usage Tracking**: Monitor and limit usage based on plan tiers
- **Billing Management**: Complete subscription and billing interface
- **Payment Processing**: Ready for Stripe integration
- **Upgrade Flows**: Seamless plan upgrades and downgrades
- **Usage Analytics**: Track feature usage and plan utilization
- **Invoice Generation**: Professional billing and invoice management
- **Trial Management**: Free trial periods for new users
- **Cancellation Handling**: Graceful subscription cancellation

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: Custom components with modern design
- **State Management**: React hooks and local state
- **Build Tool**: Next.js built-in bundler

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd postpal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analytics/         # Advanced analytics dashboard
│   ├── billing/           # Subscription & billing management
│   ├── calendar/          # Content calendar page
│   ├── create/            # Post creation interface
│   ├── dashboard/         # Main dashboard
│   ├── onboarding/        # User onboarding flow
│   ├── pricing/           # Pricing page & plan selection
│   ├── saved/             # Saved posts management
│   ├── settings/          # User settings & API integrations
│   ├── team/              # Team collaboration features
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── AdvancedAnalytics.tsx
│   ├── AIContentGenerator.tsx
│   ├── APIIntegration.tsx
│   ├── BillingManagement.tsx
│   ├── CompetitorAnalysis.tsx
│   ├── DashboardLayout.tsx
│   ├── EditPostModal.tsx
│   ├── FeatureGate.tsx
│   ├── MobileFeatures.tsx
│   ├── OnboardingWizard.tsx
│   ├── PricingPage.tsx
│   └── TeamCollaboration.tsx
├── lib/                   # Core business logic
│   ├── analytics.ts       # Advanced analytics engine
│   ├── socialMediaAPI.ts  # Social media API integrations
│   └── subscription.ts    # Subscription & billing management
```

## 🎯 Key Components

### AdvancedAnalytics
Comprehensive analytics dashboard with real-time metrics, AI-powered insights, competitor analysis, and custom reporting capabilities.

### AIContentGenerator
Generates AI-powered post ideas with captions, hashtags, and image prompts. Currently uses mock data but is designed to integrate with OpenAI API.

### APIIntegration
Manages real social media platform connections with OAuth authentication, rate limiting, and posting capabilities.

### BillingManagement
Complete subscription and billing management interface with usage tracking, payment methods, and invoice history.

### CompetitorAnalysis
Provides competitor benchmarking, industry insights, and strategic recommendations based on competitor performance.

### FeatureGate
Feature gating component that restricts access to premium features based on subscription plans and usage limits.

### OnboardingWizard
Multi-step onboarding process that collects brand information, target audience, platforms, tone, and posting frequency goals.

### EditPostModal
Rich post editor with live preview, platform selection, and scheduling options.

### DashboardLayout
Responsive layout component with sidebar navigation for desktop and bottom navigation for mobile.

### PricingPage
Modern, conversion-optimized pricing page with plan comparison, upgrade flows, and billing cycle toggles.

### TeamCollaboration
Multi-user team management with roles, workspaces, approval workflows, and collaboration features.

### MobileFeatures
PWA features including offline support, push notifications, and mobile-optimized user experience.

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

The project uses several configuration files:

- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration

## 🎨 Design System

PostPal uses a consistent design system with:

- **Colors**: Primary (#87CEFA - Light Sky Blue), Accent (#40E0D0 - Turquoise), Warm (#FF7F50 - Coral)
- **Typography**: Inter for headings, Lato for body text
- **Spacing**: Consistent spacing scale using Tailwind utilities
- **Components**: Reusable UI components with consistent styling

## 🔮 Future Enhancements

- [ ] OpenAI API integration for real AI content generation
- [ ] Firebase authentication and user management
- [ ] Real-time collaboration features
- [ ] Advanced automation and workflow features
- [ ] Native mobile app development
- [ ] Advanced AI features (content optimization, predictive analytics)
- [ ] White-label solutions for agencies
- [ ] Advanced reporting and custom dashboards
- [ ] Integration with more social media platforms
- [ ] Advanced team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and modern web technologies.

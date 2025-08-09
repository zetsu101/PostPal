"use client";
import Link from "next/link";
import Container from "@/components/Container";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1F2937] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <Container className="flex items-center justify-between py-4">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold tracking-tight text-[#87CEFA]"
        >
          PostPal
        </motion.span>
        <nav className="space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/pricing" className="font-medium hover:text-[#87CEFA] transition-colors">Get Started Free</Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/dashboard" className="font-medium hover:text-[#87CEFA] transition-colors">Login</Link>
          </motion.div>
        </nav>
        </Container>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center py-20 overflow-hidden">
        <Container>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#FF6B6B]/10 to-[#60A5FA]/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[#34D399]/10 to-[#FACC15]/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#60A5FA]/20 rounded-full"
          />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✨ AI-Powered Social Media Assistant
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-[#1F2937] leading-tight"
          >
            Never worry about{" "}
            <span className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] bg-clip-text text-transparent">
              what to post
            </span>{" "}
            again.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto text-[#374151] leading-relaxed"
          >
            AI-powered content ideas, captions, hashtags, and a drag-and-drop calendar for creators, brands, and freelancers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              href="/pricing" 
              className="group bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Link>
            <Link 
              href="/dashboard" 
              className="group border-2 border-[#1F2937] text-[#1F2937] font-semibold px-8 py-4 rounded-full hover:bg-[#1F2937] hover:text-white transition-all duration-300 text-lg"
            >
              Watch Demo
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-[#6B7280]"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-full border-2 border-white" />
                ))}
              </div>
              <span>Join 10,000+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#34D399]">★★★★★</span>
              <span>4.9/5 from 2,000+ reviews</span>
            </div>
          </motion.div>
        </div>

        {/* Floating UI Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 hidden lg:block"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#87CEFA] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📱</span>
            </div>
              <div className="text-sm">
                <div className="font-semibold">Instagram Post</div>
                <div className="text-gray-500">2 min ago</div>
              </div>
            </div>
                         <div className="text-sm text-gray-600">&ldquo;Just posted our latest design! ✨&rdquo;</div>
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 hidden lg:block"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#40E0D0] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📅</span>
            </div>
              <div className="text-sm">
                <div className="font-semibold">Calendar</div>
                <div className="text-gray-500">3 posts scheduled</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">Next post in 2 hours</div>
          </div>
        </motion.div>
        </Container>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20">
        <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it Works</h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Get started in minutes with our simple 3-step process
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1️⃣",
              title: "Tell us about your brand",
              description: "Complete a playful onboarding to set your tone, audience, and goals.",
              color: "from-[#FF6B6B] to-[#FF8E8E]"
            },
            {
              step: "2️⃣", 
              title: "Get AI-powered ideas",
              description: "Receive tailored post ideas, captions, hashtags, and image prompts.",
              color: "from-[#60A5FA] to-[#93C5FD]"
            },
            {
              step: "3️⃣",
              title: "Plan & post with ease", 
              description: "Drag-and-drop to your calendar, edit, and stay consistent with ease.",
              color: "from-[#34D399] to-[#6EE7B7]"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex-1 bg-[#F9FAFB] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`text-4xl mb-4 bg-gradient-to-r ${item.color === "from-[#FF6B6B] to-[#FF8E8E]" ? "from-[#87CEFA] to-[#ADD8E6]" : item.color === "from-[#60A5FA] to-[#93C5FD]" ? "from-[#40E0D0] to-[#7FFFD4]" : "from-[#10B981] to-[#34D399]"} bg-clip-text text-transparent`}>
                {item.step}
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1F2937] group-hover:text-[#87CEFA] transition-colors">
                {item.title}
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
        </Container>
      </section>

      {/* Screenshots/Mockups Placeholder */}
      <section className="py-20 bg-[#F9FAFB] text-center">
        <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">See PostPal in Action</h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Beautiful, intuitive interface designed for creators
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row justify-center gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="bg-gradient-to-br from-[#87CEFA] to-[#40E0D0] rounded-xl p-8 text-white text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2">AI Content Generator</h3>
                <p className="text-white/80">Get personalized post ideas in seconds</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="bg-gradient-to-br from-[#40E0D0] to-[#FF7F50] rounded-xl p-8 text-white text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-2">Content Calendar</h3>
                <p className="text-white/80">Plan and schedule with drag-and-drop</p>
              </div>
            </div>
          </motion.div>
        </div>
        </Container>
      </section>

      {/* Simple, Clean Pricing Section */}
      <section className="py-24 bg-white">
        <Container className="max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[#1E293B]">
              Simple Pricing
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade when you&apos;re ready.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: ["5 AI posts per month", "Basic calendar", "1 account", "Community support"],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Pro",
                price: "$19",
                description: "Most popular choice",
                features: ["Unlimited AI posts", "Advanced calendar", "5 accounts", "Priority support", "Analytics", "Hashtag suggestions"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Team",
                price: "$49",
                description: "For growing teams",
                features: ["Everything in Pro", "10 team members", "Collaboration tools", "White-label", "API access", "Dedicated support"],
                cta: "Start Free Trial",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-[#87CEFA] shadow-lg' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#87CEFA] text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-[#1E293B]">{plan.name}</h3>
                  <p className="text-[#64748B] mb-6">{plan.description}</p>
                  <div className="text-4xl font-bold text-[#1E293B] mb-1">{plan.price}</div>
                  <div className="text-sm text-[#64748B]">
                    {plan.price === "$0" ? "forever" : "per month"}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold mb-8 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#87CEFA] text-white hover:bg-[#5F9EC7]'
                      : 'bg-gray-100 text-[#1E293B] hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#40E0D0] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm text-[#475569]">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981]">✓</span>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981]">✓</span>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#10B981]">✓</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Testimonials Carousel Placeholder */}
      <section className="py-20 bg-[#F9FAFB] text-center">
        <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Join thousands of creators who trust PostPal
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-5xl mx-auto">
          {[
            {
              quote: "PostPal made posting so much easier! I went from struggling to post once a week to posting daily with engaging content.",
              author: "Alex Chen",
              role: "Content Creator",
              avatar: "👨‍💻"
            },
            {
              quote: "I love the AI ideas and calendar. It's like having a social media manager without the cost!",
              author: "Jamie Rodriguez",
              role: "Small Business Owner",
              avatar: "👩‍💼"
            },
            {
              quote: "Finally, I'm consistent on social! The drag-and-drop calendar is a game-changer for my workflow.",
              author: "Taylor Kim",
              role: "Freelance Designer",
              avatar: "👨‍🎨"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
                             <div className="text-2xl mb-4">&ldquo;{testimonial.quote}&rdquo;</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div className="text-left">
                  <div className="font-semibold text-[#1F2937]">{testimonial.author}</div>
                  <div className="text-sm text-[#6B7280]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t text-center text-[#6B7280]">
        <Container className="max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-6">
            <Link href="/terms" className="hover:text-[#87CEFA] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#87CEFA] transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-[#87CEFA] transition-colors">Contact</Link>
            <Link href="/help" className="hover:text-[#87CEFA] transition-colors">Help Center</Link>
          </div>
          <div className="text-sm">© {new Date().getFullYear()} PostPal. All rights reserved.</div>
        </Container>
      </footer>
    </div>
  );
}


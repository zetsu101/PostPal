"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1F2937] font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
        <span className="text-2xl font-bold tracking-tight text-[#FF6B6B]">PostPal</span>
        <nav className="space-x-4">
          <Link href="/onboarding" className="font-medium hover:underline">Get Started Free</Link>
          <Link href="/dashboard" className="font-medium hover:underline">Login</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-[#1F2937]">Never worry about what to post again.</h1>
        <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto text-[#374151]">AI-powered content ideas, captions, hashtags, and a drag-and-drop calendar for creators, brands, and freelancers.</p>
        <Link href="/onboarding" className="bg-[#FF6B6B] hover:bg-[#60A5FA] text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors text-lg">Get Started Free</Link>
      </section>

      {/* How it Works */}
      <section className="bg-white py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">How it Works</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex-1 bg-[#F9FAFB] rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-2">1️⃣</div>
            <h3 className="font-semibold mb-2">Tell us about your brand</h3>
            <p className="text-[#6B7280]">Complete a playful onboarding to set your tone, audience, and goals.</p>
          </div>
          <div className="flex-1 bg-[#F9FAFB] rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-2">2️⃣</div>
            <h3 className="font-semibold mb-2">Get AI-powered ideas</h3>
            <p className="text-[#6B7280]">Receive tailored post ideas, captions, hashtags, and image prompts.</p>
          </div>
          <div className="flex-1 bg-[#F9FAFB] rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-2">3️⃣</div>
            <h3 className="font-semibold mb-2">Plan & post with ease</h3>
            <p className="text-[#6B7280]">Drag-and-drop to your calendar, edit, and stay consistent with ease.</p>
          </div>
        </div>
      </section>

      {/* Screenshots/Mockups Placeholder */}
      <section className="py-12 px-4 bg-[#F9FAFB] text-center">
        <h2 className="text-2xl font-bold mb-4">See PostPal in Action</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-72 h-44 bg-[#E5E7EB] rounded-xl flex items-center justify-center text-[#9CA3AF] text-lg font-semibold">[Post Ideas Mockup]</div>
          <div className="w-72 h-44 bg-[#E5E7EB] rounded-xl flex items-center justify-center text-[#9CA3AF] text-lg font-semibold">[Calendar Mockup]</div>
        </div>
      </section>

      {/* Pricing Tiers Placeholder */}
      <section className="py-12 px-4 bg-white text-center">
        <h2 className="text-2xl font-bold mb-8">Pricing</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex-1 border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Free</h3>
            <p className="mb-4 text-[#6B7280]">Try PostPal with basic features</p>
            <span className="text-2xl font-bold">$0</span>
          </div>
          <div className="flex-1 border-2 border-[#FF6B6B] rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-2 text-[#FF6B6B]">Pro</h3>
            <p className="mb-4 text-[#6B7280]">Unlock AI, calendar, and more</p>
            <span className="text-2xl font-bold">$12/mo</span>
          </div>
          <div className="flex-1 border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Team</h3>
            <p className="mb-4 text-[#6B7280]">Collaborate with your team</p>
            <span className="text-2xl font-bold">$29/mo</span>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Placeholder */}
      <section className="py-12 px-4 bg-[#F9FAFB] text-center">
        <h2 className="text-2xl font-bold mb-8">What Our Users Say</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex-1 bg-white rounded-xl p-6 shadow-md">“PostPal made posting so much easier!”<br/><span className="block mt-2 text-[#6B7280]">— Alex, Creator</span></div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-md">“I love the AI ideas and calendar.”<br/><span className="block mt-2 text-[#6B7280]">— Jamie, Small Biz Owner</span></div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-md">“Finally, I’m consistent on social!”<br/><span className="block mt-2 text-[#6B7280]">— Taylor, Freelancer</span></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 px-4 mt-8 border-t text-center text-[#6B7280]">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-2">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <div>© {new Date().getFullYear()} PostPal. All rights reserved.</div>
      </footer>
    </div>
  );
}

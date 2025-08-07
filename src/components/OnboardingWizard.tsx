"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: "brand", label: "Brand Name", icon: "🏷️", color: "from-[#FF6B6B] to-[#FF8E8E]" },
  { id: "industry", label: "Industry", icon: "🏢", color: "from-[#60A5FA] to-[#93C5FD]" },
  { id: "audience", label: "Audience", icon: "👥", color: "from-[#34D399] to-[#6EE7B7]" },
  { id: "platforms", label: "Platforms", icon: "📱", color: "from-[#FACC15] to-[#FDE047]" },
  { id: "tone", label: "Brand Tone", icon: "🎭", color: "from-[#A78BFA] to-[#C4B5FD]" },
  { id: "frequency", label: "Frequency", icon: "📅", color: "from-[#FB7185] to-[#FDA4AF]" },
];

const industryOptions = [
  { value: "Fashion", icon: "👗", description: "Clothing, accessories, style" },
  { value: "Fitness", icon: "💪", description: "Health, wellness, workouts" },
  { value: "Food & Beverage", icon: "🍕", description: "Restaurants, recipes, dining" },
  { value: "Tech", icon: "💻", description: "Software, gadgets, innovation" },
  { value: "Coaching", icon: "🎯", description: "Personal development, mentoring" },
  { value: "Beauty", icon: "💄", description: "Skincare, makeup, self-care" },
  { value: "Travel", icon: "✈️", description: "Destinations, adventures, tips" },
  { value: "Education", icon: "📚", description: "Learning, courses, knowledge" },
  { value: "Health & Wellness", icon: "🧘", description: "Mental health, lifestyle" },
  { value: "Finance", icon: "💰", description: "Money, investments, budgeting" },
  { value: "Real Estate", icon: "🏠", description: "Properties, housing, investment" },
  { value: "Art & Design", icon: "🎨", description: "Creative work, visual arts" },
  { value: "Other", icon: "✨", description: "Something else" },
];

const platformOptions = [
  { value: "Instagram", icon: "📸", color: "from-pink-400 to-purple-500" },
  { value: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
  { value: "LinkedIn", icon: "💼", color: "from-blue-500 to-blue-600" },
  { value: "Facebook", icon: "📘", color: "from-blue-600 to-blue-700" },
  { value: "Twitter/X", icon: "🐦", color: "from-black to-gray-900" },
  { value: "Pinterest", icon: "📌", color: "from-red-500 to-red-600" },
  { value: "YouTube", icon: "📺", color: "from-red-600 to-red-700" },
  { value: "Other", icon: "✨", color: "from-gray-400 to-gray-500" },
];

const toneOptions = [
  { value: "Playful", icon: "😄", description: "Fun, lighthearted, entertaining" },
  { value: "Bold", icon: "🔥", description: "Confident, powerful, impactful" },
  { value: "Professional", icon: "👔", description: "Serious, trustworthy, corporate" },
  { value: "Friendly", icon: "🤝", description: "Warm, approachable, helpful" },
  { value: "Other", icon: "✨", description: "Something unique" },
];

const frequencyOptions = [
  { value: "1x per week", icon: "📅", description: "Once a week" },
  { value: "2x per week", icon: "📅", description: "Twice a week" },
  { value: "3x per week", icon: "📅", description: "Three times a week" },
  { value: "5x per week", icon: "📅", description: "Five times a week" },
  { value: "Daily", icon: "📅", description: "Every day" },
  { value: "Other", icon: "✨", description: "Custom frequency" },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    brandName: "",
    industry: "",
    audience: "",
    platforms: [] as string[],
    tone: "",
    frequency: "",
    customIndustry: "",
    customPlatform: "",
    customTone: "",
    customFrequency: "",
  });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-advance progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1 && !error) {
        // Auto-advance after 30 seconds of inactivity
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [step, error]);

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, brandName: e.target.value });
    if (e.target.value.trim()) setError("");
  };

  const handleIndustryChange = (value: string) => {
    setForm({ ...form, industry: value });
    setError("");
  };

  const handleCustomIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customIndustry: e.target.value, industry: e.target.value });
    setError("");
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, audience: e.target.value });
    setError("");
  };

  const handlePlatformChange = (platform: string) => {
    let updated = form.platforms.slice();
    if (updated.includes(platform)) {
      updated = updated.filter((p) => p !== platform);
    } else {
      updated.push(platform);
    }
    setForm({ ...form, platforms: updated });
    setError("");
  };

  const handleCustomPlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customPlatform: e.target.value });
    setError("");
  };

  const handleToneChange = (value: string) => {
    setForm({ ...form, tone: value });
    setError("");
  };

  const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customTone: e.target.value, tone: e.target.value });
    setError("");
  };

  const handleFrequencyChange = (value: string) => {
    setForm({ ...form, frequency: value });
    setError("");
  };

  const handleCustomFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customFrequency: e.target.value, frequency: e.target.value });
    setError("");
  };

  const validateStep = () => {
    if (step === 0 && !form.brandName.trim()) {
      setError("Please enter your brand name!");
      return false;
    }
    if (step === 1 && (!form.industry.trim() || (form.industry === "Other" && !form.customIndustry?.trim()))) {
      setError("Please select or enter your industry!");
      return false;
    }
    if (step === 2 && !form.audience.trim()) {
      setError("Please describe your target audience!");
      return false;
    }
    if (step === 3 && (form.platforms.length === 0 || (form.platforms.includes("Other") && !form.customPlatform?.trim()))) {
      setError("Please select at least one platform!");
      return false;
    }
    if (step === 4 && (!form.tone.trim() || (form.tone === "Other" && !form.customTone?.trim()))) {
      setError("Please select or enter your brand tone!");
      return false;
    }
    if (step === 5 && (!form.frequency.trim() || (form.frequency === "Other" && !form.customFrequency?.trim()))) {
      setError("Please select or enter your posting frequency goal!");
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      setTouched(true);
      return;
    }
    
    setTouched(false);
    setError("");
    
    if (step === steps.length - 1) {
      // Complete onboarding
      setShowSuccess(true);
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    setError("");
    setTouched(false);
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= step) {
      setStep(stepIndex);
      setError("");
      setTouched(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-[#1F2937] mb-4"
        >
          Welcome to PostPal!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-[#6B7280] mb-8"
        >
          Your brand profile is set up and ready to go. We&apos;re generating your first AI-powered content ideas...
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-[#34D399]"
        >
          <div className="w-4 h-4 border-2 border-[#34D399] border-t-transparent rounded-full animate-spin"></div>
          <span>Redirecting to your dashboard...</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <span className="text-3xl font-bold text-[#1F2937]">PostPal</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#6B7280] text-lg"
          >
            Let&apos;s set up your brand profile in just a few steps
          </motion.p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1F2937]">Progress</h3>
            <span className="text-sm text-[#6B7280]">{step + 1} of {steps.length}</span>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            {steps.map((stepItem, i) => (
              <div key={stepItem.id} className="flex-1 flex flex-col items-center">
                <motion.button
                  onClick={() => goToStep(i)}
                  disabled={i > step}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-gradient-to-r from-[#34D399] to-[#6EE7B7] text-white shadow-lg'
                      : i === step
                      ? 'bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={i <= step ? { scale: 1.1 } : {}}
                >
                  {i < step ? '✓' : stepItem.icon}
                </motion.button>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`text-xs mt-2 text-center ${
                    i === step ? 'text-[#FF6B6B] font-semibold' : 'text-[#9CA3AF]'
                  }`}
                >
                  {stepItem.label}
                </motion.span>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px] flex flex-col"
            >
              {/* Step Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`w-16 h-16 bg-gradient-to-r ${steps[step].color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-2xl">{steps[step].icon}</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-[#1F2937] mb-2"
                >
                  {steps[step].label}
                </motion.h2>
              </div>

              {/* Step Content */}
              <div className="flex-1">
                {step === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-[#6B7280] mb-8 text-lg">
                      Let&apos;s start with your brand or project name. This helps us personalize your content!
                    </p>
                    <div className="max-w-md mx-auto">
                      <input
                        type="text"
                        className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#FF6B6B] focus:outline-none text-lg transition-all duration-300"
                        placeholder="e.g. Luna Studio, TechFlow, Creative Co."
                        value={form.brandName}
                        onChange={handleBrandNameChange}
                        onBlur={() => setTouched(true)}
                        autoFocus
                      />
                      {form.brandName && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                                                     className="mt-4 p-4 bg-gradient-to-r from-[#87CEFA]/10 to-[#40E0D0]/10 rounded-xl"
                        >
                          <p className="text-sm text-[#6B7280]">
                                                         Great! We&apos;ll customize everything for <span className="font-semibold text-[#87CEFA]">{form.brandName}</span>
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[#6B7280] mb-8 text-center text-lg">
                      Choose the category that best fits your brand. This helps us tailor your post ideas!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {industryOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => handleIndustryChange(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            form.industry === option.value
                              ? 'border-[#60A5FA] bg-gradient-to-r from-[#60A5FA]/10 to-[#93C5FD]/10'
                              : 'border-gray-200 hover:border-[#60A5FA]/50 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-semibold text-[#1F2937]">{option.value}</div>
                              <div className="text-sm text-[#6B7280]">{option.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {form.industry === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 max-w-md mx-auto"
                      >
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#60A5FA] focus:outline-none"
                          placeholder="Enter your industry"
                          value={form.customIndustry || ""}
                          onChange={handleCustomIndustryChange}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-[#6B7280] mb-8 text-lg">
                      Describe your ideal followers or customers in a few words.
                    </p>
                    <div className="max-w-md mx-auto">
                      <input
                        type="text"
                        className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#34D399] focus:outline-none text-lg transition-all duration-300"
                        placeholder="e.g. Young entrepreneurs, Busy moms, Dog lovers in NYC"
                        value={form.audience}
                        onChange={handleAudienceChange}
                        onBlur={() => setTouched(true)}
                        autoFocus
                      />
                      {form.audience && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                                                     className="mt-4 p-4 bg-gradient-to-r from-[#40E0D0]/10 to-[#7FFFD4]/10 rounded-xl"
                        >
                          <p className="text-sm text-[#6B7280]">
                                                         Perfect! We&apos;ll create content that resonates with <span className="font-semibold text-[#40E0D0]">{form.audience}</span>
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[#6B7280] mb-8 text-center text-lg">
                      Select all the social platforms you post on. You can add more later!
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      {platformOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => handlePlatformChange(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            form.platforms.includes(option.value)
                              ? 'border-[#FACC15] bg-gradient-to-r from-[#FACC15]/10 to-[#FDE047]/10'
                              : 'border-gray-200 hover:border-[#FACC15]/50 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                              <span className="text-xl">{option.icon}</span>
                            </div>
                            <div className="font-semibold text-[#1F2937] text-sm">{option.value}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {form.platforms.includes("Other") && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 max-w-md mx-auto"
                      >
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FACC15] focus:outline-none"
                          placeholder="Enter other platform(s)"
                          value={form.customPlatform || ""}
                          onChange={handleCustomPlatformChange}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[#6B7280] mb-8 text-center text-lg">
                      Pick the vibe that best matches your brand&apos;s personality.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {toneOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => handleToneChange(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            form.tone === option.value
                              ? 'border-[#A78BFA] bg-gradient-to-r from-[#A78BFA]/10 to-[#C4B5FD]/10'
                              : 'border-gray-200 hover:border-[#A78BFA]/50 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-semibold text-[#1F2937]">{option.value}</div>
                              <div className="text-sm text-[#6B7280]">{option.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {form.tone === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 max-w-md mx-auto"
                      >
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#A78BFA] focus:outline-none"
                          placeholder="Enter your brand tone"
                          value={form.customTone || ""}
                          onChange={handleCustomToneChange}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[#6B7280] mb-8 text-center text-lg">
                      How often do you want to post? You can change this anytime!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {frequencyOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => handleFrequencyChange(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            form.frequency === option.value
                              ? 'border-[#FB7185] bg-gradient-to-r from-[#FB7185]/10 to-[#FDA4AF]/10'
                              : 'border-gray-200 hover:border-[#FB7185]/50 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-semibold text-[#1F2937]">{option.value}</div>
                              <div className="text-sm text-[#6B7280]">{option.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {form.frequency === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 max-w-md mx-auto"
                      >
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FB7185] focus:outline-none"
                          placeholder="Enter your goal (e.g. 2x per month)"
                          value={form.customFrequency || ""}
                          onChange={handleCustomFrequencyChange}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Error Message */}
              {error && touched && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <motion.button
              onClick={prev}
              disabled={step === 0}
              className="px-6 py-3 rounded-xl bg-gray-100 text-[#1F2937] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-300"
              whileHover={step > 0 ? { scale: 1.05 } : {}}
              whileTap={step > 0 ? { scale: 0.95 } : {}}
            >
              ← Back
            </motion.button>
            
            <motion.button
              onClick={next}
              disabled={
                step === steps.length - 1 ||
                (step === 0 && !form.brandName.trim()) ||
                (step === 1 && (!form.industry.trim() || (form.industry === "Other" && !form.customIndustry?.trim()))) ||
                (step === 2 && !form.audience.trim()) ||
                (step === 3 && (form.platforms.length === 0 || (form.platforms.includes("Other") && !form.customPlatform?.trim()))) ||
                (step === 4 && (!form.tone.trim() || (form.tone === "Other" && !form.customTone?.trim()))) ||
                (step === 5 && (!form.frequency.trim() || (form.frequency === "Other" && !form.customFrequency?.trim())))
              }
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {step === steps.length - 1 ? "Complete Setup" : "Next Step"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
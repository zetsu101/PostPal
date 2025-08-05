"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  "Brand Name",
  "Industry/Niche",
  "Target Audience",
  "Platforms Used",
  "Brand Tone",
  "Posting Frequency Goal",
];

const industryOptions = [
  "Fashion",
  "Fitness",
  "Food & Beverage",
  "Tech",
  "Coaching",
  "Beauty",
  "Travel",
  "Education",
  "Health & Wellness",
  "Finance",
  "Real Estate",
  "Art & Design",
  "Other",
];

const platformOptions = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Facebook",
  "Twitter/X",
  "Pinterest",
  "YouTube",
  "Other",
];

const toneOptions = [
  "Playful",
  "Bold",
  "Professional",
  "Friendly",
  "Other",
];

const frequencyOptions = [
  "1x per week",
  "2x per week",
  "3x per week",
  "5x per week",
  "Daily",
  "Other",
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

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, brandName: e.target.value });
    if (e.target.value.trim()) setError("");
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, industry: e.target.value });
    setError("");
  };
  const handleCustomIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, industry: e.target.value });
    setError("");
  };
  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, audience: e.target.value });
    setError("");
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updated = form.platforms.slice();
    if (checked) {
      updated.push(value);
    } else {
      updated = updated.filter((p) => p !== value);
    }
    setForm({ ...form, platforms: updated });
    setError("");
  };
  const handleCustomPlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customPlatform: e.target.value });
    setError("");
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, tone: e.target.value });
    setError("");
  };
  const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customTone: e.target.value });
    setError("");
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, frequency: e.target.value });
    setError("");
  };
  const handleCustomFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, customFrequency: e.target.value });
    setError("");
  };

  const next = () => {
    if (step === 0 && !form.brandName.trim()) {
      setTouched(true);
      setError("Please enter your brand name!");
      return;
    }
    if (step === 1) {
      if (!form.industry.trim() || (form.industry === "Other" && !form.customIndustry?.trim())) {
        setTouched(true);
        setError("Please select or enter your industry!");
        return;
      }
    }
    if (step === 2 && !form.audience.trim()) {
      setTouched(true);
      setError("Please describe your target audience!");
      return;
    }
    if (step === 3) {
      if (form.platforms.length === 0 || (form.platforms.includes("Other") && !form.customPlatform?.trim())) {
        setTouched(true);
        setError("Please select at least one platform!");
        return;
      }
    }
    if (step === 4) {
      if (!form.tone.trim() || (form.tone === "Other" && !form.customTone?.trim())) {
        setTouched(true);
        setError("Please select or enter your brand tone!");
        return;
      }
    }
    if (step === 5) {
      if (!form.frequency.trim() || (form.frequency === "Other" && !form.customFrequency?.trim())) {
        setTouched(true);
        setError("Please select or enter your posting frequency goal!");
        return;
      }
    }
    setTouched(false);
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${i <= step ? 'bg-[#FF6B6B]' : 'bg-[#E5E7EB]'}`}>{i + 1}</div>
            <span className={`text-xs mt-2 ${i === step ? 'text-[#FF6B6B] font-semibold' : 'text-[#9CA3AF]'}`}>{label}</span>
          </div>
        ))}
      </div>
      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#FF6B6B]">What&apos;s your brand name?</h2>
              <p className="text-[#6B7280] mb-6">Let’s start with your brand or project name. This helps us personalize your content!</p>
              <input
                type="text"
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#FF6B6B] focus:outline-none text-lg mb-2"
                placeholder="e.g. Luna Studio"
                value={form.brandName}
                onChange={handleBrandNameChange}
                onBlur={() => setTouched(true)}
                autoFocus
              />
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : step === 1 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#60A5FA]">What industry or niche are you in?</h2>
              <p className="text-[#6B7280] mb-6">Choose the category that best fits your brand. This helps us tailor your post ideas!</p>
              <select
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#60A5FA] focus:outline-none text-lg mb-2"
                value={industryOptions.includes(form.industry) ? form.industry : (form.industry ? "Other" : "")}
                onChange={handleIndustryChange}
                onBlur={() => setTouched(true)}
              >
                <option value="" disabled>Select your industry</option>
                {industryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {form.industry === "Other" && (
                <input
                  type="text"
                  className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#60A5FA] focus:outline-none text-lg mt-2"
                  placeholder="Enter your industry"
                  value={form.customIndustry || ""}
                  onChange={handleCustomIndustryChange}
                  onBlur={() => setTouched(true)}
                  autoFocus
                />
              )}
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : step === 2 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#34D399]">Who is your target audience?</h2>
              <p className="text-[#6B7280] mb-6">Describe your ideal followers or customers in a few words. (e.g., &quot;Busy moms&quot;, &quot;Dog lovers in NYC&quot;)</p>
              <input
                type="text"
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#34D399] focus:outline-none text-lg mb-2"
                placeholder="e.g. Young entrepreneurs"
                value={form.audience}
                onChange={handleAudienceChange}
                onBlur={() => setTouched(true)}
                autoFocus
              />
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : step === 3 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#FACC15]">Which platforms do you use?</h2>
              <p className="text-[#6B7280] mb-6">Select all the social platforms you post on. (You can add more later!)</p>
              <div className="flex flex-wrap justify-center gap-4 mb-2">
                {platformOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={form.platforms.includes(option)}
                      onChange={handlePlatformChange}
                      className="accent-[#FACC15] w-5 h-5"
                    />
                    <span className="text-base">{option}</span>
                  </label>
                ))}
              </div>
              {form.platforms.includes("Other") && (
                <input
                  type="text"
                  className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#FACC15] focus:outline-none text-lg mt-2"
                  placeholder="Enter other platform(s)"
                  value={form.customPlatform || ""}
                  onChange={handleCustomPlatformChange}
                  onBlur={() => setTouched(true)}
                  autoFocus
                />
              )}
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : step === 4 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#60A5FA]">What is your brand&apos;s tone?</h2>
              <p className="text-[#6B7280] mb-6">Pick the vibe that best matches your brand&apos;s personality. (e.g., Playful, Bold, Professional, Friendly)</p>
              <select
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#60A5FA] focus:outline-none text-lg mb-2"
                value={toneOptions.includes(form.tone) ? form.tone : (form.tone ? "Other" : "")}
                onChange={handleToneChange}
                onBlur={() => setTouched(true)}
              >
                <option value="" disabled>Select your brand tone</option>
                {toneOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {form.tone === "Other" && (
                <input
                  type="text"
                  className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#60A5FA] focus:outline-none text-lg mt-2"
                  placeholder="Enter your brand tone"
                  value={form.customTone || ""}
                  onChange={handleCustomToneChange}
                  onBlur={() => setTouched(true)}
                  autoFocus
                />
              )}
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : step === 5 ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#FF6B6B]">What&apos;s your posting frequency goal?</h2>
              <p className="text-[#6B7280] mb-6">How often do you want to post? (You can change this anytime!)</p>
              <select
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#FF6B6B] focus:outline-none text-lg mb-2"
                value={frequencyOptions.includes(form.frequency) ? form.frequency : (form.frequency ? "Other" : "")}
                onChange={handleFrequencyChange}
                onBlur={() => setTouched(true)}
              >
                <option value="" disabled>Select your goal</option>
                {frequencyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {form.frequency === "Other" && (
                <input
                  type="text"
                  className="w-full max-w-xs px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-[#FF6B6B] focus:outline-none text-lg mt-2"
                  placeholder="Enter your goal (e.g. 2x per month)"
                  value={form.customFrequency || ""}
                  onChange={handleCustomFrequencyChange}
                  onBlur={() => setTouched(true)}
                  autoFocus
                />
              )}
              {error && touched && (
                <motion.div
                  className="text-[#FF6B6B] text-sm mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-heading font-bold mb-4 text-[#FF6B6B]">{steps[step]}</h2>
              <p className="text-[#6B7280]">[Form field for {steps[step]} coming soon]</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 rounded-full bg-[#E5E7EB] text-[#1F2937] font-semibold disabled:opacity-50"
          onClick={prev}
          disabled={step === 0}
        >
          Back
        </button>
        <button
          className="px-6 py-2 rounded-full bg-[#FF6B6B] text-white font-semibold disabled:opacity-50"
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
        >
          Next
        </button>
      </div>
    </div>
  );
} 
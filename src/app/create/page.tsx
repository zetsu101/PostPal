"use client";
import { useState } from "react";
import Link from "next/link";

interface PostData {
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
}

export default function CreatePage() {
  const [postData, setPostData] = useState<PostData>({
    title: "Behind the Scenes: Our Creative Process",
    caption: "Ever wondered how we bring your ideas to life? Here's a peek into our creative process! From initial concept to final design, every step is crafted with care. What's your favorite part of the creative journey? ✨",
    hashtags: ["#BehindTheScenes", "#CreativeProcess", "#DesignLife", "#BrandStory"],
    imagePrompt: "A clean workspace with design tools, mood boards, and creative materials scattered around, soft natural lighting, professional photography style",
    platform: "Instagram"
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState(["Instagram"]);
  const [hashtagsInput, setHashtagsInput] = useState(postData.hashtags.join(" "));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const platforms = ["Instagram", "Facebook", "TikTok", "LinkedIn", "Twitter"];

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
<div className="h-screen bg-white flex overflow-hidden">
  {/* Left Navigation - YouTube-style Collapsible */}
  <div className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col relative items-center ${sidebarOpen ? 'w-56 px-4' : 'w-20 px-0'}`}>
    {/* Hamburger Menu Button - Updated YouTube-style */}
    <div className="h-20 flex items-center justify-center w-full">
    <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group"
  aria-label="Toggle sidebar"
>
  <div className="relative w-6 h-4 flex flex-col justify-between items-center">
    {/* Top Line */}
    <span
      className={`absolute top-0 w-6 h-0.5 bg-black rounded transition-all duration-300 
        ${sidebarOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
    ></span>
    
    {/* Middle Line */}
    <span
      className={`absolute top-[7px] w-6 h-0.5 bg-black rounded transition-all duration-300 
        ${sidebarOpen ? 'opacity-0' : ''}`}
    ></span>
    
    {/* Bottom Line */}
    <span
      className={`absolute bottom-0 w-6 h-0.5 bg-black rounded transition-all duration-300 
        ${sidebarOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
    ></span>
  </div>
</button>
    </div>

        {/* Navigation - Responsive */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-8">
          <Link href="/dashboard" className={`flex items-center gap-4 w-full py-3 px-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-xl ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span>🏠</span>
            {sidebarOpen && <span className="font-semibold text-base">Home</span>}
          </Link>
          <Link href="/create" className={`flex items-center gap-4 w-full py-3 px-2 rounded-xl text-blue-600 bg-blue-50 shadow-lg text-xl ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span>✏️</span>
            {sidebarOpen && <span className="font-semibold text-base">Create</span>}
          </Link>
          <Link href="/calendar" className={`flex items-center gap-4 w-full py-3 px-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-xl ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span>📅</span>
            {sidebarOpen && <span className="font-semibold text-base">Calendar</span>}
          </Link>
          <Link href="/saved" className={`flex items-center gap-4 w-full py-3 px-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-xl ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span>💾</span>
            {sidebarOpen && <span className="font-semibold text-base">Saved</span>}
          </Link>
          <Link href="/settings" className={`flex items-center gap-4 w-full py-3 px-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-xl ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span>⚙️</span>
            {sidebarOpen && <span className="font-semibold text-base">Settings</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content Area - Responsive to sidebar */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarOpen ? 'pl-0' : 'pl-0'}`}>
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <div className="flex items-center space-x-10">
            <span className="text-2xl font-bold text-gray-900">PostPal</span>
            <div className="flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              <Link href="/create" className="text-blue-600 font-bold">Create</Link>
              <Link href="/calendar" className="text-gray-600 hover:text-blue-600 font-medium">Calendar</Link>
              <Link href="/saved" className="text-gray-600 hover:text-blue-600 font-medium">Saved</Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 text-xl">🔍</span>
            <span className="text-gray-400 text-xl">🔔</span>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Main Content - Modern Spacing */}
        <div className="flex-1 flex overflow-hidden p-8 gap-10">
          {/* Left Content Area */}
          <div className="flex-1 flex flex-col gap-10 justify-between">
            {/* Date Selector */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg px-8 py-4 mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-xl">◀</span>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-base text-blue-600 bg-blue-50 rounded-lg font-semibold">17 Mon</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">18 Tue</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">19 Wed</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">20 Thu</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">21 Fri</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">22 Sat</button>
                  <button className="px-4 py-2 text-base text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">23 Sun</button>
                </div>
                <span className="text-gray-400 text-xl">▶</span>
              </div>
              <span className="text-base text-gray-500">This month 2023</span>
            </div>

            {/* Content Type Tabs */}
            <div className="flex space-x-10 border-b border-gray-200 pb-2">
              <button className="pb-2 border-b-4 border-blue-600 text-blue-600 font-bold text-lg">POST</button>
              <button className="pb-2 text-gray-500 font-semibold text-lg hover:text-blue-600">STORIES</button>
              <button className="pb-2 text-gray-500 font-semibold text-lg hover:text-blue-600">REELS</button>
            </div>

            {/* Content Area with Modern Spacing */}
            <div className="flex-1 flex gap-10">
              {/* Left Column - Media Upload */}
              <div className="w-1/2 flex flex-col gap-8 justify-between">
                {/* Media Upload Area */}
                <div className="flex-1 bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <span className="text-5xl mb-4 block">🎯</span>
                    <p className="text-gray-600 text-lg font-semibold">Drop media here</p>
                  </div>
                </div>

                {/* Upload Button */}
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg text-lg">
                  Upload your own media, or, use our in-built libraries for free!
                </button>

                {/* Scheduling Options */}
                <div className="space-y-4 bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Schedule your post</h3>
                  <div className="space-y-3">
                    <label className="flex items-center text-base">
                      <input type="radio" name="schedule" className="mr-3" defaultChecked />
                      <span>Save as draft</span>
                    </label>
                    <label className="flex items-center text-base">
                      <input type="radio" name="schedule" className="mr-3" />
                      <span>Post now</span>
                    </label>
                    <label className="flex items-center text-base">
                      <input type="radio" name="schedule" className="mr-3" />
                      <span>Custom time</span>
                    </label>
                    <label className="flex items-center text-base">
                      <input type="radio" name="schedule" className="mr-3" />
                      <span>Your best times to post</span>
                    </label>
                    <label className="flex items-center text-base">
                      <input type="radio" name="schedule" className="mr-3" />
                      <span>When your audience is most online</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Caption */}
              <div className="w-1/2 flex flex-col gap-8 justify-between">
                {/* Caption Input */}
                <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
                  <textarea
                    value={postData.caption}
                    onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
                    className="w-full h-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-lg"
                    placeholder="Craft the perfect caption here..."
                  />
                  {/* Caption Tools */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">💡</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">📷</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">🌍</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">🏷️</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">👤</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">🎵</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">📅</button>
                      <button className="p-2 hover:bg-gray-100 rounded text-xl">⏰</button>
                    </div>
                    <div className="text-base text-gray-500 font-semibold">
                      <span>0/30</span> • <span>0/2200</span>
                    </div>
                  </div>
                </div>

                {/* Auto Post Options */}
                <div className="space-y-4 bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold">Auto Post to Instagram</p>
                      <p className="text-xs text-gray-500">@oliveandauburn</p>
                    </div>
                    <button className="w-12 h-7 bg-gray-200 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold">Share copy to Facebook</p>
                      <p className="text-xs text-gray-500">oliveandauburn</p>
                    </div>
                    <button className="w-12 h-7 bg-gray-200 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1"></div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 justify-end">
                  <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all">
                    DISCARD DRAFT
                  </button>
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center">
                    SAVE AS DRAFT
                    <span className="ml-2">▼</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Instagram Preview with spacing */}
          <div className="w-96 bg-white border-l border-gray-200 p-8 flex flex-col gap-10 justify-between">
            {/* Account Header */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">@oliveandauburn</span>
                  <button className="text-xs text-blue-600 font-bold">SELECT</button>
                </div>
                <div className="flex space-x-6 text-base">
                  <button className="text-blue-600 border-b-2 border-blue-600 pb-1 font-bold">ALL</button>
                  <button className="text-gray-500 font-semibold">SCHEDULED</button>
                </div>
              </div>

              {/* Content Type Tabs */}
              <div className="flex space-x-6 text-base">
                <button className="text-blue-600 border-b-2 border-blue-600 pb-1 font-bold">POSTS</button>
                <button className="text-gray-500 font-semibold">STORIES</button>
                <button className="text-gray-500 font-semibold">REELS</button>
              </div>
            </div>

            {/* Image Grid */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              {/* Sample Images */}
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center shadow">
                  <span className="text-2xl text-gray-400">📱</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
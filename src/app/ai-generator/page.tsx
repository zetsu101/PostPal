import AIContentGenerator from "@/components/AIContentGenerator";

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Content Generator
          </h1>
          <p className="text-gray-600">
            Generate engaging social media content with the power of AI
          </p>
        </div>
        
        <AIContentGenerator />
      </div>
    </div>
  );
}

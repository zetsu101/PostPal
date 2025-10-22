import RealTimeNotificationSystem from '@/components/RealTimeNotificationSystem';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with live notifications from your PostPal activities
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center">
            <RealTimeNotificationSystem />
          </div>
        </div>
      </div>
    </div>
  );
}

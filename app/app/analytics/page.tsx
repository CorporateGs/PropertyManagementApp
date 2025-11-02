
import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/advanced/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics | PropertyHub Pro',
  description: 'Advanced property analytics and insights',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="mt-2 text-gray-600">
          AI-powered analytics to optimize your property performance and maximize ROI
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}


"use client";

import { useState } from "react";
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Shield,
  CreditCard,
  Mail,
  Building2,
  Cloud
} from "lucide-react";

const integrations = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Process rent payments and security deposits securely.",
    icon: CreditCard,
    status: "connected",
    category: "Payments"
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery service for notifications and newsletters.",
    icon: Mail,
    status: "connected",
    category: "Communication"
  },
  {
    id: "yardi",
    name: "Yardi",
    description: "Sync property data with Yardi Voyager.",
    icon: Building2,
    status: "disconnected",
    category: "Property Management"
  },
  {
    id: "aws",
    name: "AWS S3",
    description: "Cloud storage for documents and images.",
    icon: Cloud,
    status: "connected",
    category: "Infrastructure"
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Enterprise-grade identity and access management.",
    icon: Shield,
    status: "connected",
    category: "Security"
  }
];

export default function IntegrationsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setLoading(id);
    // Simulate connection delay
    setTimeout(() => {
      setLoading(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Plug className="h-8 w-8 text-blue-600" />
          Integrations
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your connected services and third-party tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <integration.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                integration.status === "connected" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}>
                {integration.status === "connected" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Disconnected
                  </>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {integration.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
              {integration.description}
            </p>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {integration.category}
              </span>
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={loading === integration.id || integration.status === "connected"}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  integration.status === "connected"
                    ? "text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                }`}
              >
                {loading === integration.id ? "Connecting..." : integration.status === "connected" ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

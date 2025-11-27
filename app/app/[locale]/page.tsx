"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Users, DollarSign, TrendingUp, Shield, Zap, Globe, Mail } from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Building2 className="h-20 w-20 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl mb-6">
              Property Management Hub Pro
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              The ultimate AI-powered property management system. Streamline operations, automate communications, and manage properties in multiple languages.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link
                href="/en/auth/signin"
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/en/auth/signup"
                className="rounded-lg border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to manage properties
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Powerful features designed for modern property management
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Property Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete control over buildings, units, and tenant relationships
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Mail className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Email Assistant
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pre-built templates and AI-powered email drafting for all communications
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Globe className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Multi-Language
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Support for English, Spanish, and French with seamless switching
            </p>
          </div>

          {/* Feature 4 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <DollarSign className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Financial Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track payments, manage leases, and generate comprehensive reports
            </p>
          </div>

          {/* Feature 5 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Users className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Tenant Portal
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Self-service portal for tenants to submit requests and pay rent
            </p>
          </div>

          {/* Feature 6 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <TrendingUp className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered insights, revenue tracking, and predictive maintenance
            </p>
          </div>

          {/* Feature 7 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="h-12 w-12 text-cyan-600 dark:text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Compliance Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built-in compliance tracking and automated reporting
            </p>
          </div>

          {/* Feature 8 */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Automation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automate routine tasks and focus on growing your business
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your property management?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of property managers who trust our platform for their daily operations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/en/auth/signup"
                className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="/en/auth/signin"
                className="text-lg font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
              >
                Sign in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  Wrench,
  Bot,
  FileText,
  Plug,
  Upload,
  BarChart3,
  Calendar,
  Car,
  Package,
  Video,
  Globe
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/buildings", label: "Buildings", icon: Building },
  { href: "/units", label: "Units", icon: Building },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/visitor-parking", label: "Parking", icon: Car },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/documents/status-certificates", label: "Status Certs", icon: FileText },
  { href: "/community/agm", label: "AGM", icon: Video },
  { href: "/websites/manage", label: "Website", icon: Globe },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/bulk-upload", label: "Bulk Upload", icon: Upload },
  { href: "/property-scores", label: "Property Scores", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export default function NavbarSimple() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              PropertyHub Pro
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 hover:bg-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {session?.user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {session?.user?.firstName}
                </span>
                <button
                  onClick={() => {
                    window.location.href = "/auth/signin";
                  }}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  Palette,
  BarChart3,
  Activity,
  TrendingUp
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-orders", label: "AI Agency", icon: Bot },
  { href: "/buildings/sample-building/automation", label: "Automation", icon: Activity },
  { href: "/buildings/sample-building/emergency", label: "Emergency", icon: TrendingUp },
  { href: "/admin/vendors", label: "Vendors", icon: Users },
  { href: "/my-services", label: "Services", icon: Plug },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/buildings", label: "Buildings", icon: Building },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: FileText },
];

const themes = [
  { name: "Default", value: "default" },
  { name: "Forest", value: "forest" },
  { name: "Ocean", value: "ocean" },
  { name: "Sunset", value: "sunset" },
  { name: "Dark", value: "dark" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes.find((t) => t.value === savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    setIsThemeMenuOpen(false);
  };

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
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme menu"
                  >
                    <Palette className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  {isThemeMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Choose Theme
                        </div>
                        <div className="space-y-1">
                          {themes.map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() => handleThemeChange(theme.value)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                currentTheme === theme.value
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              }`}
                            >
                              <span className="flex items-center">
                                {theme.name === "Forest" && <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />}
                                {theme.name === "Ocean" && <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />}
                                {theme.name === "Sunset" && <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />}
                                {theme.name === "Dark" && <span className="w-2 h-2 bg-gray-800 rounded-full mr-2" />}
                                {theme.name === "Default" && <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />}
                                {theme.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem("theme");
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

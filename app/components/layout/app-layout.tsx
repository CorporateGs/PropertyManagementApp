"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Building,
  Wrench,
  DollarSign,
  FileText,
  MessageSquare,
  Building2,
  Home,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Palette
} from "lucide-react";
import { useState, useEffect } from "react";

// Core navigation items
const coreNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Buildings', href: '/buildings', icon: Building2 },
  { name: 'Units', href: '/units', icon: Home },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
];

const themes = [
  { name: "Default", value: "default" },
  { name: "Forest", value: "forest" },
  { name: "Ocean", value: "ocean" },
  { name: "Sunset", value: "sunset" },
  { name: "Dark", value: "dark" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export default function AppLayout({ children, showNavigation = true }: AppLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");

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

  const shouldHideNavigation = pathname?.startsWith("/auth/") || !showNavigation;

  if (shouldHideNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                PropertyHub Pro
              </span>
            </div>

            <div className="hidden md:flex md:flex-1 md:justify-start md:ml-10">
              <div className="flex items-center space-x-1">
                {coreNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <NextLink
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </NextLink>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Palette className="h-5 w-5" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-20 top-16 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-50">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              )}

              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{session.user?.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NextLink href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </NextLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
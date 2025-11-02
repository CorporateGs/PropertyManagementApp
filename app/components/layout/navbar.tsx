
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Home, 
  CreditCard, 
  MessageCircle, 
  Wrench, 
  FileText, 
  Settings,
  Bot,
  BarChart3,
  UserCheck,
  Calendar,
  TrendingUp,
  Bell,
  Search,
  Globe,
  Brain,
  Smartphone,
  Upload,
  Calculator
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Input } from '@/components/ui/input';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Buildings', href: '/buildings', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Units', href: '/units', icon: Home },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Communications', href: '/communications', icon: MessageCircle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const aiFeatures = [
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, badge: 'AI' },
  { name: 'AI Dashboard', href: '/ai-dashboard', icon: Brain, badge: 'New' },
  { name: 'AI Screening', href: '/ai-screening', icon: UserCheck, badge: 'AI' },
  { name: 'Smart Building', href: '/smart-building', icon: Smartphone, badge: 'IoT' },
];

const advancedFeatures = [
  { name: 'Bulk Upload', href: '/bulk-upload', icon: Upload, badge: 'Mass' },
  { name: 'Financial Mgmt', href: '/financial-management', icon: Calculator, badge: 'Pro' },
  { name: 'Enhanced Portal', href: '/enhanced-tenant-portal', icon: UserCheck, badge: 'Premium' },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const quickActions = [
  { name: 'Tenant Portal', href: '/tenant-portal', icon: UserCheck, badge: 'New' },
  { name: 'Customer Site', href: '/customer', icon: Globe, badge: 'Public' },
  { name: 'Screening', href: '/screening', icon: UserCheck },
  { name: 'Inspections', href: '/inspections', icon: Calendar },
  { name: 'Marketing', href: '/marketing', icon: TrendingUp },
];

export function Navbar() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* AI Features Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Features
                    <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700">
                      New
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {aiFeatures.map((feature) => (
                    <DropdownMenuItem key={feature.name} asChild>
                      <Link href={feature.href} className="flex items-center">
                        <feature.icon className="h-4 w-4 mr-2" />
                        <span className="flex-1">{feature.name}</span>
                        {feature.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Advanced Features Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Advanced
                    <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
                      Pro
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {advancedFeatures.map((feature) => (
                    <DropdownMenuItem key={feature.name} asChild>
                      <Link href={feature.href} className="flex items-center">
                        <feature.icon className="h-4 w-4 mr-2" />
                        <span className="flex-1">{feature.name}</span>
                        {feature.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and Right Side */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="pl-10 w-64"
                placeholder="Search tenants, units, payments..."
                type="search"
              />
            </div>

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.name} asChild>
                    <Link href={action.href} className="flex items-center">
                      <action.icon className="h-4 w-4 mr-2" />
                      <span>{action.name}</span>
                      {action.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-gray-500">You have 3 unread notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[
                    {
                      title: 'New Maintenance Request',
                      description: 'Unit 205 - Kitchen faucet dripping',
                      time: '2 minutes ago',
                      urgent: true
                    },
                    {
                      title: 'Payment Received',
                      description: 'Sarah Johnson - $2,750.00',
                      time: '1 hour ago',
                      urgent: false
                    },
                    {
                      title: 'Lease Expiring Soon',
                      description: 'Unit 301 lease expires in 30 days',
                      time: '3 hours ago',
                      urgent: false
                    }
                  ].map((notification, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${notification.urgent ? 'text-red-600' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                        </div>
                        {notification.urgent && (
                          <Badge variant="destructive" className="ml-2 text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {(session?.user as any)?.role || 'Admin'}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault();
                    signOut();
                  }}
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t bg-gray-50">
        <div className="px-4 py-3 space-y-1 overflow-x-auto">
          <div className="flex space-x-1">
            {navigation.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium min-w-0 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}


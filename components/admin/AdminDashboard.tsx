'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Wrench, 
  ShieldAlert, 
  Check, 
  X, 
  Search, 
  Bell, 
  LayoutGrid,
  Settings,
  LogOut,
  Building,
  UserCheck
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Badge, FadeIn, SimpleLineChart } from './AdminComponents';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const StatCard = ({ icon, label, val, sub, chartData }: any) => (
    <div className="bg-navy-900 p-6 border border-navy-800 rounded-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
         <div className="p-2 bg-navy-800 rounded-sm text-gold-500">{icon}</div>
         <span className="text-green-500 text-xs font-bold">{sub}</span>
      </div>
      <h3 className="text-3xl font-serif font-bold text-white mb-1 relative z-10">{val}</h3>
      <p className="text-gray-400 text-xs uppercase tracking-widest relative z-10">{label}</p>
      {chartData && (
          <div className="absolute bottom-0 right-0 w-32 h-16 opacity-30">
              <SimpleLineChart data={chartData} color="#C69C45" />
          </div>
      )}
    </div>
  );

  const KYCQueue = () => (
    <div className="bg-navy-900 border border-navy-800 rounded-sm overflow-hidden">
      <div className="p-4 border-b border-navy-800 flex justify-between items-center">
         <h3 className="font-bold text-white">Pending Verification (KYC)</h3>
         <Badge variant="warning">3 Pending</Badge>
      </div>
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-navy-950 text-gray-500 uppercase tracking-wider text-xs">
          <tr>
            <th className="p-4">User</th>
            <th className="p-4">Role</th>
            <th className="p-4">Documents</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-800">
          {[
            { name: "Sarah Connor", role: "Tenant", doc: "Lease_Agrmt.pdf" },
            { name: "John Wick", role: "Private Client", doc: "Passport_ID.jpg" },
            { name: "Bruce Wayne", role: "Board Member", doc: "Deed_Title.pdf" }
          ].map((u, i) => (
            <tr key={i} className="hover:bg-navy-800/50">
               <td className="p-4 font-bold text-white">{u.name}</td>
               <td className="p-4">{u.role}</td>
               <td className="p-4 text-blue-400 underline cursor-pointer">{u.doc}</td>
               <td className="p-4 flex gap-2">
                 <button aria-label="Approve" className="p-1 bg-green-900 text-green-400 rounded hover:bg-green-800"><Check className="w-4 h-4" /></button>
                 <button aria-label="Reject" className="p-1 bg-red-900 text-red-400 rounded hover:bg-red-800"><X className="w-4 h-4" /></button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const InboxFeed = () => (
    <div className="bg-navy-900 border border-navy-800 rounded-sm h-[500px] flex flex-col">
       <div className="p-4 border-b border-navy-800">
         <h3 className="font-bold text-white">Unified Inbox</h3>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {[
           { from: "Unit 402", type: "Tenant", sub: "Noise Complaint", time: "10m ago" },
           { from: "Estate Client #44", type: "Client", sub: "Request for Plumber", time: "1h ago" },
           { from: "Board Pres.", type: "Board", sub: "Budget Approval", time: "2h ago" }
         ].map((msg, i) => (
           <div key={i} className="bg-navy-950 p-4 border border-navy-800 hover:border-gold-500/50 transition-colors cursor-pointer group">
             <div className="flex justify-between mb-1">
               <span className="text-gold-500 font-bold text-sm">{msg.from}</span>
               <span className="text-gray-500 text-xs">{msg.time}</span>
             </div>
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs bg-navy-800 text-gray-300 px-2 rounded-full">{msg.type}</span>
             </div>
             <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{msg.sub}</p>
           </div>
         ))}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-navy-800 flex flex-col">
         <div className="h-20 flex items-center justify-center border-b border-navy-800">
            <span className="font-serif font-bold text-2xl tracking-widest text-gold-500">LuxeOS</span>
         </div>
         <nav className="flex-1 py-6 space-y-1 px-3">
            {[
              { id: 'overview', icon: <LayoutGrid />, label: 'Command Center' },
              { id: 'users', icon: <Users />, label: 'User Directory' },
              { id: 'kyc', icon: <UserCheck />, label: 'KYC Approvals' },
              { id: 'jobs', icon: <Wrench />, label: 'Service Jobs' },
              { id: 'messages', icon: <MessageSquare />, label: 'Communications' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors ${
                  activeTab === item.id ? 'bg-gold-500 text-navy-950 font-bold' : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                }`}
              >
                {item.icon} <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
         </nav>
         <div className="p-4 border-t border-navy-800">
           <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-400 w-full">
             <LogOut className="w-5 h-5" /> <span className="hidden lg:inline">System Logout</span>
           </button>
         </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-navy-800 flex justify-between items-center px-8 bg-navy-950/50 backdrop-blur-md">
           <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">Dashboard / {activeTab}</h2>
           <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="bg-navy-900 border border-navy-700 rounded-full py-2 pl-10 pr-4 text-sm focus:border-gold-500 outline-none w-64" placeholder="Search system..." />
              </div>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-navy-950 font-bold">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <FadeIn>
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={<Building />} 
                    label="Total Properties" 
                    val="142" 
                    sub="+2 this mo" 
                    chartData={[130, 132, 135, 138, 140, 142]} 
                />
                <StatCard 
                    icon={<Users />} 
                    label="Active Tenants" 
                    val="12,405" 
                    sub="98% Occ" 
                    chartData={[12000, 12100, 12250, 12300, 12380, 12405]} 
                />
                <StatCard 
                    icon={<Wrench />} 
                    label="Open Tickets" 
                    val="34" 
                    sub="5 Urgent" 
                    chartData={[45, 40, 38, 30, 35, 34]} // Trending down is good
                />
                <StatCard 
                    icon={<ShieldAlert />} 
                    label="Revenue (M)" 
                    val="$4.2M" 
                    sub="YTD" 
                    chartData={[3.5, 3.6, 3.8, 3.9, 4.1, 4.2]} 
                />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <KYCQueue />
                   <div className="bg-navy-900 border border-navy-800 rounded-sm p-6">
                      <h3 className="font-bold text-white mb-4">Active Job Board</h3>
                      <div className="space-y-4">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex items-center justify-between p-4 bg-navy-950 border border-navy-800 rounded-sm">
                             <div className="flex items-center gap-4">
                               <div className="w-2 h-12 bg-gold-500 rounded-full"></div>
                               <div>
                                 <h4 className="font-bold text-white">Leaking Sink - Unit 204</h4>
                                 <p className="text-xs text-gray-400">Assigned to: Plumbing Pro Inc.</p>
                               </div>
                             </div>
                             <Badge variant="warning">In Progress</Badge>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                <div>
                   <InboxFeed />
                </div>
             </div>
           </FadeIn>
        </div>
      </main>
    </div>
  );
};

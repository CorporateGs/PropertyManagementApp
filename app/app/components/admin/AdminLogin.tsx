'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button, ImageSlideshow } from './AdminComponents';

export const AdminLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid admin credentials');
        setIsLoading(false);
      } else {
        // Successful login
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <ImageSlideshow 
          images={[
             "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
             "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"
          ]}
          overlayOpacity="bg-navy-950/50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
      </div>
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-sm shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 border-2 border-gold-500 flex items-center justify-center mx-auto mb-4 text-gold-500">
             <span className="font-serif text-3xl font-bold">L</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Command Center</h2>
          <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleAdminLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Admin ID" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-navy-900/50 border border-gray-700 text-white focus:border-gold-500 outline-none transition-colors rounded-sm" 
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Secure Token" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-navy-900/50 border border-gray-700 text-white focus:border-gold-500 outline-none transition-colors rounded-sm" 
              required
            />
          </div>
          
          <Button variant="gold-outline" className="w-full py-4 mt-4 hover:bg-gold-500 hover:text-navy-950" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate System'}
          </Button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-600">
          System v2.4.1 • Secure Connection
        </div>
      </div>
    </div>
  );
};

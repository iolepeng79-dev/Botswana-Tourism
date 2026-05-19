/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import BusinessDashboard from './components/BusinessDashboard';
import AdminDashboard from './components/AdminDashboard';
import TouristDashboard from './components/TouristDashboard';
import OnboardingForm from './components/OnboardingForm';
import AuthView from './components/AuthView';
import NewsPopup from './components/NewsPopup';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationManager from './components/NotificationManager';
import { UserRole, Profile } from './types';
import { User, Shield, Briefcase, ChevronUp, LogOut, Activity } from 'lucide-react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';

export default function App() {
  const [role, setRole] = useState<UserRole>('Guest');
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        setLoading(true);
        // 1. Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthError(sessionError.message);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setRole('Guest');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to prevent throw on missing profile
      
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      if (data) {
        console.log('Profile loaded:', data);
        setUser(data);
        setRole(data.role as UserRole);
      } else {
        // Authenticated but no profile record - possibly a new signup without trigger completion
        console.warn('Authenticated user has no profile record. ID:', userId);
        // We might want to force session logout or redirect to onboarding
        setRole('Guest');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setRole('Guest');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <Activity className="w-12 h-12 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TourBots Botswana</p>
          <p className="text-sm font-bold text-slate-600">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Connection Error</h3>
          <p className="text-sm text-slate-500 mb-8">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 relative">
        {/* Role Rendering */}
        {role === 'Business' && <BusinessDashboard profile={user} />}
        {role === 'Admin' && <AdminDashboard profile={user} />}
        {(role === 'Tourist' || role === 'Guest') && (
          <TouristDashboard 
            profile={user} 
            onAuthRequired={() => setIsAuthOpen(true)} 
          />
        )}

        {/* Real-time Notifications */}
        <NotificationManager currentUser={user} role={role} />

        {/* Global News Popups */}
        <NewsPopup />

      {/* Auth Overlay */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <AuthView 
            onLogin={(newRole) => {
              setRole(newRole);
              setIsAuthOpen(false);
            }}
            onCancel={() => setIsAuthOpen(false)}
          />
        </div>
      )}
    </div>
  </ErrorBoundary>
);
}

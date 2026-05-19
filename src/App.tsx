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

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setRole('Guest');
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
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUser(data);
        setRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setRole('Guest');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
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

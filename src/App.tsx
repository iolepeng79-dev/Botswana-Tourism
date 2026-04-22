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
import { UserRole, Profile } from './types';
import { User, Shield, Briefcase, ChevronUp, LogOut } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [role, setRole] = useState<UserRole>('Guest');
  const [user, setUser] = useState<Profile | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Mock auto-login for demo purposes when role changes
  useEffect(() => {
    if (role === 'Guest') {
      setUser(null);
    } else {
      setUser({
        id: 'u123',
        full_name: `${role} User`,
        email: `${role.toLowerCase()}@example.bw`,
        role: role,
        created_at: new Date().toISOString()
      });
    }
  }, [role]);

  const handleLogout = () => {
    setRole('Guest');
    setUser(null);
  };

  return (
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

      {/* Demo Role Switcher (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 print:hidden">
        {showRoleSwitcher && (
          <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-1 w-48">
            <p className="text-[10px] font-black uppercase text-slate-400 px-3 py-2">Switch View (Demo)</p>
            {[
              { id: 'Guest', icon: User, color: 'slate' },
              { id: 'Tourist', icon: User, color: 'indigo' },
              { id: 'Business', icon: Briefcase, color: 'emerald' },
              { id: 'Admin', icon: Shield, color: 'rose' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id as UserRole);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  role === r.id 
                    ? `bg-${r.color}-50 text-${r.color}-600` 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <r.icon className="w-4 h-4" />
                {r.id} View
              </button>
            ))}
            {role !== 'Guest' && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 mt-1 border-t border-slate-50 pt-3"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        )}
        <button 
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="bg-slate-900 text-white p-3 rounded-full shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 group"
        >
          <div className="flex items-center gap-2 px-2 overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">
             <span className="text-xs font-bold whitespace-nowrap">Demo Controls</span>
          </div>
          <ChevronUp className={cn("w-5 h-5 transition-transform", showRoleSwitcher ? "rotate-180" : "")} />
        </button>
      </div>
    </div>
  );
}

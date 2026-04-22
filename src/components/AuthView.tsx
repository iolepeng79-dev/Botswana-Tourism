import React, { useState } from 'react';
import { User, Shield, Briefcase, Mail, Lock, ArrowRight, CheckCircle, ChevronLeft, X } from 'lucide-react';
import { cn } from '../lib/utils';
import OnboardingForm from './OnboardingForm';
import { UserRole } from '../types';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onCancel?: () => void;
}

export default function AuthView({ onLogin, onCancel }: AuthViewProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [registerRole, setRegisterRole] = useState<UserRole | undefined>();
  const [loginRole, setLoginRole] = useState<UserRole>('Tourist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation of login
    onLogin(loginRole);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setView('login');
    }, 2000);
  };

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <OnboardingForm 
          initialRole={registerRole}
          onComplete={(data) => {
            onLogin(data.role);
          }}
          onCancel={() => setView('login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://picsum.photos/seed/safari/1920/1080?blur=10')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
      
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-10 right-10 z-[100] w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all group"
        >
          <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-10 text-white flex flex-col items-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-900/40">
                <Shield className="w-8 h-8" />
             </div>
             <h2 className="text-3xl font-black tracking-tight">TourBots</h2>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
               {view === 'login' ? 'Welcome Back' : 'Security Check'}
             </p>
          </div>

          <div className="p-10">
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                {/* Role Switcher */}
                <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                  {[
                    { id: 'Tourist', icon: User, label: 'Tourist' },
                    { id: 'Business', icon: Briefcase, label: 'Business' },
                    { id: 'Admin', icon: Shield, label: 'Admin' }
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setLoginRole(role.id as UserRole)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        loginRole === role.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <role.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{role.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="email"
                        placeholder="your@email.bw"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Password</label>
                      <button 
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-3xl py-5 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-center pt-8 space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">New to the platform?</p>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setRegisterRole('Tourist');
                        setView('register');
                      }}
                      className="flex-1 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                      Join as Tourist
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setRegisterRole('Business');
                        setView('register');
                      }}
                      className="flex-1 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                    >
                      Join as Business
                    </button>
                  </div>
                </div>
              </form>
            )}

            {view === 'forgot-password' && (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
                 {!isSuccess ? (
                   <>
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">Reset Password</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-[200px] mx-auto">Enter your email and we'll send you recovery link.</p>
                      
                      <div className="relative text-left">
                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required
                          type="email"
                          placeholder="your@email.bw"
                          className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white rounded-3xl py-5 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                      >
                        Send Link
                      </button>

                      <button 
                        type="button"
                        onClick={() => setView('login')}
                        className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 mx-auto"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Login
                      </button>
                   </>
                 ) : (
                   <div className="py-10 space-y-6">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Email Sent!</h3>
                        <p className="text-sm font-medium text-slate-500">Check your inbox for instructions.</p>
                      </div>
                   </div>
                 )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

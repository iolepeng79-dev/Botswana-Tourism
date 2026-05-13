import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Briefcase, Bell, X, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { UserRole, Profile } from '../types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'request' | 'upgrade' | 'booking';
  timestamp: Date;
}

interface NotificationManagerProps {
  currentUser: Profile | null;
  role: UserRole;
}

export default function NotificationManager({ currentUser, role }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotif = { ...notif, id, timestamp: new Date() };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!supabase || !currentUser) return;

    const channels: any[] = [];

    // 1. Messages for everyone involved
    const messageChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`
      }, (payload) => {
        addNotification({
          title: 'New Message',
          message: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : ''),
          type: 'message'
        });
      })
      .subscribe();
    channels.push(messageChannel);

    // 2. Admin specific alerts
    if (role === 'Admin') {
      // New Business Verification Requests
      const businessChannel = supabase
        .channel('public:businesses')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'businesses'
        }, (payload) => {
          if (payload.new.status === 'Pending') {
            addNotification({
              title: 'New Business Request',
              message: `${payload.new.business_name} is waiting for verification.`,
              type: 'request'
            });
          }
        })
        .subscribe();
      channels.push(businessChannel);

      // New Package Upgrade Requests
      const upgradeChannel = supabase
        .channel('public:package_upgrade_requests')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'package_upgrade_requests'
        }, (payload) => {
          addNotification({
            title: 'New Upgrade Request',
            message: `${payload.new.business_name} requested a package upgrade.`,
            type: 'upgrade'
          });
        })
        .subscribe();
      channels.push(upgradeChannel);
    }

    // 3. Business specific alerts
    if (role === 'Business') {
      const bookingChannel = supabase
        .channel('public:bookings')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bookings',
          filter: `business_id=eq.${currentUser.id}` // Assuming biz ID matches user ID for simplicity, or we'd need biz ID here
        }, (payload) => {
          addNotification({
            title: 'New Booking',
            message: `A new booking has been made for your service.`,
            type: 'booking'
          });
        })
        .subscribe();
      channels.push(bookingChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [currentUser, role, addNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[300] pointer-events-none flex flex-col gap-3 w-80">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/50 p-5 rounded-[2rem] shadow-2xl shadow-indigo-200/20 flex items-start gap-4 ring-1 ring-white/50"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              notif.type === 'message' ? 'bg-indigo-50 text-indigo-600' :
              notif.type === 'request' ? 'bg-rose-50 text-rose-600' :
              notif.type === 'upgrade' ? 'bg-emerald-50 text-emerald-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {notif.type === 'message' && <MessageSquare className="w-5 h-5" />}
              {notif.type === 'request' && <Briefcase className="w-5 h-5" />}
              {notif.type === 'upgrade' && <ArrowUpCircle className="w-5 h-5" />}
              {notif.type === 'booking' && <CheckCircle2 className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{notif.title}</h4>
              <p className="text-sm font-bold text-slate-800 leading-tight">{notif.message}</p>
            </div>

            <button 
              onClick={() => removeNotification(notif.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

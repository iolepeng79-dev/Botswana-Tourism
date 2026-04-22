import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Star, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Settings,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Download,
  Eye,
  Activity,
  UserCheck,
  Package,
  MapPin,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, subMonths } from 'date-fns';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  Business, 
  Booking, 
  Profile, 
  AuditLog, 
  PackageUpgradeRequest,
  AdminNotification
} from '../types';
import { exportDashboardToPDF } from '../lib/pdf';
import MessagingPanel from './MessagingPanel';

// --- Sub-components ---

const AdminKPI = ({ title, value, icon: Icon, trend, color }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend: string;
  color: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-4 rounded-2xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={cn(
        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm",
        trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

// --- Main Admin Dashboard Component ---

interface AdminDashboardProps {
  profile: Profile | null;
}

export default function AdminDashboard({ profile }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<PackageUpgradeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'upgrades' | 'analytics' | 'messages' | 'logs'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    if (!supabase) {
      // Mock data for Admin
      const mockBiz: Business[] = [
        { id: 'b1', business_name: 'Delta Cruises', status: 'Approved', category: 'Lodge', owner_id: 'o1', email: 'delta@info.bw', created_at: new Date().toISOString(), package_id: 'enterprise', location_name: 'Maun', media: [] },
        { id: 'b2', business_name: 'Savuti Camp', status: 'Pending', category: 'Safari Camp', owner_id: 'o2', email: 'savuti@safari.bw', created_at: new Date().toISOString(), package_id: 'professional', location_name: 'Kasane', payment_proof: 'https://example.com/receipt.pdf', media: [] },
        { id: 'b3', business_name: 'Gaborone Hotel', status: 'Rejected', category: 'Hotel', owner_id: 'o3', email: 'gabs@hotel.bw', created_at: new Date().toISOString(), package_id: 'free', location_name: 'Gaborone', admin_comments: 'Incomplete documents.', media: [] }
      ];

      setBusinesses(mockBiz);
      setUpgradeRequests([
        { 
           id: 'ug1', 
           business_id: 'b1', 
           current_package: 'professional', 
           requested_package: 'enterprise', 
           status: 'pending', 
           created_at: new Date().toISOString(), 
           payment_verified: true,
           payment_proof_url: 'https://picsum.photos/seed/payment1/1200/800'
        }
      ]);
      setAuditLogs([
        { id: '1', action: 'Approved Business', details: 'Delta Cruises approved by Admin', timestamp: new Date().toISOString(), admin_id: 'a1', user_id: 'o1' },
      ]);
      setBookings([
        { id: '1', business_id: 'b1', customer_id: 'u1', customer_name: 'K. Moremi', booking_date: '2026-05-15', duration: '2 Days', amount: 4500, status: 'confirmed', created_at: new Date().toISOString(), business_name: 'Delta Cruises', listing_title: 'Sunset Cruise' }
      ]);
      setLoading(false);
      return;
    }
  }

  const pendingBusinesses = businesses.filter(b => b.status === 'Pending');
  const stats = useMemo(() => {
    const totalRev = bookings.reduce((acc, b) => acc + (b.status === 'confirmed' || b.status === 'completed' ? b.amount : 0), 0);
    return {
      revenue: totalRev,
      users: 1240,
      activeBusinesses: businesses.filter(b => b.status === 'Approved').length,
      pending: pendingBusinesses.length,
      bookings: bookings.length
    };
  }, [businesses, bookings, pendingBusinesses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full shadow-2xl"
         />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Terminal</h1>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mt-1">Full Service Access</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="relative group hidden lg:block">
               <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Search platform..." 
                 className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold w-64 focus:w-80 transition-all outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10"
               />
             </div>
             <div className="flex items-center gap-4 pl-6 border-l border-white/10 text-white">
                <div className="text-right">
                  <p className="text-xs font-black uppercase">{profile?.full_name}</p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Super Admin</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center ring-4 ring-white/5 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=admin`} alt="A" />
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-10 py-12">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
          {[
            { id: 'overview', label: 'Platform Summary', icon: Activity },
            { id: 'verification', label: 'Verify Businesses', icon: UserCheck, count: stats.pending },
            { id: 'upgrades', label: 'Package Requests', icon: Zap, count: upgradeRequests.length },
            { id: 'analytics', label: 'Global Insights', icon: BarChart3 },
            { id: 'messages', label: 'Global Inbox', icon: MessageSquare },
            { id: 'logs', label: 'System Logs', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 text-left relative",
                activeTab === tab.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200" 
                  : "bg-white border-white text-slate-400 hover:border-slate-200 shadow-sm"
              )}
            >
              <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-indigo-400" : "text-slate-200")} />
              <span className="text-xs font-black uppercase tracking-widest leading-relaxed">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute top-6 right-6 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg shadow-rose-500/20">
                   {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

          <div id="admin-content">
            {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <AdminKPI title="Platform Revenue" value={`BWP ${stats.revenue.toLocaleString()}`} icon={TrendingUp} trend="+14.2%" color="bg-emerald-50 text-emerald-600" />
                <AdminKPI title="Total Travelers" value={stats.users.toLocaleString()} icon={Users} trend="+3.5%" color="bg-indigo-50 text-indigo-600" />
                <AdminKPI title="Active Partners" value={stats.activeBusinesses} icon={Briefcase} trend="+1.2%" color="bg-amber-50 text-amber-600" />
                <AdminKPI title="Pending Apps" value={stats.pending} icon={Clock} trend="-2" color="bg-slate-100 text-slate-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Revenue Growth Chart */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-black text-slate-800">Revenue Velocity</h3>
                      <button 
                        onClick={() => exportDashboardToPDF('admin-content', 'TourBots_Admin_Overview')}
                        className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                      >
                         <Download className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Mon', rev: 4000, users: 400 },
                          { name: 'Tue', rev: 3500, users: 500 },
                          { name: 'Wed', rev: 5000, users: 700 },
                          { name: 'Thu', rev: 6700, users: 900 },
                          { name: 'Fri', rev: 8000, users: 1200 },
                          { name: 'Sat', rev: 12000, users: 1800 },
                          { name: 'Sun', rev: 11000, users: 1600 },
                        ]}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                          <Tooltip 
                            contentStyle={{borderRadius: '24px', border: 'none', background: '#0f172a', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'}} 
                          />
                          <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                    <div className="space-y-10">
                       <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-full">
                      <h3 className="text-xl font-black text-slate-800 mb-8">System Health</h3>
                      <div className="space-y-6">
                         {[
                           { label: 'Server Uptime', value: '99.98%', status: 'optimal' },
                           { label: 'API Response', value: '112ms', status: 'optimal' },
                           { label: 'DB Latency', value: '45ms', status: 'optimal' },
                           { label: 'File Storage', value: '82% Full', status: 'warning' }
                         ].map((s, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                              <div className="flex items-center gap-3">
                                 <div className={cn("w-2 h-2 rounded-full", s.status === 'optimal' ? "bg-emerald-500" : "bg-amber-500")} />
                                 <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{s.label}</span>
                              </div>
                              <span className="text-sm font-black text-slate-900">{s.value}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Business Verification Queue</h2>
                  <p className="text-sm font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-6 py-2 rounded-full">{pendingBusinesses.length} Applications Waiting</p>
               </div>

               <div className="space-y-6">
                 {pendingBusinesses.length === 0 ? (
                   <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                      <CheckCircle2 className="w-20 h-20 text-emerald-100 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-slate-800">All Clear!</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending applications in the queue.</p>
                   </div>
                 ) : (
                   pendingBusinesses.map(biz => (
                     <div key={biz.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 hover:shadow-2xl transition-all">
                       <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-lg">
                          {biz.business_name.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start mb-6">
                             <div>
                                <h4 className="text-2xl font-black text-slate-900 mb-1">{biz.business_name}</h4>
                                <div className="flex items-center gap-3">
                                   <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{biz.category}</span>
                                   <span className="text-slate-300">•</span>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {biz.location_name}
                                   </span>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Owner Contact</p>
                                <p className="text-sm font-bold text-slate-900">{biz.email}</p>
                             </div>
                          </div>

                          <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
                             <a 
                               href={biz.payment_proof} 
                               target="_blank" 
                               className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100"
                             >
                               <FileText className="w-4 h-4" /> View Documents
                             </a>
                             <div className="ml-auto flex gap-3">
                               <button className="px-10 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100">Reject Application</button>
                               <button className="px-12 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" /> Approve Application
                               </button>
                             </div>
                          </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Package Upgrade Center</h2>
               <div className="grid grid-cols-1 gap-6">
                  {upgradeRequests.map(req => (
                    <div key={req.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                             <Zap className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-slate-900 mb-1">Upgrade Request</h4>
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Business ID: #{req.business_id}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-12 text-center">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current</p>
                            <span className="text-sm font-black text-slate-900 bg-slate-50 px-4 py-1.5 rounded-full capitalize">{req.current_package}</span>
                          </div>
                          <ArrowRight className="w-6 h-6 text-slate-200" />
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Target</p>
                            <span className="text-sm font-black text-white bg-indigo-600 px-6 py-2 rounded-full shadow-lg shadow-indigo-100 capitalize">{req.requested_package}</span>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          {req.payment_proof_url && (
                             <a 
                               href={req.payment_proof_url} 
                               target="_blank" 
                               className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-colors"
                             >
                                <FileText className="w-5 h-5" />
                             </a>
                          )}
                          <button className="px-10 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all">Reject</button>
                          <button className="px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all">Approve Upgrade</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="h-[750px] animate-in fade-in slide-in-from-bottom-4">
               <MessagingPanel currentUser={profile} receiverRole="Business" />
            </div>
          )}

          {activeTab === 'logs' && (
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-2xl font-black text-slate-900">Platform Audit Logs</h3>
                   <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Download Report</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                            <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Admin Action</th>
                            <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Target Context</th>
                            <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">User ID</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {auditLogs.map(log => (
                           <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-10 py-6 text-xs font-bold text-slate-400 font-mono italic">{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</td>
                              <td className="px-10 py-6">
                                 <span className="text-sm font-black text-slate-900">{log.action}</span>
                              </td>
                              <td className="px-10 py-6">
                                 <span className="text-xs font-medium text-slate-500">{log.details}</span>
                              </td>
                              <td className="px-10 py-6">
                                 <span className="text-xs font-bold text-indigo-400 font-mono">#{log.user_id}</span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
             <div className="space-y-12 pb-20">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm lg:col-span-1">
                     <h3 className="text-xl font-black text-slate-800 mb-8">Role Distribution</h3>
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                                data={[{ name: 'Businesses', value: stats.activeBusinesses }, { name: 'Tourists', value: stats.users }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                             >
                                <Cell fill="#6366f1" />
                                <Cell fill="#f43f5e" />
                             </Pie>
                             <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex justify-center gap-10 mt-6">
                        <div className="text-center">
                           <div className="w-10 h-2 bg-indigo-500 rounded-full mx-auto mb-2" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partners</p>
                        </div>
                        <div className="text-center">
                           <div className="w-10 h-2 bg-rose-500 rounded-full mx-auto mb-2" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travelers</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm lg:col-span-2">
                     <h3 className="text-xl font-black text-slate-800 mb-8">User Growth Plan</h3>
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { m: 'Jan', val: 400 }, { m: 'Feb', val: 600 }, { m: 'Mar', val: 800 }, 
                            { m: 'Apr', val: 1200 }, { m: 'May', val: 1800 }, { m: 'Jun', val: 2400 }
                          ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                             <Tooltip />
                             <Line type="monotone" dataKey="val" stroke="#f43f5e" strokeWidth={5} dot={{r: 6, fill: '#f43f5e', strokeWidth: 3, stroke: '#fff'}} />
                          </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800 mb-8">Travelers by Country</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { country: 'Botswana', count: 450 },
                         { country: 'USA', count: 320 },
                         { country: 'UK', count: 210 },
                         { country: 'Germany', count: 180 },
                         { country: 'South Africa', count: 150 },
                         { country: 'France', count: 120 },
                         { country: 'Others', count: 400 },
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                          <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '24px', border: 'none', background: '#0f172a', color: '#fff'}}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

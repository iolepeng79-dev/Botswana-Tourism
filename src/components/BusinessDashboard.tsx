import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Star, 
  Calendar, 
  BarChart3, 
  PieChart as PieChartIcon, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  Plus, 
  Edit2, 
  ArrowUpRight, 
  Image as ImageIcon, 
  Video, 
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  Download,
  MoreVertical,
  Activity,
  MessageSquare,
  FileText,
  Upload,
  Search,
  Zap,
  Info,
  Briefcase,
  User,
  Mail,
  Shield,
  ArrowRight,
  ArrowLeft
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
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  Business, 
  Booking, 
  Review, 
  Promotion, 
  AnalyticsEvent, 
  Location, 
  Listing, 
  Package, 
  DashboardFilters, 
  TimeRange,
  Profile,
  TIER_LIMITS 
} from '../types';
import { exportDashboardToPDF } from '../lib/pdf';
import MessagingPanel from './MessagingPanel';
import BusinessProfileView from './BusinessProfileView';

// --- Sub-components ---

const KPIStoreCard = ({ title, value, icon: Icon, trend, prefix = "" }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string; 
  prefix?: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">
      {prefix}{value}
    </h3>
  </motion.div>
);

const ChartCard = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", className)}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <button className="text-slate-400 hover:text-slate-600">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
    <div className="h-[300px]">
      {children}
    </div>
  </div>
);

// --- Main Dashboard Component ---

interface BusinessDashboardProps {
  profile: Profile | null;
}

export default function BusinessDashboard({ profile }: BusinessDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    year: new Date().getFullYear().toString(),
    month: 'All',
    location: 'All',
    status: 'All',
    category: 'All'
  });
  
  const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'promotions' | 'reviews' | 'profile' | 'messages' | 'explore'>('overview');
  const [mediaDescriptions, setMediaDescriptions] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const paymentProofRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Real-time Subscriptions ---
  useEffect(() => {
    if (!supabase || !business) return;

    const bookingSub = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `business_id=eq.${business.id}` }, 
        (payload) => {
          fetchDashboardData(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingSub);
    };
  }, [business?.id]);

  async function fetchDashboardData() {
    if (!supabase) {
      // GENERATE SAMPLE DATA FOR PREVIEW
      const sampleBiz: Business = {
        id: '1',
        business_name: 'Okavango Safaris',
        status: 'Approved',
        email: 'info@okavango.bw',
        owner_id: 'user1',
        bio: 'Premier luxury safari experiences in the heart of the Okavango Delta.',
        whatsapp: '+267 71 234 567',
        office_line: '+267 68 123 456',
        package_id: 'professional',
        category: 'Safari Camp',
        media: [],
        created_at: new Date().toISOString()
      };
      
      const sampleBookings: Booking[] = Array.from({ length: 45 }).map((_, i) => ({
        id: `bk-${i}`,
        business_id: '1',
        customer_id: `u-${i % 5}`,
        customer_name: ['Kabelo M.', 'Sarah Jones', 'Thabo N.', 'Lerato S.', 'John Doe'][i % 5],
        booking_date: subMonths(new Date(), i % 5).toISOString(),
        duration: '3 Days',
        amount: Math.floor(Math.random() * 5000) + 1500,
        status: ['completed', 'confirmed', 'pending', 'cancelled'][i % 4] as any,
        created_at: new Date().toISOString()
      }));

      const sampleReviews: Review[] = Array.from({ length: 12 }).map((_, i) => ({
        id: `rv-${i}`,
        business_id: '1',
        customer_id: `u-${i % 5}`,
        rating: [5, 4, 5, 3, 5][i % 5],
        comment: 'Amazing experience! Highly recommended.',
        created_at: new Date().toISOString()
      }));

      const samplePromos: Promotion[] = [
        { id: 'p1', business_id: '1', title: 'Winter Special', type: 'Discount', start_date: '2026-05-01', expiry_date: '2026-08-31', active: true, created_at: new Date().toISOString() },
        { id: 'p2', business_id: '1', title: 'Early Bird', type: 'Voucher', start_date: '2026-03-01', expiry_date: '2026-04-30', active: true, created_at: new Date().toISOString() }
      ];

      const sampleAnalytics: AnalyticsEvent[] = Array.from({ length: 200 }).map((_, i) => ({
        id: `an-${i}`,
        business_id: '1',
        event_type: ['view', 'click', 'conversion'][i % 10 < 7 ? 0 : i % 10 < 9 ? 1 : 2] as any,
        timestamp: new Date().toISOString()
      }));

      setBusiness(sampleBiz);
      setBookings(sampleBookings);
      setReviews(sampleReviews);
      setPromotions(samplePromos);
      setAnalytics(sampleAnalytics);
      setLocations([
        { id: '1', name: 'Maun', type: 'town', parent_id: null }, 
        { id: '2', name: 'Kasane', type: 'town', parent_id: null }, 
        { id: '3', name: 'Gaborone', type: 'city', parent_id: null }
      ]);
      setListings([{ id: 'l1', business_id: '1', category: 'Luxury Safari' }, { id: 'l2', business_id: '1', category: 'Photography' }]);
      setAllBusinesses([sampleBiz, { ...sampleBiz, id: '2', business_name: 'Chobe Cruises', category: 'Car Rental' }]);
      setCurrentPackage({ id: 'standard', name: 'Standard', features: { photos_allowed: 15, videos_allowed: 3, promotions_allowed: 2, analytics: true } });
      setPackages([
        { id: 'standard', name: 'Standard', price: '0', features: { photos_allowed: 15, videos_allowed: 3, promotions_allowed: 2, analytics: false } },
        { id: 'professional', name: 'Professional', price: '1500', features: { photos_allowed: 50, videos_allowed: 10, promotions_allowed: 5, analytics: true, priority_listing: true } },
        { id: 'enterprise', name: 'Enterprise', price: '3500', features: { photos_allowed: -1, videos_allowed: -1, promotions_allowed: -1, analytics: true, priority_listing: true } }
      ]);
      setPaymentMethods([
        { id: '1', name: 'First National Bank (FNB)', account_number: '62849503928', instructions: 'Use business name as reference' },
        { id: '2', name: 'Absa Botswana', account_number: '0192837465', instructions: 'Proof of payment to payments@tourbots.bw' }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback or show login
        setLoading(false);
        return;
      }

      const [bizRes, allBizRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('owner_id', user.id).single(),
        supabase.from('businesses').select('*').eq('status', 'Approved')
      ]);

      if (bizRes.error) throw bizRes.error;
      const biz = bizRes.data;
      setBusiness(biz);
      setAllBusinesses(allBizRes.data || []);

      if (biz.status === 'Approved') {
        const [
          bookingsRes,
          reviewsRes,
          promotionsRes,
          analyticsRes,
          locationsRes,
          listingsRes,
          packageRes,
          allPackagesRes,
          paymentMethodsRes
        ] = await Promise.all([
          supabase.from('bookings').select('*').eq('business_id', biz.id),
          supabase.from('reviews').select('*').eq('business_id', biz.id),
          supabase.from('promotions').select('*').eq('business_id', biz.id),
          supabase.from('analytics').select('*').eq('business_id', biz.id),
          supabase.from('locations').select('*'),
          supabase.from('listings').select('*').eq('business_id', biz.id),
          supabase.from('packages').select('*').eq('id', biz.package_id).single(),
          supabase.from('packages').select('*'),
          supabase.from('payment_methods').select('*')
        ]);
 
        setBookings(bookingsRes.data || []);
        setReviews(reviewsRes.data || []);
        setPromotions(promotionsRes.data || []);
        setAnalytics(analyticsRes.data || []);
        setLocations(locationsRes.data || []);
        setListings(listingsRes.data || []);
        setCurrentPackage(packageRes.data || null);
        setPackages(allPackagesRes.data || []);
        setPaymentMethods(paymentMethodsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- Filtering & Derived Data ---

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const date = new Date(b.booking_date);
      const yearMatch = filters.year === 'All' || date.getFullYear().toString() === filters.year;
      const monthMatch = filters.month === 'All' || format(date, 'MMMM') === filters.month;
      const statusMatch = filters.status === 'All' || b.status === filters.status.toLowerCase();
      // Location and category filtering would require joins if done perfectly, 
      // but here we'll assume the basic structure.
      return yearMatch && monthMatch && statusMatch;
    });
  }, [bookings, filters]);

  const kpis = useMemo(() => {
    const totalRev = filteredBookings.reduce((acc, b) => acc + (b.status === 'completed' || b.status === 'confirmed' ? b.amount : 0), 0);
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    const activePromos = promotions.filter(p => p.active).length;
    
    // Simple conversion rate: bookings / clicks (from analytics)
    const clicks = analytics.filter(a => a.event_type === 'click').length || 1;
    const convRate = (filteredBookings.length / clicks) * 100;

    return {
      totalBookings: filteredBookings.length,
      revenue: totalRev,
      rating: avgRating.toFixed(1),
      promotions: activePromos,
      conversion: convRate.toFixed(1)
    };
  }, [filteredBookings, reviews, promotions, analytics]);

  // --- Chart Data Processors ---

  const bookingsByCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + bookings.filter(b => b.business_id === l.business_id).length; // Simplified
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [listings, bookings]);

  const statusData = useMemo(() => {
    const counts = {
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      completed: filteredBookings.filter(b => b.status === 'completed').length,
      cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredBookings]);

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      bookings: filteredBookings.filter(b => format(new Date(b.booking_date), 'MMM') === m).length,
      revenue: filteredBookings.filter(b => format(new Date(b.booking_date), 'MMM') === m).reduce((a, c) => a + c.amount, 0) / 1000 // In thousands for graph
    }));
  }, [filteredBookings]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

  // --- Render Functions ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Activity className="w-8 h-8 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Business Not Found</h2>
          <p className="text-slate-500 mt-2">We couldn't find a business associated with your account. Please register your branch first.</p>
        </div>
      </div>
    );
  }

  if (business.status === 'Pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-lg">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Dumela, {business.business_name}</h2>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold uppercase tracking-wider text-xs">
            <AlertCircle className="w-4 h-4" />
            Pending Approval
          </div>
          <p className="text-slate-500 mt-6 text-lg leading-relaxed">
            Your registration is currently under review by our admin team. 
            Once approved, your dashboard will be fully accessible.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <button className="text-indigo-600 font-semibold hover:underline">Contact Support</button>
          </div>
        </div>
      </div>
    );
  }

  if (business.status === 'Rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-lg">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Dumela, {business.business_name}</h2>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full font-semibold uppercase tracking-wider text-xs">
            <XCircle className="w-4 h-4" />
            Registration Rejected
          </div>
          <div className="mt-6 p-6 bg-slate-50 rounded-2xl text-left">
            <p className="text-sm font-semibold text-slate-400 uppercase mb-2">Admin Comments</p>
            <p className="text-slate-700 italic border-l-4 border-rose-500 pl-4">
              "{business.admin_comments || 'No specific reasons provided. Please review your documentation and try again.'}"
            </p>
          </div>
          <button className="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Update Registration
          </button>
        </div>
      </div>
    );
  }

  // --- Approved Dashboard Render ---

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Dumela, {business.business_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {currentPackage?.name || 'Standard'} Package
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Upgrade Package
            </button>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=business" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'analytics', label: 'Advanced Analytics', icon: Activity },
            { id: 'messages', label: 'Inbox', icon: MessageSquare },
            { id: 'promotions', label: 'Promotions', icon: Star },
            { id: 'reviews', label: 'Reviews', icon: ThumbsUp },
            { id: 'explore', label: 'Explore Partners', icon: Search },
            { id: 'profile', label: 'Business Profile', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div id="dashboard-content" className="space-y-8">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 text-slate-500 mr-2">
                <Filter className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
              </div>
              
              <select 
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.year}
                onChange={e => setFilters({...filters, year: e.target.value})}
              >
                <option>2026</option>
                <option>2025</option>
              </select>

              <select 
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.month}
                onChange={e => setFilters({...filters, month: e.target.value})}
              >
                <option>All</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <select 
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.location}
                onChange={e => setFilters({...filters, location: e.target.value})}
              >
                <option>All Locations</option>
                {locations.map(l => <option key={l.id}>{l.name}</option>)}
              </select>

              <select 
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <div className="flex p-1 bg-slate-50 rounded-xl">
                  {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range as TimeRange)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        timeRange === range ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => exportDashboardToPDF('dashboard-content', `TourBots_${business.business_name}_Analytics`)}
                  className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="Export to PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <KPIStoreCard title="Total Bookings" value={kpis.totalBookings} icon={Calendar} trend="+12.5%" />
              <KPIStoreCard title="Total Revenue" value={kpis.revenue.toLocaleString()} prefix="BWP " icon={TrendingUp} trend="+8.2%" />
              <KPIStoreCard title="Average Rating" value={kpis.rating} icon={Star} trend="+0.3" />
              <KPIStoreCard title="Active Promotions" value={kpis.promotions} icon={Star} trend="0" />
              <KPIStoreCard title="Conversion Rate" value={`${kpis.conversion}%`} icon={Users} trend="+2.1%" />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard title="Revenue & Bookings Trend">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ChartCard title="Bookings by Status">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Bookings by Category">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>

            {/* Bottom Section: Media Tracker & Exposure Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Media Tracker */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-6">Media Usage Tracker</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Photos</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        8 / {currentPackage?.features?.photos_allowed || 10}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(8 / (currentPackage?.features?.photos_allowed || 10)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Videos</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        2 / {currentPackage?.features?.videos_allowed || 2}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    {2 >= (currentPackage?.features?.videos_allowed || 2) && (
                      <p className="text-[10px] text-rose-500 mt-1 font-bold italic flex items-center gap-1 uppercase">
                        <AlertCircle className="w-2.5 h-2.5" /> Video limit reached. Upgrade to unlock more.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Exposure Score */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                <h3 className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Exposure Score</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black">78</span>
                  <span className="text-xl font-bold opacity-60">%</span>
                </div>
                <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium">Profile 90% complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-medium">Add 1 video to increase visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-medium">3 active promotions</span>
                  </div>
                </div>
                <button className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-all text-sm">
                  View Suggestions
                </button>
              </div>

              {/* Recent Activity Mini-Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { type: 'booking', msg: 'New booking from Lerato M.', time: '2 mins ago', icon: Calendar, color: 'text-indigo-500' },
                    { type: 'review', msg: '5-star review received!', time: '1 hour ago', icon: Star, color: 'text-amber-500' },
                    { type: 'system', msg: 'Promotion "Winter Special" started', time: '3 hours ago', icon: Activity, color: 'text-emerald-500' }
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={cn("mt-1", act.color)}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{act.msg}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                  View all bookings <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Duration</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-400">#{b.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-slate-800">{b.customer_name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {format(new Date(b.booking_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {b.duration}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm text-slate-800">BWP {b.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            b.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                            b.status === 'confirmed' ? "bg-indigo-100 text-indigo-700" :
                            b.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-indigo-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="h-[700px]">
             <MessagingPanel currentUser={null} receiverRole="Tourist" />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ChartCard title="User Engagement (Views vs Clicks)" className="col-span-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', views: 4000, clicks: 2400 },
                    { name: 'Tue', views: 3000, clicks: 1398 },
                    { name: 'Wed', views: 2000, clicks: 9800 },
                    { name: 'Thu', views: 2780, clicks: 3908 },
                    { name: 'Fri', views: 1890, clicks: 4800 },
                    { name: 'Sat', views: 2390, clicks: 3800 },
                    { name: 'Sun', views: 3490, clicks: 4300 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="clicks" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              
              <ChartCard title="Bookings by Location">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locations.map(l => ({ name: l.name, value: Math.floor(Math.random() * 50) + 10 }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-6">Engagement Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Views', value: '12.4k', trend: '+14%', color: 'text-indigo-600' },
                    { label: 'Total Clicks', value: '2.8k', trend: '+8%', color: 'text-emerald-600' },
                    { label: 'Conversions', value: '450', trend: '+12%', color: 'text-amber-600' },
                    { label: 'Bounce Rate', value: '42%', trend: '-2%', color: 'text-rose-600' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-xl font-bold", stat.color)}>{stat.value}</span>
                        <span className="text-[10px] font-bold text-slate-400">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Promotions</h3>
                <p className="text-slate-500 text-sm">Boost your visibility with special offers</p>
              </div>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Promotion
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  {!promo.active && <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center font-bold text-slate-400 text-sm uppercase tracking-widest">Inactive</div>}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{promo.title}</h4>
                  <p className="text-xs font-bold text-indigo-600 uppercase mb-4">{promo.type}</p>
                  
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Start Date</span>
                      <span className="text-slate-700">{format(new Date(promo.start_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Expiry Date</span>
                      <span className="text-slate-700">{format(new Date(promo.expiry_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-1/2"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">50% through duration</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-sm font-bold text-slate-400 uppercase mb-2">Overall Rating</p>
                  <h3 className="text-5xl font-black text-slate-900">{kpis.rating}</h3>
                  <div className="flex justify-center gap-1 my-3 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("w-5 h-5", i < Math.round(Number(kpis.rating)) ? "fill-current" : "text-slate-200")} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{reviews.length} total reviews</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Rating Filter</h4>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <button key={stars} className="flex items-center gap-3 w-full hover:bg-slate-50 p-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-bold">{stars}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${Math.random() * 80 + 10}%` }}></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                        <div>
                          <h4 className="font-bold text-slate-900">Verified Tourist</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(review.created_at), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-current" : "text-slate-200")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          {activeTab === 'explore' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Explore Botswana Partners</h2>
                  <p className="text-slate-500 font-medium">B2B Networking & Collaboration</p>
                </div>
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search businesses..." 
                    className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {allBusinesses.map(biz => (
                   <div key={biz.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                      <div className="aspect-[4/3] bg-slate-100 relative">
                        <img 
                          src={biz.profile_picture || `https://picsum.photos/seed/bizexplorer${biz.id}/800/600`} 
                          alt="Partner" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                        />
                        <div className="absolute top-6 right-6">
                           <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-indigo-600 tracking-widest shadow-sm">
                              {biz.category}
                           </span>
                        </div>
                      </div>
                      <div className="p-8">
                         <h4 className="text-xl font-black text-slate-900 mb-2 truncate">{biz.business_name}</h4>
                         <div className="flex items-center gap-2 text-slate-400 mb-6">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{biz.location_name || 'Botswana'}</span>
                         </div>
                         <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                            <button 
                              onClick={() => {
                                setActiveTab('messages');
                                // In real app, set recipient
                              }}
                              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                            >
                               Connect
                            </button>
                            <button 
                              onClick={() => setSelectedPartnerId(biz.id)}
                              className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all"
                            >
                               View Details
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 line-clamp-1">{business.business_name}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Status: {business.status}</p>
              </div>
              <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center gap-6 mb-8 group">
                   <div className="relative">
                      <div className="w-32 h-32 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden">
                         <img src={business.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${business.business_name}`} alt="Biz" className="w-full h-full object-cover" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 bg-white shadow-lg rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-50">
                         <Upload className="w-4 h-4" />
                      </button>
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900">Branding</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1">Upload your logo or branch image.</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-2">Business Name</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      defaultValue={business.business_name}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-2">Business Bio</label>
                    <textarea 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                      placeholder="Tell tourists about your amazing tours..."
                      defaultValue={business.bio}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">WhatsApp Contact</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      defaultValue={business.whatsapp}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Office Line</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      defaultValue={business.office_line}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    defaultValue={business.email}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Price Range (Manually Enter)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BWP 500 - 1500"
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    defaultValue={business.price_range}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Media Uploads</label>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    multiple 
                    onChange={(e) => {
                      if (e.target.files) {
                        // In a real app, you'd upload these to Supabase Storage
                        alert(`Selected ${e.target.files.length} files for upload.`);
                      }
                    }} 
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div 
                          key={i} 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <Plus className="w-6 h-6 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 mt-1">Upload {i === 3 ? 'Video' : 'Photo'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Describe your media</p>
                       <input 
                        type="text" 
                        placeholder="Short descriptive message for latest upload..."
                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">Reach more people</span>
                  </div>
                  <p className="text-xs text-indigo-700/70 leading-relaxed">
                    Complete your profile and add photos to increase your exposure score. Businesses with videos get 2x more clicks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Package Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upgrade Your Visibility</h2>
                    <p className="text-slate-500 font-medium">Reach more tourists and unlock advanced features</p>
                  </div>
                  <button onClick={() => setIsUpgradeModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><XCircle className="w-6 h-6" /></button>
                </div>                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2">
                       <Info className="w-6 h-6 text-emerald-500" />
                       Payment Options
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       {paymentMethods.map(method => (
                         <div key={method.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{method.name}</span>
                              <span className="text-[10px] font-bold text-slate-500">Fast Verification</span>
                            </div>
                            <p className="text-lg font-black font-mono tracking-wider">{method.account_number}</p>
                            {method.instructions && <p className="text-[10px] text-slate-400 mt-2 italic">{method.instructions}</p>}
                         </div>
                       ))}
                       {paymentMethods.length === 0 && (
                         <p className="text-xs text-slate-500 italic">Loading payment methods...</p>
                       )}
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                       <FileText className="w-5 h-5" />
                       Standard Step: Payment Confirmation
                    </h3>
                    <p className="text-sm text-indigo-700 mb-6">
                      Upload your proof of payment to authorize the package upgrade.
                    </p>
                    <input 
                       type="file" 
                       className="hidden" 
                       ref={paymentProofRef}
                       onChange={(e) => {
                         if (e.target.files?.[0]) {
                           alert('Payment proof attached successfully.');
                         }
                       }}
                    />
                    <button 
                       onClick={() => paymentProofRef.current?.click()}
                       className="w-full py-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center hover:bg-indigo-100 transition-all group"
                    >
                       <Upload className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                       <span className="text-xs font-black uppercase text-indigo-600 mt-2">Attach Receipt / Slip</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((p) => {
                    const features = p.features || {};
                    const isActive = currentPackage?.id === p.id;
                    return (
                    <div key={p.id} className={cn(
                      "p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex flex-col h-full",
                      isActive ? "border-emerald-600 bg-emerald-50/30" : "border-slate-100 hover:border-indigo-600"
                    )}>
                      <h4 className="text-xl font-black text-slate-900 mb-1">{p.name}</h4>
                      <p className="text-indigo-600 font-black text-2xl mb-6">P{p.price}/mo</p>
                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {features.photos_allowed === -1 ? 'Unlimited' : features.photos_allowed} Photos
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {features.videos_allowed === -1 ? 'Unlimited' : features.videos_allowed} Videos
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {features.promotions_allowed === -1 ? 'Unlimited' : features.promotions_allowed} Promotions
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Analytics {features.analytics ? 'Enabled' : 'Disabled'}
                        </li>
                        {features.priority_listing && (
                          <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Priority Listing
                          </li>
                        )}
                      </ul>
                      <button 
                        disabled={isActive}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                          isActive ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-emerald-600"
                        )}
                      >
                        {isActive ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                    );
                  })}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Selecting a new plan will send a request to our admin team. Once approved, your package features will be automatically updated without losing any existing data.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Business Partner Profile View Modal */}
      <AnimatePresence>
        {selectedPartnerId && (
          <BusinessProfileView 
            business={allBusinesses.find(b => b.id === selectedPartnerId)!}
            reviews={[]} // Businesses don't rate each other as per requirement
            promotions={[]} 
            onClose={() => setSelectedPartnerId(null)}
            onBook={(method) => {
              // Same clickable links logic in ProfileView will handle it
              console.log(`Booking partner via ${method}`);
            }}
            onWriteReview={() => {}} // Disabled for businesses
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Heart, 
  Filter, 
  Compass, 
  Clock, 
  ArrowRight, 
  User, 
  Settings, 
  LogOut,
  ShoppingBag,
  Ticket,
  ChevronDown,
  Navigation,
  MessageSquare,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Camera,
  Mail,
  Phone,
  Globe,
  Download,
  Send,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  Booking, 
  Review, 
  Promotion, 
  Profile,
  Business,
  BusinessCategory
} from '../types';
import { BUSINESS_CATEGORIES, COUNTRIES } from '../constants';
import MessagingPanel from './MessagingPanel';
import BusinessProfileView from './BusinessProfileView';
import { searchExternalBotswanaTravel, ExternalSearchResult } from '../lib/gemini';

// --- Sub-components ---

const ListingCard = ({ business, reviews, onMore }: { 
  business: Business; 
  reviews: Review[]; 
  onMore: (id: string) => void 
}) => {
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 4.5;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={business.profile_picture || `https://picsum.photos/seed/${business.id}/800/600`} 
          alt={business.business_name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
            {business.category}
          </span>
        </div>
        <button className="absolute top-4 right-4 p-2.5 bg-white/50 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-all shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-1 text-white text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {avgRating.toFixed(1)}
            <span className="opacity-60 ml-1">({reviews.length})</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
          <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
            {business.business_name}
          </h4>
        
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">{business.location_name}</span>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
          {business.mini_bio || 'Discover high-quality services and unforgettable experiences.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Starts From</p>
            <p className="text-lg font-black text-indigo-600">{business.price_range || 'BWP 1,500'}</p>
          </div>
          <button 
            onClick={() => onMore(business.id)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
          >
            View More <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Tourist Dashboard Component ---

interface TouristDashboardProps {
  profile: Profile | null;
  onAuthRequired: () => void;
}

export default function TouristDashboard({ profile, onAuthRequired }: TouristDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings' | 'messages' | 'profile'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [externalResults, setExternalResults] = useState<ExternalSearchResult[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  const submitFeedback = () => {
    if (!feedback.trim()) return;
    setIsSendingFeedback(true);
    setTimeout(() => {
      setIsSendingFeedback(false);
      setFeedback('');
      alert('Thank you for your feedback! We will use it to improve the app.');
    }, 1500);
  };

  useEffect(() => {
    fetchTouristData();
  }, []);

  async function fetchTouristData() {
    if (!supabase) {
      // Create comprehensive Mock Data for all categories
      const mockBusinesses: Business[] = BUSINESS_CATEGORIES.flatMap((cat, catIdx) => 
        Array.from({ length: 12 }).map((_, bIdx) => ({
          id: `biz-${catIdx}-${bIdx}`,
          business_name: `${cat} ${['Delta', 'Savuti', 'Chobe', 'Kalahari', 'Gabs'][bIdx % 5]}`,
          category: cat,
          status: 'Approved',
          mini_bio: `Professional ${cat.toLowerCase()} services in the heart of Botswana. Trusted by thousands of travelers.`,
          bio: `Welcome to our ${cat.toLowerCase()}! We have been operating in Botswana for over 10 years, providing top-tier services to both locals and international visitors. Our team is dedicated to your comfort and safety.`,
          price_range: `BWP ${(Math.floor(Math.random() * 5) + 5) * 200}`,
          location_name: ['Maun', 'Kasane', 'Gaborone', 'Francistown'][bIdx % 4],
          package_id: 'enterprise',
          email: 'contact@example.bw',
          owner_id: 'o-1',
          created_at: new Date().toISOString(),
          media: [
            { id: 'm1', type: 'image', url: `https://picsum.photos/seed/tour-${catIdx}-${bIdx}/1920/1080`, description: 'Beautiful view of our facility', created_at: new Date().toISOString() },
            { id: 'm2', type: 'video', url: '', description: 'Promotional video', created_at: new Date().toISOString() }
          ]
        }))
      );

      const mockReviews: Review[] = mockBusinesses.flatMap(b => 
        Array.from({ length: 3 }).map((_, i) => ({
          id: `rv-${b.id}-${i}`,
          business_id: b.id,
          customer_id: 'u-1',
          customer_name: ['Kabelo', 'Thabo', 'Sarah'][i],
          rating: [5, 4, 5][i],
          comment: 'Outstanding experience! The staff were incredible.',
          created_at: subDays(new Date(), i * 10).toISOString()
        }))
      );

      setBusinesses(mockBusinesses);
      setAllReviews(mockReviews);
      setPromotions([
        { id: 'p1', business_id: mockBusinesses[0].id, business_name: mockBusinesses[0].business_name, title: 'Summer Explorer', type: 'Discount', start_date: new Date().toISOString(), expiry_date: format(subDays(new Date(), -30), 'yyyy-MM-dd'), active: true, created_at: new Date().toISOString() }
      ]);
      
      if (profile) {
        setBookings([
          { id: 'bk1', business_id: mockBusinesses[0].id, business_name: mockBusinesses[0].business_name, listing_title: 'Adventure Pack', customer_id: profile.id, customer_name: profile.full_name, booking_date: format(subDays(new Date(), -5), 'yyyy-MM-dd'), duration: '2 Days', amount: 3500, status: 'confirmed', created_at: new Date().toISOString() },
          { id: 'bk2', business_id: mockBusinesses[1].id, business_name: mockBusinesses[1].business_name, listing_title: 'Standard Safari', customer_id: profile.id, customer_name: profile.full_name, booking_date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), duration: '1 Day', amount: 1500, status: 'completed', created_at: new Date().toISOString() }
        ]);
      }

      setLoading(false);
      return;
    }
  }

  const handleExternalSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingExternal(true);
    const results = await searchExternalBotswanaTravel(searchQuery);
    setExternalResults(results);
    setIsSearchingExternal(false);
  };

  const categorizedData = useMemo(() => {
    const groups: Record<BusinessCategory, { business: Business; reviews: Review[] }[]> = {} as any;
    
    BUSINESS_CATEGORIES.forEach(cat => {
      const filtered = businesses.filter(b => b.category === cat);
      const withReviews = filtered.map(b => ({
        business: b,
        reviews: allReviews.filter(r => r.business_id === b.id)
      }));

      // Sort by avg rating
      groups[cat] = withReviews.sort((a, b) => {
        const ratingA = a.reviews.length ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
        const ratingB = b.reviews.length ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
        return ratingB - ratingA;
      }).slice(0, 10); // Minimum 10 pick
    });

    return groups;
  }, [businesses, allReviews]);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const selectedBusinessReviews = allReviews.filter(r => r.business_id === selectedBusinessId);
  const selectedBusinessPromotions = promotions.filter(p => p.business_id === selectedBusinessId);

  const handleRestrictedAction = (tab?: any) => {
    if (!profile) {
      onAuthRequired();
      return;
    }
    if (tab) setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading Botswana Explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900">
      {/* Header / Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <Navigation className="w-6 h-6 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight scale-y-95">TourBots</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1 p-1 bg-slate-50 rounded-2xl">
              {[
                { id: 'explore', label: 'Explore', icon: Compass },
                { id: 'bookings', label: 'My Trips', icon: Ticket },
                { id: 'messages', label: 'Inbox', icon: MessageSquare },
                { id: 'profile', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleRestrictedAction(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.id === 'explore' && !profile && <Lock className="w-2.5 h-2.5 opacity-40" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!profile ? (
              <button 
                onClick={onAuthRequired}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Sign In / Register
              </button>
            ) : (
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 pl-2 pr-4 py-2 bg-slate-50 rounded-full cursor-pointer hover:bg-slate-100 transition-all border border-slate-100"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 overflow-hidden ring-2 ring-indigo-50">
                  <img src={profile.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} alt="Me" referrerPolicy="no-referrer" />
                </div>
                <span className="text-xs font-black hidden lg:block">{profile.full_name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'explore' && (
          <div className="space-y-16">
            {/* Hero / Search */}
            <div className="relative p-12 lg:p-24 bg-slate-900 rounded-[4rem] overflow-hidden">
               <div className="absolute inset-0 opacity-40">
                  <img src="https://picsum.photos/seed/kalahari/1920/1080" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
               
               <div className="relative z-10 max-w-2xl">
                 <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight mb-8">
                   Explore <br />
                   <span className="text-indigo-400">Botswana</span>
                 </h2>
                 
                 <div className="flex flex-col gap-4 p-3 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                   <div className="flex items-center gap-4 px-8 py-5 bg-white rounded-3xl">
                      <Search className="w-6 h-6 text-indigo-400" />
                      <input 
                        type="text" 
                        placeholder="Search places locally or globally..." 
                        className="bg-transparent border-none focus:ring-0 outline-none w-full text-lg font-bold text-slate-800"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleExternalSearch()}
                      />
                      <button 
                        onClick={handleExternalSearch}
                        className={cn(
                          "bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all",
                          isSearchingExternal ? "opacity-50 cursor-wait" : ""
                        )}
                      >
                        {isSearchingExternal ? 'Searching...' : 'Deep Search'}
                      </button>
                   </div>
                 </div>
                 <p className="mt-6 text-white/50 text-xs font-bold uppercase tracking-widest">Searching local registry & external sources across Botswana</p>
               </div>
            </div>

            {/* External Results if any */}
            <AnimatePresence>
              {externalResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                     <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-indigo-600" /> Global Discoveries
                     </h3>
                     <button onClick={() => setExternalResults([])} className="text-xs font-black text-slate-400 hover:text-slate-600">Clear</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {externalResults.map((res, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm hover:border-indigo-200 transition-all flex flex-col group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                             Off-Platform Discovery
                          </span>
                          <Globe className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2 leading-tight">{res.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                          {res.description}
                        </p>
                        
                        <div className="mt-auto space-y-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Found at</p>
                            <p className="text-[10px] font-medium text-slate-600 truncate underline decoration-slate-200">
                              {res.url}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{res.source}</span>
                            <a 
                              href={res.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                            >
                              Visit Site <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categorized Displays */}
            <div className="space-y-24">
              {BUSINESS_CATEGORIES.map(category => (
                <div key={category} className="space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                          <Compass className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{category}s</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Rated in Botswana</p>
                        </div>
                     </div>
                     <button className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                       <ArrowRight className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categorizedData[category].map(({ business, reviews }) => (
                      <ListingCard 
                        key={business.id} 
                        business={business} 
                        reviews={reviews} 
                        onMore={setSelectedBusinessId} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="max-w-4xl mx-auto space-y-8">
             <div className="flex items-baseline justify-between mb-8">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Booking History</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{bookings.length} Total Trip Records</p>
             </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-800">No trips recorded</h3>
                <p className="text-slate-400 font-medium">Your upcoming and past safari adventures will appear here.</p>
                <button onClick={() => setActiveTab('explore')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest">Start Exploring</button>
              </div>
            ) : (
              <div className="space-y-8">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 hover:shadow-xl transition-all">
                    <div className="w-full md:w-56 h-40 bg-slate-100 rounded-[2.5rem] overflow-hidden shrink-0">
                      <img src={`https://picsum.photos/seed/bk-${booking.id}/600/400`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                          <h4 className="text-2xl font-black text-slate-900 mb-1">{booking.listing_title}</h4>
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">{booking.business_name}</span>
                        </div>
                        <div className={cn(
                          "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                          booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          booking.status === 'completed' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                          "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-slate-50">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Trip Date</p>
                          <p className="text-sm font-bold text-slate-800">{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Duration</p>
                          <p className="text-sm font-bold text-slate-800">{booking.duration}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Ref ID</p>
                          <p className="text-sm font-bold text-slate-800">#{booking.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Paid</p>
                          <p className="text-sm font-bold text-emerald-600">BWP {booking.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-4">
                        <button className="flex-1 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Download E-Ticket</button>
                        <button className="flex-1 bg-slate-50 text-slate-600 border border-slate-100 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Support</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-5xl mx-auto space-y-8 h-[700px] flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Messaging</h2>
             </div>
             <div className="flex-1">
                <MessagingPanel currentUser={profile} receiverRole="Business" />
             </div>
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
             <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Security & Profile</h2>
                <button onClick={() => {}} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 flex flex-col items-center text-center space-y-6">
                   <div className="relative group">
                     <div className="w-48 h-48 rounded-[3rem] bg-indigo-500 overflow-hidden ring-[12px] ring-indigo-50">
                        <img src={profile.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} alt="P" className="w-full h-full object-cover" />
                     </div>
                     <button className="absolute -bottom-4 -right-4 p-4 bg-white shadow-xl rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100">
                        <Camera className="w-6 h-6" />
                     </button>
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">{profile.full_name}</h3>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{profile.email}</p>
                   </div>
                </div>

                <div className="lg:col-span-2 space-y-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Display Name</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl">
                           <User className="w-4 h-4 text-slate-300" />
                           <input type="text" className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold w-full" defaultValue={profile.full_name} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Contact Phone</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl">
                           <Phone className="w-4 h-4 text-slate-300" />
                           <input type="text" className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold w-full" defaultValue={profile.phone || '+267 7X XXX XXX'} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Email Address</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl">
                           <Mail className="w-4 h-4 text-slate-300" />
                           <input type="email" className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold w-full" defaultValue={profile.email} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Origin Country</label>
                        <select className="w-full bg-slate-50 border-none p-5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600">
                          {COUNTRIES.map(c => <option key={c} value={c} selected={c === profile.country}>{c}</option>)}
                        </select>
                     </div>
                   </div>

                   <div className="pt-8 border-t border-slate-50">
                      <h4 className="font-black text-slate-900 mb-6">Security Settings</h4>
                      <button 
                        onClick={() => alert('Password reset link sent to your email!')}
                        className="w-full bg-slate-900 text-white rounded-2xl p-5 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200"
                      >
                         Reset Account Password
                      </button>
                   </div>

                   <button className="w-full bg-indigo-600 text-white rounded-2xl p-5 text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 mt-4">
                      Save All Profile Changes
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 border border-white/10 backdrop-blur-xl"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
               <Navigation className="w-6 h-6" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-black text-sm uppercase tracking-widest">Install TourBots</h4>
              <p className="text-xs text-white/50 font-medium mt-1">Get the best experience by adding TourBots to your home screen.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Maybe Later
              </button>
              <button 
                onClick={handleInstall}
                className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Install Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Website Footer & Feedback Section */}
      <footer className="bg-white border-t border-slate-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Navigation className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tight leading-none pt-1">TourBots Botswana</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed max-w-md">
              Connecting travelers with the authentic heart of Botswana. Discover premium lodges, safaris, and services through our curated registry.
            </p>
            <div className="flex items-center gap-6">
               <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Explorer</a>
               <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Join as Business</a>
               <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Contact Support</a>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">© 2026 TourBots Botswana. All Rights Reserved.</p>
          </div>

          <div className="bg-slate-50 rounded-[3rem] p-10 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Suggest Improvements</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6">Your feedback helps us build a better travel experience for everyone in Botswana.</p>
            <div className="relative">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts or ideas with us..."
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-6 text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all min-h-[120px] outline-none"
              />
              <button 
                onClick={submitFeedback}
                disabled={isSendingFeedback || !feedback.trim()}
                className={cn(
                  "absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg",
                  (isSendingFeedback || !feedback.trim()) && "opacity-50 cursor-not-allowed bg-slate-400 shadow-none"
                )}
              >
                {isSendingFeedback ? 'Sending...' : 'Submit Feedback'}
                {!isSendingFeedback && <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedBusinessId && selectedBusiness && (
          <BusinessProfileView 
            business={selectedBusiness}
            reviews={selectedBusinessReviews}
            promotions={selectedBusinessPromotions}
            onClose={() => setSelectedBusinessId(null)}
            onBook={(method) => {
              console.log(`Booking via ${method}`);
              handleRestrictedAction();
            }}
            onWriteReview={() => handleRestrictedAction()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Calendar,
  Package,
  Heart,
  ExternalLink,
  ShieldCheck,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Business, Review, BusinessMedia, Promotion } from '../types';
import { cn } from '../lib/utils';

interface BusinessProfileViewProps {
  business: Business;
  reviews: Review[];
  promotions: Promotion[];
  onClose: () => void;
  onBook: (method: 'email' | 'whatsapp' | 'call') => void;
  onWriteReview: () => void;
}

export default function BusinessProfileView({ 
  business, 
  reviews, 
  promotions,
  onClose, 
  onBook,
  onWriteReview 
}: BusinessProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'media' | 'reviews'>('about');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const images = business.media.filter(m => m.type === 'image');
  const videos = business.media.filter(m => m.type === 'video');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
    >
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 rounded-full transition-all border border-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Media Side / Hero */}
        <div className="w-full md:w-1/2 bg-slate-900 relative shrink-0">
          <AnimatePresence mode="wait">
            {business.media.length > 0 ? (
              <motion.div 
                key={currentMediaIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {business.media[currentMediaIndex].type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                     <Video className="w-20 h-20 text-white/20 absolute" />
                     {/* In a real app, render <video src={url} controls /> */}
                     <div className="text-white text-center z-10 p-10">
                        <p className="text-xl font-black mb-4">{business.media[currentMediaIndex].description}</p>
                        <p className="text-sm opacity-60">Video demonstration would play here.</p>
                     </div>
                  </div>
                ) : (
                  <img 
                    src={business.media[currentMediaIndex].url} 
                    className="w-full h-full object-cover" 
                    alt={business.media[currentMediaIndex].description}
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                 <Store className="w-20 h-20 text-slate-700" />
              </div>
            )}
          </AnimatePresence>

          {/* Media Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
            <h2 className="text-4xl font-black mb-2 tracking-tight">{business.business_name}</h2>
            <div className="flex items-center gap-4 text-sm font-bold text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-400" /> {business.location_name}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-current" /> {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'New'}
              </span>
              <span className="bg-indigo-600 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">{business.price_range || '$$$'}</span>
            </div>
          </div>

          {/* Media Navigation */}
          {business.media.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-6 pointer-events-none">
               <button 
                onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + business.media.length) % business.media.length)}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/40 transition-all text-white"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               <button 
                onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % business.media.length)}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full pointer-events-auto hover:bg-white/40 transition-all text-white"
               >
                 <ChevronRight className="w-6 h-6" />
               </button>
            </div>
          )}
        </div>

        {/* Content Side */}
        <div className="flex-1 bg-white overflow-y-auto custom-scrollbar flex flex-col">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 px-10 pt-10 border-b border-slate-100">
            {[
              { id: 'about', label: 'Company Profile' },
              { id: 'media', label: `Gallery (${business.media.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-10 flex-1">
            {activeTab === 'about' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                {/* Promotions if any */}
                {promotions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Active Promotions</h4>
                    <div className="space-y-3">
                      {promotions.map(promo => (
                        <div key={promo.id} className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center justify-between gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <h5 className="font-black text-indigo-900">{promo.title}</h5>
                                <p className="text-xs font-medium text-indigo-600/70">{promo.description || 'Special offer for a limited time.'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-indigo-400 uppercase">Expires</p>
                              <p className="text-xs font-bold text-indigo-900">{format(new Date(promo.expiry_date), 'MMM d, yyyy')}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Official Bio</h4>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 font-medium leading-relaxed">{business.bio || 'This business has not provided a detailed biography yet.'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Operating in</p>
                      <p className="text-sm font-bold text-slate-900">{business.location_name}, {business.area_name}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <ShieldCheck className="w-4 h-4" /> BTO Approved
                      </div>
                   </div>
                </div>

                 <div className="pt-10 border-t border-slate-50 space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Connect Directly</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <a 
                        href={`https://wa.me/${business.whatsapp?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 transition-all group"
                      >
                         <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                           <MessageCircle className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase text-slate-400">WhatsApp</p>
                           <p className="text-sm font-black text-slate-900">{business.whatsapp || '+267 71 000 000'}</p>
                         </div>
                      </a>
                      <a 
                        href={`tel:${business.office_line?.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 transition-all group"
                      >
                         <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           <Phone className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase text-slate-400">Office Line</p>
                           <p className="text-sm font-black text-slate-900">{business.office_line || '+267 31 000 00'}</p>
                         </div>
                      </a>
                      <a 
                        href={`mailto:${business.email}`}
                        className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 transition-all group md:col-span-2"
                      >
                         <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                           <Mail className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase text-slate-400">Official Email</p>
                           <p className="text-sm font-black text-slate-900">{business.email}</p>
                         </div>
                      </a>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quick Enquiry</h4>
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Live Chat Ready</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
                       <input 
                        type="text" 
                        placeholder="Ask anything about our services..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-2"
                       />
                       <button className="bg-slate-900 text-white px-6 py-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                         Send Message <ArrowRight className="w-3 h-3" />
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
                 {business.media.map((m, idx) => (
                   <button 
                    key={m.id}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={cn(
                      "group relative aspect-square rounded-2xl overflow-hidden transition-all",
                      currentMediaIndex === idx ? "ring-4 ring-indigo-600 ring-offset-2" : "opacity-70 hover:opacity-100"
                    )}
                   >
                     <img src={m.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     {m.type === 'video' && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="p-2 bg-white rounded-full text-black">
                           <Video className="w-4 h-4" />
                         </div>
                       </div>
                     )}
                   </button>
                 ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-lg font-black text-slate-900">What Travelers Say</h4>
                   {onWriteReview && (
                     <button 
                      onClick={onWriteReview}
                      className="text-xs font-black uppercase text-indigo-600 hover:underline"
                     >
                       Write Review
                     </button>
                   )}
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                       <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <p className="text-slate-500 font-bold">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                              <img src={review.customer_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customer_name}`} alt="C" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                               <h5 className="text-sm font-black text-slate-900">{review.customer_name}</h5>
                               <p className="text-[10px] font-bold text-slate-400 capitalize">{format(new Date(review.created_at), 'MMMM yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "text-amber-400 fill-current" : "text-slate-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium italic">"{review.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-10 bg-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
             <div className="hidden lg:block text-white/60">
                <p className="text-[10px] font-black uppercase tracking-widest">Connect Directly</p>
                <p className="text-xs font-medium">Safe & Encrypted Communication</p>
             </div>
             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
               <a 
                href={`tel:${business.office_line?.replace(/[^0-9+]/g, '')}`}
                className="flex-1 md:flex-none p-4 bg-white rounded-2xl text-slate-900 hover:bg-slate-100 transition-all group flex items-center justify-center border border-slate-200"
               >
                 <Phone className="w-5 h-5" />
               </a>
               <a 
                 href={`https://wa.me/${business.whatsapp?.replace(/[^0-9]/g, '')}`}
                 target="_blank"
                 rel="noreferrer"
                 className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20"
               >
                 <MessageCircle className="w-4 h-4" /> WhatsApp
               </a>
               <a 
                 href={`mailto:${business.email}`}
                 className="flex-1 md:flex-none px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
               >
                 <Mail className="w-4 h-4" /> Email Enquire
               </a>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Store(props: any) {
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
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Shield, Camera, Upload, CheckCircle, ArrowRight, ArrowLeft, Lock, Navigation, X, Globe, Zap, Image as ImageIcon, Video, Star, BarChart3, Info, ChevronDown, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { BUSINESS_CATEGORIES, COUNTRIES } from '../constants';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { seedLocations } from '../lib/locationData';
import { DEFAULT_PACKAGES, DEFAULT_PAYMENT_METHODS } from '../lib/onboardingDefaults';

interface OnboardingFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialRole?: UserRole;
}

export default function OnboardingForm({ onComplete, onCancel, initialRole }: OnboardingFormProps) {
  const [role, setRole] = useState<UserRole>(initialRole || 'Tourist');
  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [formData, setFormData] = useState<any>({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    office_line: '',
    password: '',
    country: 'Botswana',
    // Business specific
    business_name: '',
    category: 'Lodge',
    district: '',
    district_id: '',
    settlement: '',
    settlement_id: '',
    region: '',
    region_id: '',
    location: '',
    location_id: '',
    package_id: 'standard',
    payment_proof: null,
    bto_ops: null,
    // Fallback location
    manual_address: '',
    latitude: '',
    longitude: '',
    verified_location: true
  });

  const [districts, setDistricts] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>(DEFAULT_PACKAGES);
  const [paymentMethods, setPaymentMethods] = useState<any[]>(DEFAULT_PAYMENT_METHODS);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Fetch initial data
  const fetchInitialData = async () => {
    if (!supabase) return;
    
    // Districts
    const { data: distData } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'district')
      .is('parent_id', null)
      .order('name');
    if (distData) setDistricts(distData);

    // Packages
    const { data: pkgData } = await supabase
      .from('packages')
      .select('*');
    if (pkgData) setPackages(pkgData);

    // Payment Methods
    const { data: payData } = await supabase
      .from('payment_methods')
      .select('*');
    if (payData) setPaymentMethods(payData);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    const result = await seedLocations();
    if (result.success) {
      await fetchInitialData();
    } else {
      alert(`Seeding failed: ${result.error}`);
    }
    setSeeding(false);
  };

  // Fetch dependent settlements (Town/Village)
  useEffect(() => {
    if (!supabase || !formData.district_id) {
      setSettlements([]);
      return;
    }
    
    async function fetchSettlements() {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.district_id)
        .order('name');
      if (data) setSettlements(data);
    }
    fetchSettlements();
  }, [formData.district_id]);

  // Fetch dependent regions (Area/Region)
  useEffect(() => {
    if (!supabase || !formData.settlement_id) {
      setRegions([]);
      return;
    }
    
    async function fetchRegions() {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.settlement_id)
        .order('name');
      if (data) setRegions(data);
    }
    fetchRegions();
  }, [formData.settlement_id]);

  // Fetch dependent locations (Specific Location)
  useEffect(() => {
    if (!supabase || !formData.region_id) {
      setLocations([]);
      return;
    }
    
    async function fetchLocations() {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.region_id)
        .order('name');
      if (data) setLocations(data);
    }
    fetchLocations();
  }, [formData.region_id]);

  // Validate location ID against fetched list to ensure synchronization
  useEffect(() => {
    if (formData.location_id && locations.length > 0) {
      const isValid = locations.some(l => l.id === formData.location_id);
      if (!isValid && formData.verified_location) {
        setFormData((prev: any) => ({ ...prev, location: '', location_id: '' }));
      }
    }
  }, [locations, formData.location_id, formData.verified_location]);

  const isStepValid = () => {
    if (role === 'Business') {
      if (step === 1) {
        return formData.business_name && formData.email && formData.whatsapp && formData.office_line && formData.category;
      }
      if (step === 2) {
        if (formData.verified_location) {
          return formData.district && formData.settlement && formData.region && formData.location;
        } else {
          return formData.manual_address && formData.latitude && formData.longitude;
        }
      }
      if (step === 3) return formData.package_id;
      if (step === 4) return true; // Proofs are often optional in demo but let's say true for now
      if (step === 5) return formData.password && formData.password.length >= 6;
    } else {
      if (step === 1) return formData.full_name && formData.email && formData.phone;
      if (step === 2) return formData.password && formData.password.length >= 6;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...formData, role });
  };

  const getBusinessSteps = () => [
    { label: 'Business Basics' },
    { label: 'Location' },
    { label: 'Package Plan' },
    { label: 'Upload Proofs' },
    { label: 'Security' }
  ];

  const getTouristSteps = () => [
    { label: 'Identity' },
    { label: 'Security' }
  ];

  const currentSteps = role === 'Business' ? getBusinessSteps() : getTouristSteps();
  const totalSteps = currentSteps.length;
  // Account for role selection step if it exists
  const displayStep = initialRole ? step : step; 
  const displayTotal = initialRole ? totalSteps : totalSteps + 1;

  return (
    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div className="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col">
           <div className="mb-10">
             <div className="flex items-center gap-2 mb-4">
                <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black">TB</span>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Join TourBots</span>
             </div>
             <h2 className="text-3xl font-black leading-tight">Create your {role} account</h2>
           </div>

           <div className="space-y-6 flex-1">
              {!initialRole && (
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all",
                    step === 0 ? "bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-emerald-500 border-emerald-500 text-white"
                  )}>
                    {step > 0 ? <CheckCircle className="w-4 h-4" /> : 0}
                  </div>
                  <span className={cn("text-xs font-black uppercase tracking-widest", step === 0 ? "text-white" : "text-slate-500")}>Role Access</span>
                </div>
              )}
              {currentSteps.map((s, idx) => {
                const stepNum = initialRole ? idx + 1 : idx + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all",
                      isActive ? "bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-800 text-slate-600"
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-white" : "text-slate-500")}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
           </div>

           <div className="mt-10 pt-10 border-t border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tourism Hub Botswana</p>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-14 bg-white relative">
          <button 
            type="button"
            onClick={onCancel}
            className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <form onSubmit={handleSubmit} className="h-full flex flex-col max-w-lg">
            {step === 0 && !initialRole && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Who are you?</h3>
                  <p className="text-slate-500 font-medium">Select the account type that best fits your needs.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() => { setRole('Tourist'); handleNext(); }}
                    className="p-8 rounded-[2.5rem] border-2 border-slate-100 text-left transition-all hover:border-indigo-600 group flex items-center gap-8 bg-slate-50/50"
                  >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight">Tourist User</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">Adventure, bookings & experiences</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('Business'); handleNext(); }}
                    className="p-8 rounded-[2.5rem] border-2 border-slate-100 text-left transition-all hover:border-emerald-600 group flex items-center gap-8 bg-slate-50/50"
                  >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-all text-slate-400">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight">Business Partner</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">Listing, growth & networking</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Tourist Steps */}
            {role === 'Tourist' && step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Your Identity</h3>
                  <p className="text-slate-500 font-medium">Let's get the basic info to personalize your trip.</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                    <input 
                      required
                      placeholder="Kabelo Modise"
                      className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-indigo-600 transition-all"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                      <input 
                        required
                        type="email"
                        placeholder="kabelo@mail.com"
                        className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-indigo-600 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone</label>
                      <input 
                        required
                        placeholder="+267 7XXXXXX"
                        className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-indigo-600 transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Country</label>
                    <select 
                      className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-indigo-600 appearance-none"
                      value={formData.country}
                      onChange={e => setFormData({...formData, country: e.target.value})}
                    >
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Business Steps */}
            {role === 'Business' && step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Business Basics</h3>
                  <p className="text-slate-500 font-medium">Register your company details to start Listing.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Business Name</label>
                    <input 
                      required
                      placeholder="Botswana Safari Co."
                      className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                      value={formData.business_name}
                      onChange={e => setFormData({...formData, business_name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                      <input 
                        required
                        type="email"
                        placeholder="contact@biz.bw"
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp Line</label>
                      <input 
                        required
                        placeholder="+267 71XXXXX"
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Office Line</label>
                      <input 
                        required
                        placeholder="+267 68XXXXX"
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                        value={formData.office_line}
                        onChange={e => setFormData({...formData, office_line: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                      <select 
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {BUSINESS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'Business' && step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 overflow-y-auto max-h-[60vh] pr-2">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Location Details</h3>
                  <p className="text-slate-500 font-medium">Help travelers find you by pinpointing your HQ.</p>
                </div>
                
                <div className="space-y-6">
                  {districts.length === 0 && !seeding && (
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100/50 flex flex-col gap-5 text-center mb-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <MapPin className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-emerald-900">System Initialization</h4>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                          Click below to populate the Botswana hierarchical location database.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleSeed}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        Seed Location Database
                      </button>
                    </div>
                  )}

                  {seeding && (
                    <div className="p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-6 text-center mb-4">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <Activity className="w-8 h-8 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-slate-800">Processing Geodata</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                          Structuring 4,000+ Botswana locations...
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">District</label>
                      <div className="relative">
                        <select 
                          required
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 pr-12 text-sm font-black focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
                          value={formData.district_id}
                          onChange={e => {
                            const id = e.target.value;
                            const name = districts.find(d => d.id === id)?.name || '';
                            setFormData({
                              ...formData, 
                              district: name, 
                              district_id: id,
                              settlement: '', 
                              settlement_id: '',
                              region: '', 
                              region_id: '',
                              location: '', 
                              location_id: '',
                              verified_location: true
                            });
                          }}
                        >
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Town / Village</label>
                      <div className="relative">
                        <select 
                          required={formData.verified_location}
                          disabled={!formData.district_id}
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 pr-12 text-sm font-black focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer disabled:opacity-50"
                          value={formData.settlement_id}
                          onChange={e => {
                            const id = e.target.value;
                            const name = settlements.find(s => s.id === id)?.name || '';
                            setFormData({
                              ...formData, 
                              settlement: name, 
                              settlement_id: id,
                              region: '', 
                              region_id: '',
                              location: '', 
                              location_id: ''
                            });
                          }}
                        >
                          <option value="">Select Town / Village</option>
                          {settlements.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ward / Suburb / Area</label>
                      <div className="relative">
                        <select 
                          required={formData.verified_location && settlements.length > 0}
                          disabled={!formData.settlement_id}
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 pr-12 text-sm font-black focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer disabled:opacity-50"
                          value={formData.region_id}
                          onChange={e => {
                            const id = e.target.value;
                            const name = regions.find(r => r.id === id)?.name || '';
                            setFormData({
                              ...formData, 
                              region: name, 
                              region_id: id,
                              location: '', 
                              location_id: ''
                            });
                          }}
                        >
                          <option value="">Select Ward / Suburb / Area</option>
                          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Specific Location</label>
                      <div className="relative">
                        <select 
                          required={formData.verified_location && regions.length > 0}
                          disabled={!formData.region_id}
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 pr-12 text-sm font-black focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer disabled:opacity-50"
                          value={formData.location_id}
                          onChange={e => {
                            const id = e.target.value;
                            const name = locations.find(l => l.id === id)?.name || '';
                            setFormData({
                              ...formData, 
                              location: name,
                              location_id: id
                            });
                          }}
                        >
                          <option value="">Select Specific Location</option>
                          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Fallback Section */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                        checked={!formData.verified_location}
                        onChange={e => {
                           const checked = e.target.checked;
                           setFormData({
                             ...formData, 
                             verified_location: !checked,
                             location_id: checked ? '' : formData.location_id,
                             location: checked ? '' : formData.location
                           });
                        }}
                      />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">My location is not listed (Manual Input)</span>
                    </label>

                    {!formData.verified_location && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Manual Address</label>
                          <input 
                            required
                            placeholder="Plot 1234, Maun..."
                            className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                            value={formData.manual_address}
                            onChange={e => setFormData({...formData, manual_address: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Latitude</label>
                            <input 
                              placeholder="-19.98"
                              className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                              value={formData.latitude}
                              onChange={e => setFormData({...formData, latitude: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Longitude</label>
                            <input 
                              placeholder="23.42"
                              className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-black focus:ring-2 focus:ring-emerald-600 transition-all"
                              value={formData.longitude}
                              onChange={e => setFormData({...formData, longitude: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {role === 'Business' && step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 overflow-y-auto max-h-[60vh] pr-2">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Select Plan</h3>
                  <p className="text-slate-500 font-medium">Choose a package that fits your growth goals.</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {packages.map(plan => {
                    const features = plan.features || {};
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setFormData({...formData, package_id: plan.id})}
                        className={cn(
                          "p-8 rounded-[2.5rem] border-2 text-left transition-all relative flex flex-col gap-6",
                          formData.package_id === plan.id 
                            ? "border-emerald-600 bg-emerald-50/50 shadow-xl shadow-emerald-100/50" 
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                              formData.package_id === plan.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                              {plan.id === 'enterprise' ? <Zap className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-xl tracking-tight">{plan.name}</h4>
                              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mt-0.5">
                                {plan.price === 0 || !plan.price ? 'Free' : `P${plan.price}/month`}
                              </p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                            formData.package_id === plan.id ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-200"
                          )}>
                            {formData.package_id === plan.id && <CheckCircle className="w-5 h-5" />}
                          </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                              <ImageIcon className="w-4 h-4 text-emerald-500" />
                              <span>{features.photos_allowed === -1 ? 'Unlimited' : features.photos_allowed} photos allowed</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                              <Video className="w-4 h-4 text-emerald-500" />
                              <span>{features.videos_allowed === -1 ? 'Unlimited' : features.videos_allowed} videos allowed</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                              <Zap className="w-4 h-4 text-emerald-500" />
                              <span>{features.promotions_allowed === -1 ? 'Unlimited' : (features.promotions_allowed || 0)} promotions allowed</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                              <BarChart3 className="w-4 h-4 text-emerald-500" />
                              <span>Analytics availability: {features.analytics ? 'Yes' : 'No'}</span>
                           </div>
                           {features.priority_listing && (
                             <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <Star className="w-4 h-4 text-emerald-500" />
                                <span>Priority listing visibility</span>
                             </div>
                           )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {role === 'Business' && step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 overflow-y-auto max-h-[60vh] pr-2">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Payment & Uploads</h3>
                  <p className="text-slate-500 font-medium">Finalize your account by providing verification documents and proof of payment.</p>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-xl font-black tracking-tight">Payment Details</h4>
                   </div>
                   
                   <div className="space-y-6">
                      {paymentMethods.map((method, idx) => (
                        <div key={method.id} className="group">
                           <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">{method.name}</p>
                             {idx === 0 && <span className="bg-emerald-600/20 text-emerald-500 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Recommended</span>}
                           </div>
                           <div className="bg-white/5 rounded-2xl p-5 border border-white/10 group-hover:border-emerald-500/30 transition-all">
                              <p className="text-sm font-black text-slate-300">Account / Number:</p>
                              <p className="text-xl font-black text-white mt-1 font-mono tracking-wider">{method.account_number}</p>
                              {method.instructions && <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed italic">{method.instructions}</p>}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="group relative">
                      <input 
                        type="file" 
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 group-hover:border-emerald-500 group-hover:bg-emerald-50/50 transition-all">
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Proof of Payment</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">Upload Receipt or Transfer Note</p>
                        </div>
                      </div>
                   </div>
                   <div className="group relative">
                      <input 
                        type="file" 
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 group-hover:border-emerald-500 group-hover:bg-emerald-50/50 transition-all">
                        <Shield className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">BTO Operations License</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">Valid Company Operations License</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {((role === 'Tourist' && step === 2) || (role === 'Business' && step === 5)) && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Security</h3>
                  <p className="text-slate-500 font-medium">Protect your {role} account with a strong password.</p>
                </div>
                <div className="space-y-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          required
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 pl-14 text-sm font-black focus:ring-2 focus:ring-indigo-600 transition-all"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                   </div>
                   <div className="p-8 bg-emerald-50 rounded-[2.5rem]">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-black text-emerald-900 leading-tight">Ready for Approval</p>
                          <p className="text-xs text-emerald-700/60 font-medium mt-1">Once submitted, our team will review your {role === 'Business' ? 'business' : 'account'} within 24 hours.</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-14 flex items-center gap-4">
              {step > 0 && (
                <button 
                  type="button"
                  onClick={handleBack}
                  className="w-14 h-14 border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:border-slate-300 hover:text-slate-600 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
                        <div className="flex-1">
                          {(step < totalSteps) ? (
                            <button 
                              type="button"
                              onClick={handleNext}
                              disabled={!isStepValid()}
                              className={cn(
                                "w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all",
                                !isStepValid() ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" :
                                role === 'Business' ? "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
                              )}
                            >
                              Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              type="submit"
                              disabled={!isStepValid()}
                              className={cn(
                                "w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3",
                                !isStepValid() ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                              )}
                            >
                              Complete Registration <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

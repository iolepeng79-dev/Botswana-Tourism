import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Shield, Camera, Upload, CheckCircle, ArrowRight, ArrowLeft, Lock, Navigation, X, Globe, Zap, Image as ImageIcon, Video, Star, BarChart3, Info, ChevronDown, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { BUSINESS_CATEGORIES, COUNTRIES } from '../constants';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { DEFAULT_PACKAGES, DEFAULT_PAYMENT_METHODS } from '../lib/onboardingDefaults';

import { seedLocations } from '../lib/locationData';

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
  
  // Dynamic loading states for locations
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch initial data
  const fetchInitialData = async () => {
    if (!supabase) return;
    
    setLoadingDistricts(true);
    // Districts
    let { data: distData } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'district')
      .order('name');

    // Auto-seed if empty (as per "Populate ALL dropdowns" requirement)
    if (!distData || distData.length === 0) {
      console.log("Seeding initial locations...");
      await seedLocations();
      const { data: refreshedDistData } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'district')
        .order('name');
      distData = refreshedDistData;
    }

    if (distData) setDistricts(distData || []);
    setLoadingDistricts(false);

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

  // Fetch dependent settlements (Town/Village)
  useEffect(() => {
    if (!supabase || !formData.district_id) {
      setSettlements([]);
      return;
    }
    
    async function fetchSettlements() {
      setLoadingSettlements(true);
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.district_id)
        .order('name');
      if (data) setSettlements(data);
      setLoadingSettlements(false);
    }
    fetchSettlements();
  }, [formData.district_id]);

  // Fetch dependent regions (Area/Region/Ward/Kgotla)
  useEffect(() => {
    if (!supabase || !formData.settlement_id) {
      setRegions([]);
      return;
    }
    
    async function fetchRegions() {
      setLoadingRegions(true);
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.settlement_id)
        .order('name');
      if (data) setRegions(data);
      setLoadingRegions(false);
    }
    fetchRegions();
  }, [formData.settlement_id]);

  // Fetch dependent locations (Specific Location/Settlement)
  useEffect(() => {
    if (!supabase || !formData.region_id) {
      setLocations([]);
      return;
    }
    
    async function fetchLocations() {
      setLoadingLocations(true);
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('parent_id', formData.region_id)
        .order('name');
      if (data) setLocations(data);
      setLoadingLocations(false);
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
          const hasDistricts = districts.length > 0;
          const hasSettlements = settlements.length > 0;
          const hasRegions = regions.length > 0;
          const hasFinalLocations = locations.length > 0;

          const l1Selected = !!formData.district_id;
          const l2Selected = !!formData.settlement_id;
          const l3Selected = !!formData.region_id;
          const l4Selected = !!formData.location_id;

          // Requirements:
          // 1. Level 1 must be selected if districts exist
          // 2. Level 2 must be selected if settlements exist (given L1 is selected)
          // 3. Level 3 must be selected if regions exist (given L2 is selected)
          // 4. Level 4 must be selected if special places exist (given L3 is selected)
          
          const v1 = !hasDistricts || l1Selected;
          const v2 = !hasSettlements || l2Selected;
          const v3 = !hasRegions || l3Selected;
          const v4 = !hasFinalLocations || l4Selected;

          return v1 && v2 && v3 && v4;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final location validation
    let submissionData = { ...formData, role };
    
    if (role === 'Business') {
      setLoading(true);
      
      // Determine final location_id from hierarchy
      let finalLocationId = null;
      if (formData.verified_location) {
        // Use the deepest selected level as the primary location_id
        finalLocationId = formData.location_id || formData.region_id || formData.settlement_id || formData.district_id || null;
      }

      const submissionData = { 
        ...formData, 
        role,
        location_id: finalLocationId
      };
      
      if (!formData.verified_location) {
        // Manual input resets the hierarchical IDs for the final submission
        submissionData.location_id = null;
        submissionData.district_id = '';
        submissionData.settlement_id = '';
        submissionData.region_id = '';
      }

      // Simulation of sending to admin for approval
      if (supabase) {
        try {
          await supabase.from('businesses').insert([{
            business_name: formData.business_name,
            category: formData.category,
            email: formData.email,
            owner_id: 'pending', // Temporary owner ID or handle via auth
            status: 'Pending',
            location_id: submissionData.location_id,
            ...submissionData
          }]);
        } catch (err) {
          console.error("Submission error:", err);
        }
      }
      
      setLoading(false);
      setIsSubmitted(true);
    } else {
      onComplete(submissionData);
    }
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
                <img src="/logo_tourbots.svg" alt="TourBots Logo" className="w-10 h-10 object-contain" />
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

          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-100 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Successfully Submitted!</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-sm mx-auto">
                  Your business profile has been sent to our admins for approval.
                </p>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-sm font-black text-slate-900 leading-relaxed">
                    Please come back after <span className="text-emerald-600">2 minutes</span>.
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    We are verifying your BTO license and location.
                  </p>
                </div>
              </div>
              <button 
                onClick={onCancel}
                className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:scale-105 transition-all"
              >
                Return to Home
              </button>
            </div>
          ) : (
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
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-100 border-none rounded-2xl p-5 pr-12 text-sm font-black focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                      >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
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
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                          District
                        </label>
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
                            <option value="">Choose a District</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          {loadingDistricts ? (
                            <Activity className="w-4 h-4 text-emerald-500 absolute right-12 top-1/2 -translate-y-1/2 animate-pulse" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                          City / Town / Village
                        </label>
                        <div className="relative">
                          <select 
                            required={formData.verified_location}
                            disabled={!formData.district_id || loadingSettlements}
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
                            <option value="">Choose City / Town / Village</option>
                            {settlements.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          {loadingSettlements ? (
                            <Activity className="w-4 h-4 text-emerald-500 absolute right-12 top-1/2 -translate-y-1/2 animate-pulse" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                          Area / Ward / Kgotla
                        </label>
                        <div className="relative">
                          <select 
                            required={formData.verified_location && settlements.length > 0}
                            disabled={!formData.settlement_id || loadingRegions}
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
                            <option value="">Choose Area / Ward / Kgotla</option>
                            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                          {loadingRegions ? (
                            <Activity className="w-4 h-4 text-emerald-500 absolute right-12 top-1/2 -translate-y-1/2 animate-pulse" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                          Special Place / Settlement
                        </label>
                        <div className="relative">
                          <select 
                            required={formData.verified_location && regions.length > 0}
                            disabled={!formData.region_id || loadingLocations}
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
                            <option value="">Choose Special Place / Settlement / Specific Location</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                          {loadingLocations ? (
                            <Activity className="w-4 h-4 text-emerald-500 absolute right-12 top-1/2 -translate-y-1/2 animate-pulse" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
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
                              disabled={!isStepValid() || loading}
                              className={cn(
                                "w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3",
                                !isStepValid() || loading ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                              )}
                            >
                              {loading ? (
                                <Activity className="w-4 h-4 animate-spin" />
                              ) : (
                                <>Complete Registration <CheckCircle className="w-4 h-4" /></>
                              )}
                            </button>
                          )}
                        </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

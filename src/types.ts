export type UserRole = 'Admin' | 'Tourist' | 'Business' | 'Guest';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  role: UserRole;
  profile_picture?: string;
  created_at: string;
}

export type BusinessStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Business {
  id: string;
  business_name: string;
  status: BusinessStatus;
  admin_comments?: string;
  bio?: string;
  mini_bio?: string;
  price_range?: string;
  whatsapp?: string;
  office_line?: string;
  email: string;
  location_id?: string;
  location_name?: string;
  area_name?: string;
  district_name?: string;
  settlement_name?: string;
  region_name?: string;
  verified_location?: boolean;
  manual_address?: string;
  latitude?: string;
  longitude?: string;
  package_id: 'free' | 'professional' | 'enterprise';
  owner_id: string;
  owner_name?: string;
  profile_picture?: string;
  created_at: string;
  documents?: string[]; // BTO documents, etc.
  payment_proof?: string;
  category: BusinessCategory;
  media: BusinessMedia[];
}

export type BusinessCategory = 
  | 'Lodge'
  | 'Safari Camp'
  | 'Hotel'
  | 'Car Rental'
  | 'Wellness and Therapy'
  | 'Guest House'
  | 'Restaurant'
  | 'Aviation Tours'
  | 'Travel Tours'
  | 'Taxi';

export interface BusinessMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  description: string;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  business_name?: string;
  listing_id?: string;
  listing_title?: string;
  customer_id: string;
  customer_name: string;
  booking_date: string;
  duration: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  business_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_picture?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  business_name?: string;
  title: string;
  description?: string;
  type: string;
  image_url?: string;
  start_date: string;
  expiry_date: string;
  active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface ChatThread {
  other_party_id: string;
  other_party_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface LocationData {
  districts: {
    name: string;
    settlements: {
      name: string;
      regions: {
        name: string;
        locations: string[];
      }[];
    }[];
  }[];
}

export interface PackageUpgradeRequest {
  id: string;
  business_id: string;
  business_name?: string;
  current_package: string;
  requested_package: string;
  payment_proof_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comments?: string;
  created_at: string;
  payment_verified?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  admin_id: string;
  user_id: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  business_id?: string;
  event_type: string;
  metadata?: any;
  timestamp?: string;
  user_id?: string;
  created_at?: string;
}

export type LocationType = 'district' | 'city' | 'town' | 'village' | 'suburb' | 'ward' | 'settlement' | 'location';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parent_id: string | null;
}

export interface Listing {
  id: string;
  business_id: string;
  title?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category: string;
  rating?: number;
  reviews_count?: number;
}

export interface Package {
  id: 'free' | 'professional' | 'enterprise' | 'standard'; // Added standard for backward compat
  name: string;
  price?: string;
  features: any;
}

export const TIER_LIMITS = {
  free: {
    promotions: 0,
    pictures: 1,
    videos: 0,
    profile_pic: true
  },
  professional: {
    promotions: 2,
    pictures: 5,
    videos: 1,
    profile_pic: true
  },
  enterprise: {
    promotions: 4,
    pictures: 10,
    videos: 3,
    profile_pic: true
  }
};

export interface DashboardFilters {
  year: string;
  month: string;
  location: string;
  status: string;
  category: string;
}

export type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

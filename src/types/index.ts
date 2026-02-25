export interface User {
  uid?: string;
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  age?: number;
  locationData?: {
    department?: string;
    city?: string;
    neighborhood?: string;
    specificZone?: string;
    placeType?: string[];
  };
  avatar?: string;
  photoURL?: string;
  verified?: boolean;
  verificationLevel?: 'none' | 'basic' | 'verified' | 'premium';
  photoVerified?: boolean;
  idVerified?: boolean;
  whatsapp?: string;
  customServices?: string[];
  location?: string | {
    department?: string;
    city?: string;
    neighborhood?: string;
    specificZone?: string;
    placeType?: string[];
  };
  pricing?: {
    basePrice?: number;
    priceType?: 'hora' | 'sesion' | 'negociable';
  };
  availability?: string[] | {
    days?: string[];
    hours?: {
      start?: string;
      end?: string;
    };
  };
  premium?: boolean;
  vip?: boolean;
  isVip?: boolean;
  isBoosted?: boolean;
  boostedUntil?: string;
  rating?: number;
  reviewCount?: number;
  online?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  bio?: string;
  description?: string;
  images?: string[];
  gallery?: string[];
  services?: string[];
  price?: string;
  availableDays?: string[];
  responseTime?: string;
  memberSince?: string;
  email?: string;
  accountType?: 'announcer' | 'user' | 'admin';
  role?: 'user' | 'announcer' | 'admin';
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  languages?: string[];
  gender?: string;
  attendsTo?: string[];
  placeType?: string[];
  horarioInicio?: string;
  horarioFin?: string;
  whatsappEnabled?: boolean;
  status?: 'active' | 'banned';
  verificationRequests?: {
    idProof?: string;
    photoProof?: string;
    status: 'none' | 'pending' | 'approved' | 'rejected';
    requestedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  paymentMethods?: Array<{ type: string; details: string }>;
  wallet?: {
    coins: number;
    transactions?: any[];
  };
  premiumPlan?: 'none' | 'gold' | 'diamond';
  premiumUntil?: string;
  priceList?: Array<{ label: string; price: number; description?: string }>;
  priority?: number;
  lastBumpDate?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Filter {
  location: string;
  ageRange: [number, number];
  verified: boolean;
  online: boolean;
  priceRange: string;
  availability: string;
}

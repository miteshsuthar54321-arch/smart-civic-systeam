import { Voucher, Complaint, ComplaintCategory } from '../types';

export const CATEGORY_INFO: Record<ComplaintCategory, {
  labelEn: string;
  labelHi: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  garbage: {
    labelEn: 'Garbage Dump / Solid Waste',
    labelHi: 'कचरा / अवैध डंपिंग',
    icon: '🗑️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300'
  },
  road: {
    labelEn: 'Pothole & Damaged Road',
    labelHi: 'खराब सड़क / गड्ढा',
    icon: '🕳️',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  },
  electricity: {
    labelEn: 'Broken Streetlight / Electric Pole',
    labelHi: 'टूटा हुआ पोल / स्ट्रीट लाइट',
    icon: '💡',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300'
  },
  water: {
    labelEn: 'Water Pipeline Leakage',
    labelHi: 'पानी की पाइप लीकेज',
    icon: '🚰',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  drainage: {
    labelEn: 'Sewage & Drainage Overflow',
    labelHi: 'नाली ओवरफ्लो / गंदा पानी',
    icon: '🌊',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300'
  },
  encroachment: {
    labelEn: 'Illegal Encroachment / Footpath blocked',
    labelHi: 'अवैध अतिक्रमण / फुटपाथ जाम',
    icon: '🚫',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  other: {
    labelEn: 'Other Civic Infrastructure Issue',
    labelHi: 'अन्य सार्वजनिक समस्या',
    icon: '⚠️',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300'
  }
};

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-metro-100',
    title: 'City Metro / Bus Card ₹100 Recharge',
    partner: 'DMRC & City Transit',
    category: 'Transit & Travel',
    pointsCost: 100,
    originalValue: '₹100 Value',
    discountDescription: '100% Free Metro or Smart Bus Card top-up',
    iconName: 'Train',
    bannerGradient: 'from-blue-600 to-indigo-700',
    terms: [
      'Valid at any metro station customer care counter or auto-topup app',
      'No minimum fare or usage restriction',
      'Valid for 90 days from redemption date'
    ],
    stock: 45
  },
  {
    id: 'vouch-cafe-coffee',
    title: 'Free Brewed Beverage / Coffee',
    partner: 'Cafe Coffee Day / Blue Tokai',
    category: 'Food & Dining',
    pointsCost: 150,
    originalValue: '₹220 Value',
    discountDescription: 'Complimentary regular cappuccino or latte',
    iconName: 'Coffee',
    bannerGradient: 'from-amber-600 to-yellow-700',
    terms: [
      'Show digital code at billing counter before order',
      'Valid at all participating outlets across the city',
      'Valid for 60 days from issuance'
    ],
    stock: 30
  },
  {
    id: 'vouch-amazon-250',
    title: '₹250 Amazon / Flipkart E-Gift Card',
    partner: 'Amazon Pay',
    category: 'Shopping',
    pointsCost: 250,
    originalValue: '₹250 Cash',
    discountDescription: 'Instant digital gift card code for any online purchase',
    iconName: 'ShoppingBag',
    bannerGradient: 'from-orange-500 to-rose-600',
    terms: [
      'Instant code addition to your Amazon Pay balance',
      'Usable across all categories with zero restrictions',
      'Balance never expires'
    ],
    stock: 20
  },
  {
    id: 'vouch-grocery-200',
    title: '₹200 Fresh Grocery & Supermarket Voucher',
    partner: 'BigBasket / Blinkit / Reliance Smart',
    category: 'Shopping',
    pointsCost: 200,
    originalValue: '₹200 Off',
    discountDescription: 'Flat ₹200 discount on daily essentials & produce',
    iconName: 'Store',
    bannerGradient: 'from-emerald-600 to-teal-700',
    terms: [
      'Applicable on orders above ₹499',
      'Applicable on fresh vegetables, fruits, and groceries',
      'One voucher per user per month'
    ],
    stock: 50
  },
  {
    id: 'vouch-tax-rebate',
    title: 'Municipal Property Tax 5% Rebate Voucher',
    partner: 'City Municipal Corporation',
    category: 'Civic Benefit',
    pointsCost: 300,
    originalValue: 'Up to ₹1,000 Off',
    discountDescription: '5% civic deduction on annual residential property tax',
    iconName: 'Building2',
    bannerGradient: 'from-cyan-700 to-blue-800',
    terms: [
      'Enter voucher token on official Municipal Corporation portal',
      'Applicable for residential property tax assessments',
      'Civic loyalty reward approved by City Council'
    ],
    stock: 100
  },
  {
    id: 'vouch-movie-150',
    title: '₹150 Movie Ticket Discount',
    partner: 'BookMyShow / PVR INOX',
    category: 'Entertainment',
    pointsCost: 150,
    originalValue: '₹150 Discount',
    discountDescription: 'Flat ₹150 off on minimum 2 cinema tickets',
    iconName: 'Film',
    bannerGradient: 'from-purple-600 to-pink-600',
    terms: [
      'Valid on any movie, any screening format (2D, 3D, IMAX)',
      'Valid for 45 days from redemption',
      'Cannot be clubbed with bank promo codes'
    ],
    stock: 25
  },
  {
    id: 'vouch-eco-hero',
    title: 'Eco-Champion Native Tree Plantation Kit',
    partner: 'City Green Forest Mission',
    category: 'Civic Benefit',
    pointsCost: 120,
    originalValue: 'Priceless',
    discountDescription: 'A certified native sapling planted & tagged in your honor',
    iconName: 'Trees',
    bannerGradient: 'from-green-600 to-emerald-800',
    terms: [
      'Certificate of planting with GPS coordinates of your tree',
      'Annual growth update sent to your registered email',
      'Plantation organized by municipal parks department'
    ],
    stock: 80
  },
  {
    id: 'vouch-fuel-150',
    title: '₹150 Fuel & EV Charging Discount',
    partner: 'IndianOil / BPCL / Tata Power EV',
    category: 'Transit & Travel',
    pointsCost: 200,
    originalValue: '₹150 Fuel',
    discountDescription: 'Instant cash discount at fuel stations & EV chargers',
    iconName: 'Fuel',
    bannerGradient: 'from-rose-600 to-amber-700',
    terms: [
      'Scan QR at gas station POS terminal or enter in EV App',
      'Valid for Petrol, Diesel, CNG, or EV Charging',
      'Valid for 60 days'
    ],
    stock: 35
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-101',
    title: 'Massive Garbage Pile near Sector 4 Market Gate',
    description: 'Uncleaned waste piling up for 4 days. Strong odor spreading, stray cattle eating plastics, and blocking pedestrian pathway.',
    category: 'garbage',
    status: 'In Progress',
    urgency: 'High',
    location: {
      lat: 28.6328,
      lng: 77.2197,
      address: 'Near Sector 4 Market Gate, Connaught Circle',
      landmark: 'Opposite State Bank Branch',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-1',
      name: 'Rohan Sharma',
      email: 'rohan.s@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    upvotes: 24,
    upvotedBy: ['user-sample-1', 'user-sample-2'],
    resolutionNote: 'Municipal Sanitation Truck #14 dispatched with compactors. Cleaning scheduled today.'
  },
  {
    id: 'comp-102',
    title: 'Dangerous Deep Pothole on Ring Road Flyover Descent',
    description: 'Pothole is approximately 1.5 feet wide and 5 inches deep right after the descent curve. Two 2-wheelers skidded yesterday evening.',
    category: 'road',
    status: 'Pending',
    urgency: 'High',
    location: {
      lat: 28.6143,
      lng: 77.2289,
      address: 'Descent ramp of Ring Road Flyover, Near Pragati Maidan',
      landmark: 'Adjacent to Metro Pillar 42',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-2',
      name: 'Priya Verma',
      email: 'priya.v@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    upvotes: 42,
    upvotedBy: ['user-sample-2']
  },
  {
    id: 'comp-103',
    title: 'Tilted Broken Electric Pole with Hanging Live Wire',
    description: 'Electric pole tilted dangerously after storm, open sparking observed in light rain. High risk for school children walking through lane.',
    category: 'electricity',
    status: 'Pending',
    urgency: 'High',
    location: {
      lat: 28.5823,
      lng: 77.2345,
      address: 'Lane 7, Near Primary Municipal School, Defence Colony',
      landmark: 'Next to Community Center Gate',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-3',
      name: 'Amit Patel',
      email: 'amit.p@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    upvotes: 38,
    upvotedBy: ['user-sample-3']
  },
  {
    id: 'comp-104',
    title: 'Main Clean Drinking Water Pipe Bursting & Wasting Water',
    description: 'Potable water supply pipe cracked underground, creating a fountain and flooding the entire residential road for over 24 hours.',
    category: 'water',
    status: 'Resolved',
    urgency: 'High',
    location: {
      lat: 28.6448,
      lng: 77.2167,
      address: 'Main Market Road, Karol Bagh',
      landmark: 'Behind Gurdwara Road Junction',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-4',
      name: 'Sunita Mehra',
      email: 'sunita.m@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    upvotes: 56,
    upvotedBy: ['user-sample-4'],
    resolutionNote: 'Jal Board emergency maintenance unit replaced 15 meters of cracked ductile iron pipe and resurfaced the trench. Pressure restored.',
    resolvedAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 'comp-105',
    title: 'Open Drain Overflowing with Foul Black Sludge',
    description: 'Choked storm drain during heavy pre-monsoon shower, sewage water entering ground floor shops and breeding mosquitoes.',
    category: 'drainage',
    status: 'In Progress',
    urgency: 'Medium',
    location: {
      lat: 28.6219,
      lng: 77.2090,
      address: 'Gole Market Outer Ring Road',
      landmark: 'Near Bus Stop 12',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-5',
      name: 'Vikas Gupta',
      email: 'vikas.g@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    upvotes: 19,
    upvotedBy: ['user-sample-5'],
    resolutionNote: 'Suction jetting machine team active on site clearing silt blockage.'
  },
  {
    id: 'comp-106',
    title: 'Illegal Commercial Shed Blocking Entire Pedestrian Footpath',
    description: 'New iron shed constructed over 50 meters of sidewalk, forcing pedestrians, elderly citizens, and children onto high-speed road traffic.',
    category: 'encroachment',
    status: 'Pending',
    urgency: 'Medium',
    location: {
      lat: 28.5912,
      lng: 77.2215,
      address: 'Lodi Colony Main Commercial Block',
      landmark: 'Opposite Community Hall',
      city: 'New Delhi'
    },
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      uid: 'user-sample-6',
      name: 'Deepak Joshi',
      email: 'deepak.j@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    upvotes: 31,
    upvotedBy: ['user-sample-6']
  }
];

export const SAMPLE_ISSUE_PHOTOS = [
  {
    category: 'garbage',
    label: 'Overflowing Garbage Bin',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'road',
    label: 'Deep Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'electricity',
    label: 'Damaged Electric Pole / Light',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'water',
    label: 'Burst Water Pipe / Flooding',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'drainage',
    label: 'Choked Open Drain / Sewage',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
  }
];

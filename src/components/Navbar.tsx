import React, { useState } from 'react';
import { 
  Map, 
  PlusCircle, 
  ListFilter, 
  Gift, 
  Trophy, 
  Sparkles, 
  User, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    setIsAuthModalOpen, 
    setIsProfileOpen,
    unreadNotificationsCount,
    setIsNotificationOpen
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavItem {
    id: 'map' | 'report' | 'complaints' | 'rewards' | 'leaderboard';
    label: string;
    labelHi: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'map', label: 'Live Map', labelHi: 'लाइव मैप', icon: Map },
    { id: 'report', label: 'Report Issue', labelHi: 'समस्या दर्ज करें', icon: PlusCircle, highlight: true },
    { id: 'complaints', label: 'All Complaints', labelHi: 'शिकायतें', icon: ListFilter },
    { id: 'rewards', label: 'Voucher Store', labelHi: 'इनाम स्टोर', icon: Gift },
    { id: 'leaderboard', label: 'Leaderboard', labelHi: 'लीडरबोर्ड', icon: Trophy }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('map')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight">NagarSeva</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">Civic 360</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">
              Smart Civic Complaints & Rewards
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? item.highlight
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-700'
                    : item.highlight
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="bg-amber-400 text-amber-950 px-1 py-0.2 rounded-sm text-[9px] font-black">
                    +50 Pts
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Points Badge & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Points Badge */}
          {user ? (
            <button
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 rounded-xl transition cursor-pointer shadow-xs"
              title="Click to visit Rewards Store"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black">
                ★
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-black text-amber-900 block">
                  {user.points} <span className="text-[10px] font-semibold text-amber-700">Pts</span>
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Earn +50 Pts / Report</span>
            </button>
          )}

          {/* Notification Bell Button */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Civic Status Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Button or Sign-In */}
          {user ? (
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user.displayName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
              />
              <span className="hidden md:block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                {user.displayName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Sign In / Login
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-normal">{item.labelHi}</span>
                  {item.highlight && (
                    <span className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded text-[10px] font-black">
                      +50 Pts
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

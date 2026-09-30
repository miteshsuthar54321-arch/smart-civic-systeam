import React from 'react';
import { 
  X, 
  User, 
  Award, 
  Sparkles, 
  CheckCircle, 
  Ticket, 
  LogOut, 
  Clock, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserProfileModal: React.FC = () => {
  const { 
    user, 
    isProfileOpen, 
    setIsProfileOpen, 
    logout, 
    complaints, 
    myRedemptions, 
    activities, 
    setActiveTab 
  } = useApp();

  if (!isProfileOpen || !user) return null;

  const myComplaints = complaints.filter(c => c.reportedBy.uid === user.uid);
  const myResolved = myComplaints.filter(c => c.status === 'Resolved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header Profile Cover */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white relative shrink-0">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition"
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user.displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{user.displayName}</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-bold text-[10px] rounded-full">
                  Level {user.level}
                </span>
              </div>
              <p className="text-xs text-blue-200">{user.email}</p>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-300">
                <Award className="w-3.5 h-3.5" />
                <span>{user.badge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Stats Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Civic Points</span>
              <span className="text-xl font-black text-amber-900 mt-0.5 block">{user.points}</span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Reports Filed</span>
              <span className="text-xl font-black text-blue-900 mt-0.5 block">{myComplaints.length}</span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Resolved</span>
              <span className="text-xl font-black text-emerald-900 mt-0.5 block">{myResolved.length}</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setActiveTab('rewards');
              }}
              className="flex-1 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span>Redeem Points</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600">{user.points} Available</span>
              </div>
            </button>

            <button
              onClick={() => {
                setIsProfileOpen(false);
                setActiveTab('complaints');
              }}
              className="flex-1 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>My Complaints</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{myComplaints.length} Total</span>
              </div>
            </button>
          </div>

          {/* My Redeemed Vouchers Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-blue-600" />
              <span>My Active Vouchers ({myRedemptions.length})</span>
            </h4>

            {myRedemptions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
                You haven't claimed any vouchers yet. Earn points by reporting issues!
              </div>
            ) : (
              <div className="space-y-2">
                {myRedemptions.map((red) => (
                  <div
                    key={red.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{red.voucherTitle}</span>
                      <span className="text-[11px] font-mono font-semibold text-blue-700">{red.code}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Expires {new Date(red.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Activity History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Recent Civic Points Activity</span>
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">{act.title}</span>
                      <span className="text-[11px] text-slate-500">{act.description}</span>
                    </div>
                    <span className={`font-black text-xs ${act.amount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {act.amount > 0 ? `+${act.amount}` : act.amount} Pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Civic Citizen Sign-Up Bonus</span>
                    <span className="text-[11px] text-slate-500">Welcome to NagarSeva</span>
                  </div>
                  <span className="font-black text-emerald-600 text-xs">+50 Pts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            NagarSeva Verified Citizen Profile
          </span>
          <button
            onClick={() => {
              logout();
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

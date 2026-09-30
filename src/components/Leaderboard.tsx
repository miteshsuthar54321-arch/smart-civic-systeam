import React from 'react';
import { Trophy, Medal, Award, Sparkles, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Leaderboard: React.FC = () => {
  const { user, complaints, setActiveTab } = useApp();

  // Synthetic top contributors blended with current user
  const topCitizens = [
    {
      rank: 1,
      name: 'Rohan Sharma',
      badge: 'City Champion 👑',
      points: 750,
      reports: 15,
      resolved: 12,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isMe: user?.displayName === 'Rohan Sharma'
    },
    {
      rank: 2,
      name: 'Priya Verma',
      badge: 'City Sentinel 🛡️',
      points: 520,
      reports: 11,
      resolved: 9,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isMe: user?.displayName === 'Priya Verma'
    },
    {
      rank: 3,
      name: user ? user.displayName : 'Mitesh Sharma (You)',
      badge: user ? user.badge : 'Civic Warrior ⚡',
      points: user ? user.points : 250,
      reports: user ? user.complaintsCount : 5,
      resolved: user ? user.resolvedCount : 3,
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      isMe: true
    },
    {
      rank: 4,
      name: 'Amit Patel',
      badge: 'Civic Explorer 🌟',
      points: 200,
      reports: 4,
      resolved: 3,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      isMe: false
    },
    {
      rank: 5,
      name: 'Sunita Mehra',
      badge: 'Civic Explorer 🌟',
      points: 150,
      reports: 3,
      resolved: 3,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      isMe: false
    }
  ].sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Civic Heroes & Leaderboard</span>
            </div>
            <h1 className="text-2xl font-black">City Impact Champions</h1>
            <p className="text-xs text-slate-300 max-w-md">
              Citizens who actively report potholes, garbage dumps, and street infrastructure hazards to transform our city into a cleaner, safer home.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('report')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Join & Earn +50 Pts</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {topCitizens.slice(0, 3).map((citizen) => (
          <div
            key={citizen.name}
            className={`rounded-3xl p-6 text-center border relative transition ${
              citizen.rank === 1
                ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md ring-2 ring-amber-300/40'
                : citizen.rank === 2
                  ? 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-sm'
                  : 'bg-gradient-to-b from-orange-50 to-white border-orange-200 shadow-sm'
            }`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                citizen.rank === 1
                  ? 'bg-amber-400 text-amber-950'
                  : citizen.rank === 2
                    ? 'bg-slate-300 text-slate-900'
                    : 'bg-orange-300 text-orange-950'
              }`}>
                #{citizen.rank} Rank
              </span>
            </div>

            <div className="mt-3 relative w-16 h-16 mx-auto mb-3">
              <img
                src={citizen.avatar}
                alt={citizen.name}
                className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
              />
              {citizen.rank === 1 && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-white rounded-full">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-sm">
              {citizen.name} {citizen.isMe && <span className="text-blue-600 text-xs">(You)</span>}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 block">
              {citizen.badge}
            </span>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Points</span>
                <span className="font-black text-amber-600 text-sm">{citizen.points}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reports</span>
                <span className="font-bold text-slate-800 text-sm">{citizen.reports}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            City Civic Ranking
          </span>
          <span className="text-xs text-slate-500">
            Updated in real-time
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {topCitizens.map((item) => (
            <div
              key={item.name}
              className={`p-4 flex items-center justify-between gap-4 transition ${
                item.isMe ? 'bg-blue-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  item.rank === 1
                    ? 'bg-amber-100 text-amber-800'
                    : item.rank === 2
                      ? 'bg-slate-200 text-slate-700'
                      : item.rank === 3
                        ? 'bg-orange-100 text-orange-800'
                        : 'text-slate-500'
                }`}>
                  #{item.rank}
                </span>

                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />

                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isMe && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.badge} • {item.reports} Complaints Submitted
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-amber-600 text-sm block">
                  {item.points} Pts
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.resolved} resolved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

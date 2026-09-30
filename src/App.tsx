/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PublicLiveMap } from './components/PublicLiveMap';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintList } from './components/ComplaintList';
import { RewardsStore } from './components/RewardsStore';
import { Leaderboard } from './components/Leaderboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationCenter, LiveToastAlert } from './components/NotificationCenter';
import { ShieldCheck, MapPin, Heart, Sparkles, PhoneCall } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <LiveToastAlert />

      <main className="flex-1">
        {activeTab === 'map' && <PublicLiveMap />}
        {activeTab === 'report' && <ComplaintForm />}
        {activeTab === 'complaints' && <ComplaintList />}
        {activeTab === 'rewards' && <RewardsStore />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>

      {/* Floating Report Button on Map View */}
      {activeTab === 'map' && (
        <div className="fixed bottom-6 right-6 z-30 sm:hidden">
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs rounded-full shadow-2xl transition transform active:scale-95 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>+ Report Issue (+50)</span>
          </button>
        </div>
      )}

      {/* Modals & Notification Drawer */}
      <AuthModal />
      <UserProfileModal />
      <NotificationCenter />

      {/* Footer (hidden on full-screen map view for maximum map visibility) */}
      {activeTab !== 'map' && (
        <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800">
                NagarSeva Smart Civic Complaint System
              </span>
              <span>• Empowering Citizens, Transforming Cities</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button 
                onClick={() => setActiveTab('map')} 
                className="hover:text-blue-600 cursor-pointer"
              >
                Live Map
              </button>
              <button 
                onClick={() => setActiveTab('report')} 
                className="hover:text-blue-600 cursor-pointer"
              >
                Report Issue
              </button>
              <button 
                onClick={() => setActiveTab('rewards')} 
                className="hover:text-blue-600 cursor-pointer"
              >
                Rewards Store
              </button>
              <span className="flex items-center gap-1 text-slate-400">
                <span>Built for Clean & Safe Cities</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

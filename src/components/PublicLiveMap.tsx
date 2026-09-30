import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Filter, 
  MapPin, 
  ThumbsUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Layers, 
  Navigation,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { CATEGORY_INFO } from '../data/initialData';

export const PublicLiveMap: React.FC = () => {
  const { 
    complaints, 
    upvoteComplaint, 
    updateComplaintStatus, 
    setActiveTab, 
    setSelectedComplaintId,
    selectedComplaintId 
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  // Calculate status counts
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090], // Center on New Delhi
        zoom: 12,
        zoomControl: false
      });

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Positron / OSM tiles for clean modern civic UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers on Map when filtered complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredComplaints.forEach((complaint) => {
      const catInfo = CATEGORY_INFO[complaint.category] || CATEGORY_INFO.other;
      
      // Pin styling based on status
      const statusColor = 
        complaint.status === 'Resolved' 
          ? '#10b981' // emerald
          : complaint.status === 'In Progress' 
            ? '#f59e0b' // amber
            : '#ef4444'; // red

      const markerHtml = `
        <div class="custom-civic-pin group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div style="
            background: white;
            border: 3px solid ${statusColor};
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            font-size: 19px;
            position: relative;
            transition: transform 0.2s ease;
          ">
            <span>${catInfo.icon}</span>
            <div style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${statusColor};
              border: 2px solid white;
            "></div>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${statusColor};
            margin: 0 auto;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [40, 48],
        iconAnchor: [20, 48]
      });

      const marker = L.marker([complaint.location.lat, complaint.location.lng], {
        icon: customIcon
      });

      marker.on('click', () => {
        setActiveComplaint(complaint);
        setSelectedComplaintId(complaint.id);
        mapInstanceRef.current?.flyTo([complaint.location.lat, complaint.location.lng], 15, {
          duration: 0.8
        });
      });

      marker.addTo(markersLayerRef.current!);
    });

    // If there's a selected complaint from another view, focus it
    if (selectedComplaintId) {
      const match = complaints.find(c => c.id === selectedComplaintId);
      if (match) {
        setActiveComplaint(match);
        mapInstanceRef.current.flyTo([match.location.lat, match.location.lng], 15);
      }
    }
  }, [filteredComplaints, selectedComplaintId]);

  const flyToUserLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstanceRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14, {
        duration: 1
      });
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-900">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Filter Group */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1">
            {(['all', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedStatus === st
                    ? st === 'Resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'In Progress'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : st === 'Pending'
                          ? 'bg-red-500 text-white shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-800 rounded-lg outline-none cursor-pointer border border-transparent focus:border-blue-400 transition"
          >
            <option value="all">All Categories (सभी श्रेणियां)</option>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.icon} {info.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Right Stats & Quick Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Counter Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/80 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Total: <strong className="font-bold text-slate-900">{totalCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Pending: <strong className="font-bold">{pendingCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              In Progress: <strong className="font-bold">{inProgressCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Resolved: <strong className="font-bold">{resolvedCount}</strong>
            </span>
          </div>

          {/* Current GPS button */}
          <button
            onClick={flyToUserLocation}
            title="Go to My Location"
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-lg border border-slate-200 transition cursor-pointer flex items-center justify-center hover:text-blue-600"
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* Report New Issue Trigger */}
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-2xl shadow-lg transition transform active:scale-95 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>+ Report Civic Issue</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Legend at bottom left */}
      <div className="absolute bottom-6 left-4 z-20 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] font-medium text-slate-700">
        <span className="font-bold text-slate-900 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" /> Pin Legend:
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block" />
          Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block" />
          In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block" />
          Resolved
        </span>
      </div>

      {/* Interactive Detail Card Modal/Sidebar when pin clicked */}
      {activeComplaint && (
        <div className="absolute bottom-6 right-4 sm:top-20 sm:bottom-auto z-30 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header Image */}
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img
              src={activeComplaint.photoUrl}
              alt={activeComplaint.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs backdrop-blur-md ${
                activeComplaint.status === 'Resolved' 
                  ? 'bg-emerald-600/90' 
                  : activeComplaint.status === 'In Progress' 
                    ? 'bg-amber-600/90' 
                    : 'bg-red-600/90'
              }`}>
                {activeComplaint.status === 'Resolved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {activeComplaint.status === 'In Progress' && <Clock className="w-3 h-3 inline mr-1" />}
                {activeComplaint.status === 'Pending' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                {activeComplaint.status}
              </span>

              {activeComplaint.urgency === 'High' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white">
                  High Urgency
                </span>
              )}
            </div>

            {/* Close Card */}
            <button
              onClick={() => {
                setActiveComplaint(null);
                setSelectedComplaintId(null);
              }}
              className="absolute top-3 right-3 w-7 h-7 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm transition cursor-pointer"
            >
              ✕
            </button>

            {/* Bottom info on image */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-center gap-1.5 text-xs text-slate-200">
                <span>{CATEGORY_INFO[activeComplaint.category]?.icon}</span>
                <span>{CATEGORY_INFO[activeComplaint.category]?.labelEn}</span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight line-clamp-1 mt-0.5">
                {activeComplaint.title}
              </h3>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {/* Description */}
            <p className="text-xs text-slate-700 leading-relaxed">
              {activeComplaint.description}
            </p>

            {/* Address */}
            <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">Location:</strong>
                <span>{activeComplaint.location.address}</span>
                {activeComplaint.location.landmark && (
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Landmark: {activeComplaint.location.landmark}
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Note if available */}
            {activeComplaint.resolutionNote && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Civic Resolution Note:</span>
                </div>
                <p className="text-emerald-900 text-[11px]">
                  {activeComplaint.resolutionNote}
                </p>
              </div>
            )}

            {/* Reporter Meta & Time */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <img
                  src={activeComplaint.reportedBy.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={activeComplaint.reportedBy.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>By {activeComplaint.reportedBy.name}</span>
              </div>
              <span>{new Date(activeComplaint.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => upvoteComplaint(activeComplaint.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Upvote ({activeComplaint.upvotes})</span>
              </button>

              <button
                onClick={() => setShowStatusModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal for active complaint */}
      {showStatusModal && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Update Complaint Status
              </h4>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Civic workers and community verifiers can update this complaint's progress:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    updateComplaintStatus(activeComplaint.id, status, resolutionNoteInput || undefined);
                    setActiveComplaint({ ...activeComplaint, status, resolutionNote: resolutionNoteInput });
                    setShowStatusModal(false);
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                    activeComplaint.status === status
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Resolution Note / Action Taken (Optional):
              </label>
              <textarea
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                placeholder="e.g. Sanitation team cleared the area, pothole filled with cold asphalt mix..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resolutionNoteInput) {
                    updateComplaintStatus(activeComplaint.id, activeComplaint.status, resolutionNoteInput);
                    setActiveComplaint({ ...activeComplaint, resolutionNote: resolutionNoteInput });
                  }
                  setShowStatusModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

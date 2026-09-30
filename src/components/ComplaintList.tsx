import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  ArrowUpDown,
  UserCheck,
  Building,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { CATEGORY_INFO } from '../data/initialData';

export const ComplaintList: React.FC = () => {
  const { 
    complaints, 
    user, 
    upvoteComplaint, 
    updateComplaintStatus, 
    setActiveTab, 
    setSelectedComplaintId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes'>('newest');

  // Modal for changing status
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');

  // Filtering
  const filtered = complaints.filter((c) => {
    if (showOnlyMine && user && c.reportedBy.uid !== user.uid) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchAddress = c.location.address.toLowerCase().includes(q);
      const matchCat = CATEGORY_INFO[c.category]?.labelEn.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAddress && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    return b.createdAt - a.createdAt;
  });

  const handleOpenStatusModal = (complaint: Complaint) => {
    setUpdatingComplaint(complaint);
    setNewStatus(complaint.status);
    setResolutionNote(complaint.resolutionNote || '');
  };

  const handleSaveStatus = async () => {
    if (!updatingComplaint) return;
    await updateComplaintStatus(updatingComplaint.id, newStatus, resolutionNote);
    setUpdatingComplaint(null);
  };

  const handleViewOnMap = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setActiveTab('map');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Civic Complaints Dashboard (शिकायत सूची)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status of all reported public issues in real-time, upvote urgent complaints, or verify resolution.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>+ Report New Issue (+50 Pts)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by issue title, landmark, area, or description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="newest">Sort: Most Recent</option>
              <option value="upvotes">Sort: Highest Upvoted</option>
            </select>
          </div>
        </div>

        {/* Status Filters and My Complaints toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            {(['all', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedStatus === st
                    ? st === 'Resolved'
                      ? 'bg-emerald-600 text-white'
                      : st === 'In Progress'
                        ? 'bg-amber-500 text-white'
                        : st === 'Pending'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {user && (
            <button
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                showOnlyMine
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Reports Only ({complaints.filter(c => c.reportedBy.uid === user.uid).length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No complaints found matching this filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selected status filter to see other civic issues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((complaint) => {
            const cat = CATEGORY_INFO[complaint.category] || CATEGORY_INFO.other;
            const hasUpvoted = user && complaint.upvotedBy.includes(user.uid);

            return (
              <div
                key={complaint.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Status Badge */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={complaint.photoUrl}
                      alt={complaint.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs backdrop-blur-md flex items-center gap-1 ${
                        complaint.status === 'Resolved'
                          ? 'bg-emerald-600'
                          : complaint.status === 'In Progress'
                            ? 'bg-amber-600'
                            : 'bg-red-600'
                      }`}>
                        {complaint.status === 'Resolved' && <CheckCircle2 className="w-3 h-3" />}
                        {complaint.status === 'In Progress' && <Clock className="w-3 h-3" />}
                        {complaint.status === 'Pending' && <AlertTriangle className="w-3 h-3" />}
                        {complaint.status}
                      </span>
                    </div>

                    {/* Urgency Pill */}
                    {complaint.urgency === 'High' && (
                      <div className="absolute top-3 right-3 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        High Urgency
                      </div>
                    )}

                    {/* Bottom Category Icon */}
                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium flex items-center gap-1.5">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-semibold text-slate-100 text-[11px] drop-shadow-xs">{cat.labelEn}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {complaint.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>

                    {/* Address Landmark */}
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{complaint.location.address}</span>
                    </div>

                    {/* Resolution Note if present */}
                    {complaint.resolutionNote && (
                      <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200">
                        <strong className="block font-semibold">Resolution Note:</strong>
                        <span className="line-clamp-2">{complaint.resolutionNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>By {complaint.reportedBy.name}</span>
                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => upvoteComplaint(complaint.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        hasUpvoted
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Upvote this complaint to raise civic priority"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{complaint.upvotes}</span>
                    </button>

                    {/* View on Map */}
                    <button
                      onClick={() => handleViewOnMap(complaint.id)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                      title="View Pin on Live Map"
                    >
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>Map</span>
                    </button>

                    {/* Change Status Modal trigger */}
                    <button
                      onClick={() => handleOpenStatusModal(complaint)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition cursor-pointer"
                      title="Update status"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Status</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      {updatingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Civic Status
                </h3>
                <p className="text-xs text-slate-500">
                  Complaint ID: {updatingComplaint.id}
                </p>
              </div>
              <button
                onClick={() => setUpdatingComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Select New Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${
                      newStatus === st
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Resolution Note / Action Remarks:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Municipal PWD patch work completed, waste lifted and sanitised by municipal garbage truck..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUpdatingComplaint(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer transition"
              >
                Save & Update Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

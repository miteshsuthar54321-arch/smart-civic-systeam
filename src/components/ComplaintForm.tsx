import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplaintCategory, UrgencyLevel, ComplaintLocation } from '../types';
import { CATEGORY_INFO, SAMPLE_ISSUE_PHOTOS } from '../data/initialData';
import { MapPicker } from './MapPicker';

export const ComplaintForm: React.FC = () => {
  const { user, submitComplaint, setActiveTab, setIsAuthModalOpen, setSelectedComplaintId } = useApp();

  const [category, setCategory] = useState<ComplaintCategory>('garbage');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_ISSUE_PHOTOS[0].url);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [location, setLocation] = useState<ComplaintLocation>({
    lat: 28.6289,
    lng: 77.2065,
    address: 'Near Connaught Place Outer Circle, New Delhi',
    landmark: 'Opposite Metro Station'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successAward, setSuccessAward] = useState<boolean>(false);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Photo size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setIsCustomPhoto(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a short title for the complaint.');
      return;
    }

    if (!description.trim() || description.length < 15) {
      setFormError('Please provide a detailed description (at least 15 characters) so civic authorities can locate and resolve it.');
      return;
    }

    if (!photoUrl) {
      setFormError('Please upload or select an issue photograph as evidence.');
      return;
    }

    setSubmitting(true);
    const result = await submitComplaint({
      title,
      description,
      category,
      urgency,
      location,
      photoUrl
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessAward(true);
    } else {
      setFormError(result.error || 'Failed to submit complaint. Please try again.');
    }
  };

  if (successAward) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Reward Unlocked! +50 Points Added</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Complaint Successfully Registered!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Aapki shikayat safaltapoorvak darj ho chuki hai. Aapke account mein <strong>50 Civic Points</strong> credit kar diye gaye hain.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Issue:</span>
              <span className="font-semibold text-slate-800">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{CATEGORY_INFO[category].labelEn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-amber-600">Pending Review</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{location.address}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('map')}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>View Pin on Public Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Redeem Points in Voucher Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Earn Instant +50 Reward Points</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Report a Civic Problem (समस्या दर्ज करें)
          </h1>
          <p className="text-xs text-blue-100 max-w-xl">
            Report road potholes, garbage heaps, broken electricity poles, or water leaks with live GPS coordinates to notify local authorities.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-inner">
            +50
          </div>
          <div className="text-xs leading-tight">
            <span className="font-bold block text-white">Points per Report</span>
            <span className="text-blue-200 text-[11px]">Redeem for Vouchers</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 block">
            1. Select Civic Problem Category (समस्या की श्रेणी) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(Object.entries(CATEGORY_INFO) as [ComplaintCategory, typeof CATEGORY_INFO['garbage']][]).map(([key, info]) => {
              const isSelected = category === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setCategory(key);
                    // Match sample photo if not customized
                    if (!isCustomPhoto) {
                      const sample = SAMPLE_ISSUE_PHOTOS.find(p => p.category === key);
                      if (sample) setPhotoUrl(sample.url);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {info.labelEn}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {info.labelHi}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-1.5">
              2. Title & Short Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole causing skidding on Ring Road descent"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-900 block mb-1.5">
              Detailed Description (विस्तृत विवरण) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details (size of pothole, duration of waste pile, street light pole number, danger posed to pedestrians or vehicles)..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Urgency Level (प्राथमिकता):
            </label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as UrgencyLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    urgency === lvl
                      ? lvl === 'High'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-300/40'
                        : lvl === 'Medium'
                          ? 'bg-amber-50 border-amber-400 text-amber-700 ring-2 ring-amber-300/40'
                          : 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-300/40'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl === 'High' ? '🔴 High (Immediate Hazard)' : lvl === 'Medium' ? '🟡 Medium' : '🟢 Low'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Photo Upload & Evidence */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 block">
            3. Photo Evidence (तस्वीर अपलोड करें) <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:bg-slate-50 transition cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Take Photo or Upload Image
                </div>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>

            {/* Photo Preview & Quick Samples */}
            <div className="space-y-2">
              <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100">
                <img
                  src={photoUrl}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {isCustomPhoto ? 'Custom Uploaded' : 'Sample Selected'}
                </div>
              </div>

              {/* Sample Photos Selector */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Or select a verified sample photo for testing:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SAMPLE_ISSUE_PHOTOS.map((sample, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setPhotoUrl(sample.url);
                        setIsCustomPhoto(false);
                      }}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer transition ${
                        photoUrl === sample.url ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Interactive Live Location Map */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 block">
            4. Live GPS Location & Map Coordinates (लाइव लोकेशन) <span className="text-rose-500">*</span>
          </label>
          <MapPicker location={location} onChange={setLocation} />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Automatic +50 reward points will be credited to your account.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Complaint & Awarding Points...
              </>
            ) : (
              <>
                <span>Submit Complaint & Claim +50 Points</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

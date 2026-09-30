import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react';
import { ComplaintLocation } from '../types';

interface MapPickerProps {
  location: ComplaintLocation;
  onChange: (loc: ComplaintLocation) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ location, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create custom pin icon
      const customIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background: #ef4444; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); border: 3px solid #ffffff;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width: 8px; height: 8px; background: #b91c1c; border-radius: 50%; margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 46]
      });

      const map = L.map(mapContainerRef.current, {
        center: [location.lat || 28.6139, location.lng || 77.2090],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([location.lat || 28.6139, location.lng || 77.2090], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        handlePositionChange(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size to ensure clean tile loading
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handlePositionChange = async (lat: number, lng: number) => {
    // Reverse geocode via OpenStreetMap Nominatim
    let detectedAddress = location.address;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          detectedAddress = data.display_name;
        }
      }
    } catch {
      // Fallback if network blocked
      detectedAddress = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    }

    onChange({
      ...location,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address: detectedAddress
    });
  };

  const detectLiveGpsLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
        }

        handlePositionChange(lat, lng);
        setDetectingGps(false);
      },
      (err) => {
        console.warn('GPS detection notice:', err);
        setGpsError('Could not access live GPS. Please click anywhere on the map to pin the complaint location.');
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-500" />
          Location & GPS Coordinates <span className="text-rose-500">*</span>
        </label>

        <button
          type="button"
          onClick={detectLiveGpsLocation}
          disabled={detectingGps}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          {detectingGps ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Detecting Live GPS...
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Detect My Live Location (GPS)
            </>
          )}
        </button>
      </div>

      {gpsError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 h-56 w-full shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 shadow-xs border border-slate-200 pointer-events-none">
          Click map or drag pin to relocate
        </div>
      </div>

      {/* Coordinate & Address Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-slate-600 font-medium block mb-1">
            Detected Coordinates:
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-700">
            <Crosshair className="w-3.5 h-3.5 text-slate-500" />
            <span>Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</span>
          </div>
        </div>

        <div>
          <label className="text-slate-600 font-medium block mb-1">
            Street Address / Area Landmark:
          </label>
          <input
            type="text"
            value={location.address}
            onChange={(e) => onChange({ ...location, address: e.target.value })}
            placeholder="e.g. Near Metro Gate 2, Ring Road"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

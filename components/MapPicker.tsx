"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react";

import { CHEF_APEDO_KITCHEN } from "@/lib/delivery/distance";

// Fix for default Leaflet marker icons missing in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }, placeName?: string) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

interface SearchResult {
  name: string;
  subtext: string;
  lat: number;
  lng: number;
}

// Pre-indexed hotspot landmarks for the search dropdown
const ACCRA_PRESETS: SearchResult[] = [
  { name: "Evandy Hostel", subtext: "UG Legon Campus, near Pentagon & TF", lat: 5.6593, lng: -0.1932 },
  { name: "Pentagon Hostel (Blocks A, B, C)", subtext: "UG Legon Campus, North Legon", lat: 5.6582, lng: -0.1915 },
  { name: "TF Hostel (Hostel Annex)", subtext: "UG Legon Campus, near Pentagon", lat: 5.6575, lng: -0.1902 },
  { name: "Bani Hostel", subtext: "UG Legon Campus, near Pentagon", lat: 5.6601, lng: -0.1925 },
  { name: "African Union (AU) Hostel", subtext: "UG Legon Campus", lat: 5.6565, lng: -0.1938 },
  { name: "Legon Hall", subtext: "University of Ghana Main Campus", lat: 5.6498, lng: -0.1876 },
  { name: "Akuafo Hall", subtext: "University of Ghana Main Campus", lat: 5.6515, lng: -0.1872 },
  { name: "Commonwealth Hall (Vandals)", subtext: "University of Ghana Main Campus", lat: 5.6542, lng: -0.1856 },
  { name: "Volta Hall", subtext: "University of Ghana Main Campus", lat: 5.6508, lng: -0.1858 },
  { name: "Mensah Sarbah Hall", subtext: "University of Ghana Main Campus", lat: 5.6472, lng: -0.1895 },
  { name: "University of Ghana Main Gate", subtext: "Legon Bypass / N4 Highway", lat: 5.6438, lng: -0.1842 },
  { name: "Balme Library", subtext: "University of Ghana Main Campus", lat: 5.6510, lng: -0.1865 },
  { name: "Night Market (UG Legon)", subtext: "Food & Student Market, UG Legon", lat: 5.6558, lng: -0.1882 },
  { name: "UG Central Cafeteria (CC)", subtext: "University of Ghana Main Campus", lat: 5.6521, lng: -0.1879 },
  { name: "UG Sports Stadium", subtext: "University of Ghana Campus", lat: 5.6415, lng: -0.1865 },
  { name: "Jean Nelson Aka Hall", subtext: "UG Legon Campus", lat: 5.6548, lng: -0.1885 },
  { name: "Alexander Kwapong Hall", subtext: "UG Legon Campus", lat: 5.6552, lng: -0.1895 },
  { name: "Hilla Limann Hall", subtext: "UG Legon Campus", lat: 5.6560, lng: -0.1890 },
  { name: "Elizabeth Frances Sey Hall", subtext: "UG Legon Campus", lat: 5.6555, lng: -0.1878 },
  { name: "A&C Mall", subtext: "Boundary Road, East Legon", lat: 5.6375, lng: -0.1558 },
  { name: "American House", subtext: "Boundary Road / Lagos Ave, East Legon", lat: 5.6418, lng: -0.1532 },
  { name: "Lagos Avenue", subtext: "East Legon commercial hub", lat: 5.6392, lng: -0.1610 },
  { name: "Shiashie", subtext: "East Legon / Tetteh Quarshie Interchange", lat: 5.6265, lng: -0.1742 },
  { name: "Anagkazo / Mensvic Area", subtext: "East Legon", lat: 5.6315, lng: -0.1685 },
  { name: "Accra Mall", subtext: "Tetteh Quarshie Interchange", lat: 5.6205, lng: -0.1745 },
  { name: "Marina Mall", subtext: "Airport City, Accra", lat: 5.6025, lng: -0.1820 },
  { name: "Airport Residential Area", subtext: "Accra", lat: 5.6080, lng: -0.1840 },
  { name: "Madina Zongo Junction", subtext: "Madina, Greater Accra", lat: 5.6730, lng: -0.1660 },
  { name: "Osu (Oxford Street)", subtext: "Osu, Accra", lat: 5.5560, lng: -0.1830 },
  { name: "Cantonments", subtext: "Accra", lat: 5.5820, lng: -0.1720 },
  { name: "Labone", subtext: "Accra", lat: 5.5680, lng: -0.1650 },
  { name: "Spintex Road", subtext: "Batsonaa / Spintex, Accra", lat: 5.6320, lng: -0.1080 },
];

// Fallback landmark category tabs
const FALLBACK_TABS = ["All", "Hostels", "Halls", "Campus", "Gates & Markets", "East Legon", "Greater Accra"] as const;
type FallbackTab = typeof FALLBACK_TABS[number];

// Categorised landmark list for the fallback UI
const FALLBACK_LANDMARKS: (SearchResult & { category: FallbackTab })[] = [
  { name: "Evandy Hostel", subtext: "UG Legon Campus, near Pentagon & TF", lat: 5.6593, lng: -0.1932, category: "Hostels" },
  { name: "Pentagon Hostel (Blocks A, B, C)", subtext: "UG Legon Campus, North Legon", lat: 5.6582, lng: -0.1915, category: "Hostels" },
  { name: "TF Hostel (Hostel Annex)", subtext: "UG Legon Campus, near Pentagon", lat: 5.6575, lng: -0.1902, category: "Hostels" },
  { name: "Bani Hostel", subtext: "UG Legon Campus, near Pentagon", lat: 5.6601, lng: -0.1925, category: "Hostels" },
  { name: "African Union (AU) Hostel", subtext: "UG Legon Campus", lat: 5.6565, lng: -0.1938, category: "Hostels" },
  { name: "Jean Nelson Aka Hall", subtext: "UG Legon Campus", lat: 5.6548, lng: -0.1885, category: "Hostels" },
  { name: "Alexander Kwapong Hall", subtext: "UG Legon Campus", lat: 5.6552, lng: -0.1895, category: "Hostels" },
  { name: "Hilla Limann Hall", subtext: "UG Legon Campus", lat: 5.6560, lng: -0.1890, category: "Hostels" },
  { name: "Elizabeth Frances Sey Hall", subtext: "UG Legon Campus", lat: 5.6555, lng: -0.1878, category: "Hostels" },
  { name: "Legon Hall", subtext: "University of Ghana Main Campus", lat: 5.6498, lng: -0.1876, category: "Halls" },
  { name: "Akuafo Hall", subtext: "University of Ghana Main Campus", lat: 5.6515, lng: -0.1872, category: "Halls" },
  { name: "Commonwealth Hall (Vandals)", subtext: "University of Ghana Main Campus", lat: 5.6542, lng: -0.1856, category: "Halls" },
  { name: "Volta Hall", subtext: "University of Ghana Main Campus", lat: 5.6508, lng: -0.1858, category: "Halls" },
  { name: "Mensah Sarbah Hall", subtext: "University of Ghana Main Campus", lat: 5.6472, lng: -0.1895, category: "Halls" },
  { name: "Balme Library", subtext: "University of Ghana Main Campus", lat: 5.6510, lng: -0.1865, category: "Campus" },
  { name: "UG Central Cafeteria (CC)", subtext: "University of Ghana Main Campus", lat: 5.6521, lng: -0.1879, category: "Campus" },
  { name: "UG Sports Stadium", subtext: "University of Ghana Campus", lat: 5.6415, lng: -0.1865, category: "Campus" },
  { name: "UG Main Gate", subtext: "Legon Bypass / N4 Highway", lat: 5.6438, lng: -0.1842, category: "Gates & Markets" },
  { name: "Night Market (UG Legon)", subtext: "Food & Student Market, UG Legon", lat: 5.6558, lng: -0.1882, category: "Gates & Markets" },
  { name: "A&C Mall", subtext: "Boundary Road, East Legon", lat: 5.6375, lng: -0.1558, category: "East Legon" },
  { name: "American House", subtext: "Boundary Road / Lagos Ave, East Legon", lat: 5.6418, lng: -0.1532, category: "East Legon" },
  { name: "Lagos Avenue", subtext: "East Legon commercial hub", lat: 5.6392, lng: -0.1610, category: "East Legon" },
  { name: "Shiashie", subtext: "East Legon / Tetteh Quarshie Interchange", lat: 5.6265, lng: -0.1742, category: "East Legon" },
  { name: "Anagkazo / Mensvic Area", subtext: "East Legon", lat: 5.6315, lng: -0.1685, category: "East Legon" },
  { name: "Accra Mall", subtext: "Tetteh Quarshie Interchange", lat: 5.6205, lng: -0.1745, category: "Greater Accra" },
  { name: "Marina Mall", subtext: "Airport City, Accra", lat: 5.6025, lng: -0.1820, category: "Greater Accra" },
  { name: "Airport Residential Area", subtext: "Accra", lat: 5.6080, lng: -0.1840, category: "Greater Accra" },
  { name: "Madina Zongo Junction", subtext: "Madina, Greater Accra", lat: 5.6730, lng: -0.1660, category: "Greater Accra" },
  { name: "Osu (Oxford Street)", subtext: "Osu, Accra", lat: 5.5560, lng: -0.1830, category: "Greater Accra" },
  { name: "Cantonments", subtext: "Accra", lat: 5.5820, lng: -0.1720, category: "Greater Accra" },
  { name: "Spintex Road", subtext: "Batsonaa / Spintex, Accra", lat: 5.6320, lng: -0.1080, category: "Greater Accra" },
];

/** Controller inside MapContainer to smoothly pan/fly when a search result is picked */
function MapFlyController({ targetPosition }: { targetPosition: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetPosition) {
      map.flyTo([targetPosition.lat, targetPosition.lng], 16, { duration: 1.2 });
    }
  }, [targetPosition, map]);
  return null;
}

/**
 * Inner component: listens for tile load/error events from within the MapContainer context.
 * Calls back to parent when the first tile loads successfully or any tile errors.
 */
function TileMonitor({
  onTileLoad,
  onTileError,
}: {
  onTileLoad: () => void;
  onTileError: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    map.on("tileload", onTileLoad);
    map.on("tileerror", onTileError);
    return () => {
      map.off("tileload", onTileLoad);
      map.off("tileerror", onTileError);
    };
  }, [map, onTileLoad, onTileError]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: CHEF_APEDO_KITCHEN.lat, lng: CHEF_APEDO_KITCHEN.lng }
  );
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  // ── Map tile timeout / fallback state ─────────────────────────────────────
  const [mapTimedOut, setMapTimedOut] = useState(false);
  const tileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tilesLoadedRef = useRef(false);

  useEffect(() => {
    tileTimeoutRef.current = setTimeout(() => {
      if (!tilesLoadedRef.current) {
        setMapTimedOut(true);
      }
    }, 4000);
    return () => {
      if (tileTimeoutRef.current) clearTimeout(tileTimeoutRef.current);
    };
  }, []);

  const handleTileLoad = useCallback(() => {
    if (!tilesLoadedRef.current) {
      tilesLoadedRef.current = true;
      if (tileTimeoutRef.current) clearTimeout(tileTimeoutRef.current);
    }
  }, []);

  const handleTileError = useCallback(() => {
    if (tileTimeoutRef.current) clearTimeout(tileTimeoutRef.current);
    setMapTimedOut(true);
  }, []);

  // ── Fallback landmark selector state ──────────────────────────────────────
  const [fallbackTab, setFallbackTab] = useState<FallbackTab>("All");
  const [fallbackSearch, setFallbackSearch] = useState("");
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);

  const filteredFallbackLandmarks = FALLBACK_LANDMARKS.filter((lm) => {
    const matchesTab = fallbackTab === "All" || lm.category === fallbackTab;
    const clean = fallbackSearch.trim().toLowerCase();
    const matchesSearch =
      clean === "" ||
      lm.name.toLowerCase().includes(clean) ||
      lm.subtext.toLowerCase().includes(clean);
    return matchesTab && matchesSearch;
  });

  const handleFallbackSelect = (item: (typeof FALLBACK_LANDMARKS)[number]) => {
    const coords = { lat: item.lat, lng: item.lng };
    setPosition(coords);
    setSelectedLandmark(item.name);
    onLocationSelect(coords, item.name);
  };

  // ── Geolocation ───────────────────────────────────────────────────────────
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("GPS is not supported on this device.");
      return;
    }
    setIsGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setFlyTarget(coords);
        setSelectedLandmark("My Location (GPS)");
        onLocationSelect(coords, "My Location (GPS)");
        setIsGeolocating(false);
      },
      (err) => {
        setIsGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please pick a landmark below.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("Location unavailable. Please pick a landmark below.");
        } else {
          setGeoError("Could not get your location. Please pick a landmark below.");
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // ── Search Bar State (Uber / Bolt Style) ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const clean = query.trim().toLowerCase();
    const localMatches = ACCRA_PRESETS.filter(
      (item) =>
        item.name.toLowerCase().includes(clean) ||
        item.subtext.toLowerCase().includes(clean)
    );
    setSuggestions(localMatches.slice(0, 6));
    setShowDropdown(true);

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Accra, Ghana")}&countrycodes=gh&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const remoteResults: SearchResult[] = data.map((d: any) => ({
            name: d.display_name.split(",")[0] || query,
            subtext: d.display_name.split(",").slice(1, 3).join(",").trim(),
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          }));
          setSuggestions((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
            const filteredRemote = remoteResults.filter((r) => !existingNames.has(r.name.toLowerCase()));
            return [...prev, ...filteredRemote].slice(0, 6);
          });
        }
      } catch (err) {
        console.warn("Nominatim search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectSuggestion = (item: SearchResult) => {
    const coords = { lat: item.lat, lng: item.lng };
    setPosition(coords);
    setFlyTarget(coords);
    setSearchQuery(item.name);
    setShowDropdown(false);
    onLocationSelect(coords, item.name);
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(coords);
        onLocationSelect(coords);
      },
    });
    return <Marker position={[position.lat, position.lng]} icon={defaultIcon} />;
  }

  // ── Render: Fallback Landmark Selector ────────────────────────────────────
  if (mapTimedOut) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 flex items-start gap-2.5">
          <span className="text-amber-500 text-base mt-0.5">⚠️</span>
          <div>
            <p className="text-xs font-bold text-amber-800">Map tiles unavailable</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              The map could not load (slow connection). Pick your campus landmark below — your delivery fee &amp; ETA will be calculated instantly.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="map-geolocate-btn"
          onClick={handleGeolocate}
          disabled={isGeolocating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-brand-yellow bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-dark font-bold text-xs transition-all disabled:opacity-60"
        >
          {isGeolocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {isGeolocating ? "Getting your location\u2026" : "Use My Current Location (GPS)"}
        </button>

        {geoError && <p className="text-[11px] text-red-600 font-medium px-1">{geoError}</p>}

        {selectedLandmark && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/40">
            <MapPin className="w-3.5 h-3.5 text-brand-red flex-none" />
            <span className="text-xs font-bold text-brand-dark truncate">{selectedLandmark}</span>
            <span className="text-[10px] text-brand-muted ml-auto font-medium">Selected \u2713</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40 pointer-events-none" />
          <input
            type="text"
            value={fallbackSearch}
            onChange={(e) => setFallbackSearch(e.target.value)}
            placeholder="Search landmarks (e.g. Evandy, Akuafo, A&C)\u2026"
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-brand-cream-dark focus:border-brand-yellow rounded-xl text-xs text-brand-dark placeholder:text-brand-muted/60 outline-none shadow-xs"
            id="landmark-search-input"
          />
          {fallbackSearch && (
            <button
              type="button"
              onClick={() => setFallbackSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist">
          {FALLBACK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={fallbackTab === tab}
              onClick={() => setFallbackTab(tab)}
              className={`flex-none px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                fallbackTab === tab
                  ? "bg-brand-yellow text-brand-dark shadow-sm"
                  : "bg-white border border-brand-cream-dark text-brand-muted hover:border-brand-yellow/60 hover:text-brand-dark"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-brand-cream-dark divide-y divide-brand-cream-dark/50 bg-white shadow-xs">
          {filteredFallbackLandmarks.length === 0 ? (
            <p className="py-6 text-center text-xs text-brand-muted">No landmarks match your search.</p>
          ) : (
            filteredFallbackLandmarks.map((lm) => (
              <button
                key={lm.name}
                type="button"
                onClick={() => handleFallbackSelect(lm)}
                className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-brand-cream/70 ${
                  selectedLandmark === lm.name ? "bg-brand-yellow/10" : ""
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-brand-yellow/20 flex items-center justify-center flex-none mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-brand-dark truncate">{lm.name}</div>
                  <div className="text-[11px] text-brand-muted truncate">{lm.subtext}</div>
                </div>
                {selectedLandmark === lm.name && (
                  <div className="flex-none text-brand-yellow font-bold text-xs mt-0.5">\u2713</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Render: Normal Map UI ─────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div className="relative z-30" ref={dropdownRef}>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-brand-dark/50 pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-yellow-dark" />
            ) : (
              <Search className="w-4 h-4 text-brand-dark/60" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => { if (searchQuery.trim().length > 0) setShowDropdown(true); }}
            placeholder="Search hostel, hall, gate, or landmark (e.g. Evandy, Pentagon, A&C)..."
            className="w-full pl-10 pr-9 py-3 bg-white border border-brand-cream-dark focus:border-brand-yellow rounded-xl text-xs sm:text-sm text-brand-dark placeholder:text-brand-muted/60 outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false); }}
              className="absolute right-3 text-brand-muted hover:text-brand-dark p-0.5 rounded-full hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-cream-dark rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-brand-cream-dark/50">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-brand-cream/70 flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-brand-yellow/20 flex items-center justify-center flex-none mt-0.5 text-brand-dark">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-brand-dark truncate">{item.name}</div>
                  <div className="text-[11px] text-brand-muted truncate">{item.subtext}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[320px] rounded-2xl overflow-hidden border-2 border-brand-cream-dark shadow-inner relative z-0">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileMonitor onTileLoad={handleTileLoad} onTileError={handleTileError} />
          <MapFlyController targetPosition={flyTarget} />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
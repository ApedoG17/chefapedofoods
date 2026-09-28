"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react";

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

// Pre-indexed hotspot landmarks around University of Ghana & Greater Accra for instantaneous zero-latency search
const ACCRA_PRESETS: SearchResult[] = [
  // UG Legon Campus & Hostels
  { name: "Evandy Hostel", subtext: "UG Legon Campus, near Pentagon & TF", lat: 5.6593, lng: -0.1932 },
  { name: "Pentagon Hall (Blocks A, B, C)", subtext: "UG Legon Campus, North Legon", lat: 5.6582, lng: -0.1915 },
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

  // East Legon Hubs
  { name: "A&C Mall", subtext: "Boundary Road, East Legon", lat: 5.6375, lng: -0.1558 },
  { name: "American House", subtext: "Boundary Road / Lagos Ave, East Legon", lat: 5.6418, lng: -0.1532 },
  { name: "Lagos Avenue", subtext: "East Legon commercial hub", lat: 5.6392, lng: -0.1610 },
  { name: "Starbites (East Legon)", subtext: "Lagos Ave, East Legon", lat: 5.6385, lng: -0.1625 },
  { name: "Shiashie", subtext: "East Legon / Tetteh Quarshie Interchange", lat: 5.6265, lng: -0.1742 },
  { name: "Anagkazo / Mensvic Area", subtext: "East Legon", lat: 5.6315, lng: -0.1685 },
  { name: "Underbridge (East Legon)", subtext: "East Legon / Spintex link", lat: 5.6340, lng: -0.1680 },

  // Greater Accra Points of Interest
  { name: "Accra Mall", subtext: "Tetteh Quarshie Interchange", lat: 5.6205, lng: -0.1745 },
  { name: "Marina Mall", subtext: "Airport City, Accra", lat: 5.6025, lng: -0.1820 },
  { name: "Airport Residential Area", subtext: "Accra", lat: 5.6080, lng: -0.1840 },
  { name: "Madina Zongo Junction", subtext: "Madina, Greater Accra", lat: 5.6730, lng: -0.1660 },
  { name: "Osu (Oxford Street)", subtext: "Osu, Accra", lat: 5.5560, lng: -0.1830 },
  { name: "Cantonments", subtext: "Accra", lat: 5.5820, lng: -0.1720 },
  { name: "Labone", subtext: "Accra", lat: 5.5680, lng: -0.1650 },
  { name: "Spintex Road", subtext: "Batsonaa / Spintex, Accra", lat: 5.6320, lng: -0.1080 },
];

/**
 * Controller inside MapContainer to smoothly pan/fly when a search result is picked
 */
function MapFlyController({ targetPosition }: { targetPosition: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetPosition) {
      map.flyTo([targetPosition.lat, targetPosition.lng], 16, { duration: 1.2 });
    }
  }, [targetPosition, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  // Default center: Accra, Ghana (vicinity of University of Ghana / East Legon: 5.6505, -0.1870)
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || {
      lat: 5.6505,
      lng: -0.1870,
    }
  );

  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Search Bar State (Uber / Bolt Style)
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const clean = query.trim().toLowerCase();

    // 1. Instant local matching against campus & Accra presets
    const localMatches = ACCRA_PRESETS.filter(
      (item) =>
        item.name.toLowerCase().includes(clean) ||
        item.subtext.toLowerCase().includes(clean)
    );

    setSuggestions(localMatches.slice(0, 6));
    setShowDropdown(true);

    // 2. Also query OpenStreetMap Nominatim for any other addresses in Ghana (debounced)
    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ", Accra, Ghana"
          )}&countrycodes=gh&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const remoteResults: SearchResult[] = data.map((d: any) => ({
            name: d.display_name.split(",")[0] || query,
            subtext: d.display_name.split(",").slice(1, 3).join(",").trim(),
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          }));

          // Merge without exact duplicates
          setSuggestions((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
            const filteredRemote = remoteResults.filter(
              (r) => !existingNames.has(r.name.toLowerCase())
            );
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

  // When user selects a suggestion from the Uber/Bolt dropdown
  const handleSelectSuggestion = (item: SearchResult) => {
    const coords = { lat: item.lat, lng: item.lng };
    setPosition(coords);
    setFlyTarget(coords);
    setSearchQuery(item.name);
    setShowDropdown(false);
    onLocationSelect(coords, item.name);
  };

  // This sub-component listens for direct clicks on the map to move the pin
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

  return (
    <div className="space-y-2">
      {/* Uber / Bolt Style Location Search Bar */}
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
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowDropdown(true);
            }}
            placeholder="Search hostel, hall, gate, or landmark (e.g. Evandy, Pentagon, A&C)..."
            className="w-full pl-10 pr-9 py-3 bg-white border border-brand-cream-dark focus:border-brand-yellow rounded-xl text-xs sm:text-sm text-brand-dark placeholder:text-brand-muted/60 outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="absolute right-3 text-brand-muted hover:text-brand-dark p-0.5 rounded-full hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Uber/Bolt Style Floating Suggestions Dropdown */}
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

      {/* The Interactive Map Viewport */}
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
          <MapFlyController targetPosition={flyTarget} />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}

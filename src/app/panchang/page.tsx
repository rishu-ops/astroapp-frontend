'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  usePanchangQuery,
  usePanchangPreferencesQuery,
  useSavePreferencesMutation,
} from '@/hooks/usePanchang';
import {
  Sun,
  Moon,
  Calendar,
  MapPin,
  Share2,
  Compass,
  Award,
  Sparkles,
  Info,
  Clock,
  Check,
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';

// Preset major cities for high usability
const PRESET_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tzone: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tzone: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tzone: 5.5 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, tzone: 0.0 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tzone: -5.0 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, tzone: 9.0 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, tzone: 10.0 },
];

export default function PanchangPage() {
  const { user, isAuthenticated } = useAuthStore();
  const savePreferenceMutation = useSavePreferencesMutation();

  // State parameters initialized to standard default (New Delhi)
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [tzone, setTzone] = useState(5.5);
  const [cityName, setCityName] = useState('New Delhi');
  const [shareFeedback, setShareFeedback] = useState(false);
  const [savePrefFeedback, setSavePrefFeedback] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');

  // 1. Fetch user's saved default preference if authenticated
  const { data: userPref, isLoading: isPrefLoading } = usePanchangPreferencesQuery(isAuthenticated);

  // Set parameters once saved preferences load successfully
  useEffect(() => {
    if (userPref) {
      setLat(userPref.latitude);
      setLng(userPref.longitude);
      setTzone(userPref.timezone);
      setCityName(userPref.cityName);
    }
  }, [userPref]);

  // Read coordinates from URL parameters if sharing a link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlDate = searchParams.get('date');
      const urlLat = searchParams.get('lat');
      const urlLng = searchParams.get('lng');
      const urlTzone = searchParams.get('tzone');
      const urlCity = searchParams.get('city');

      if (urlDate) setDate(urlDate);
      if (urlLat) setLat(parseFloat(urlLat));
      if (urlLng) setLng(parseFloat(urlLng));
      if (urlTzone) setTzone(parseFloat(urlTzone));
      if (urlCity) setCityName(urlCity);
    }
  }, []);

  // 2. Fetch primary Panchang details
  const { data: panchang, isLoading: isPanchangLoading, error: panchangError } = usePanchangQuery({
    date,
    latitude: lat,
    longitude: lng,
    timezone: tzone,
  });

  // Action: Select pre-filled major cities
  const handleCitySelect = (cityNameSelected: string) => {
    const city = PRESET_CITIES.find(c => c.name === cityNameSelected);
    if (city) {
      setLat(city.lat);
      setLng(city.lng);
      setTzone(city.tzone);
      const baseName = city.name.split(',')[0];
      setCityName(baseName);
      setCustomCityInput('');
    }
  };

  // Action: Retrieve browser geolocation coordinates
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = parseFloat(position.coords.latitude.toFixed(4));
        const userLng = parseFloat(position.coords.longitude.toFixed(4));
        
        // Approximate timezone from local system
        const userTzone = parseFloat((-new Date().getTimezoneOffset() / 60).toFixed(1));
        
        setLat(userLat);
        setLng(userLng);
        setTzone(userTzone);
        setCityName('Current Location');
        setCustomCityInput('');
      },
      (error) => {
        alert(`Location permission denied: ${error.message}`);
      }
    );
  };

  // Action: Save preferred coordinates
  const handleSavePreference = async () => {
    if (!isAuthenticated) return;
    try {
      await savePreferenceMutation.mutateAsync({
        latitude: lat,
        longitude: lng,
        timezone: tzone,
        cityName: cityName || 'My Home',
      });
      setSavePrefFeedback(true);
      setTimeout(() => setSavePrefFeedback(false), 3000);
    } catch (err) {
      console.error('Failed to save default location preference:', err);
    }
  };

  // Action: Copy share link
  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const base = window.location.origin + window.location.pathname;
    const queryStr = `?date=${date}&lat=${lat}&lng=${lng}&tzone=${tzone}&city=${encodeURIComponent(cityName)}`;
    navigator.clipboard.writeText(base + queryStr);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 3000);
  };

  // Change Date offset actions
  const adjustDate = (daysOffset: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + daysOffset);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* ─── Stellar Hero Header ─── */}
      <section className="bg-gradient-to-b from-brand-navy via-slate-900 to-slate-950 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Constellation background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-semibold border border-brand-orange/30 mb-3">
                <Sparkles className="h-3 w-3" />
                Vedic Muhurat & Astrology
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Daily Hindu Panchang</h1>
              <p className="text-white/60 text-sm md:text-base mt-2 max-w-xl">
                Get high-fidelity daily solar timings, Vedic moon phases (Tithi), constellations (Nakshatra), yogas, and auspicious Muhurats.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold flex items-center gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                {shareFeedback ? 'Link Copied!' : 'Share Page'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Controls & Location Panel ─── */}
      <main className="container py-14 flex-1 -mt-8 relative z-20 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Box */}
          <Card className="lg:col-span-1 border-border shadow-md bg-white rounded-2xl h-fit">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-brand-navy">
                <Compass className="h-5 w-5 text-brand-orange" />
                Coordinates & Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              
              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Query Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 font-semibold text-slate-700 bg-slate-50 border-slate-200 focus:border-brand-orange focus:bg-white"
                  />
                </div>
                
                {/* Quick adjustments */}
                <div className="grid grid-cols-3 gap-1 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => adjustDate(-1)} className="text-xs border border-slate-100 text-slate-600 hover:bg-slate-50">
                    Yesterday
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    setDate(`${yyyy}-${mm}-${dd}`);
                  }} className="text-xs border border-slate-100 text-brand-navy font-semibold hover:bg-slate-50">
                    Today
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => adjustDate(1)} className="text-xs border border-slate-100 text-slate-600 hover:bg-slate-50">
                    Tomorrow
                  </Button>
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Preset City</label>
                <select
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 focus:border-brand-orange focus:outline-none"
                  value=""
                >
                  <option value="" disabled>-- Select a City --</option>
                  {PRESET_CITIES.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Coordinates Grid */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exact Location Coordinates</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-brand-orange text-xs font-bold flex items-center gap-1 hover:underline"
                    onClick={handleGeolocation}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Use Geolocation
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => {
                        setLat(parseFloat(e.target.value) || 0);
                        setCityName('Custom Lat/Lng');
                      }}
                      className="bg-slate-50 border-slate-200 text-sm font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => {
                        setLng(parseFloat(e.target.value) || 0);
                        setCityName('Custom Lat/Lng');
                      }}
                      className="bg-slate-50 border-slate-200 text-sm font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Timezone Offset (Hours)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={tzone}
                    onChange={(e) => {
                      setTzone(parseFloat(e.target.value) || 0);
                      setCityName('Custom Lat/Lng');
                    }}
                    className="bg-slate-50 border-slate-200 text-sm font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">City Display Label</label>
                  <Input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-sm font-semibold text-slate-700"
                    placeholder="e.g. New Delhi"
                  />
                </div>
              </div>

              {/* Preferences update */}
              {isAuthenticated ? (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <Button
                    onClick={handleSavePreference}
                    disabled={savePreferenceMutation.isPending}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 rounded-xl text-sm py-2 shadow-sm"
                  >
                    {savePrefFeedback ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        Default Saved!
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-brand-gold" />
                        Save as Default Location
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Coordinates will load automatically on your next visit.
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-center bg-slate-50 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    🔑 Sign in to save coordinates as your default astronomical preferences.
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Detailed Panchang Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {isPanchangLoading ? (
              <Card className="border-border shadow-md rounded-2xl h-80 flex flex-col justify-center items-center bg-white">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-semibold text-slate-500 mt-4">Parsing solar orbits & celestial grids...</p>
              </Card>
            ) : panchangError || !panchang ? (
              <Card className="border-border shadow-md rounded-2xl p-6 bg-white text-center">
                <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Operational Failure</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Failed to fetch daily Panchang parameters. Please verify your internet connection or check coordinates offsets.
                </p>
              </Card>
            ) : (
              <>
                
                {/* ─── SECTION 1: Panchang Summary (Solar Timings) ─── */}
                <Card className="border-0 shadow-md bg-gradient-to-r from-slate-900 to-brand-navy text-white rounded-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-brand-gold tracking-wide uppercase flex items-center gap-1.5">
                      <Sun className="h-4 w-4 text-brand-gold fill-brand-gold" />
                      Daily Panchang Summary ({cityName})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      
                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
                        <Calendar className="h-5 w-5 text-brand-orange mx-auto mb-1.5" />
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Hindu Day</span>
                        <span className="text-sm font-extrabold text-white mt-1 block">{panchang.day}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
                        <Sun className="h-5 w-5 text-amber-400 mx-auto mb-1.5 fill-amber-400/20" />
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Sunrise</span>
                        <span className="text-sm font-extrabold text-amber-300 mt-1 block">{panchang.sunrise}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
                        <Sun className="h-5 w-5 text-rose-400 mx-auto mb-1.5 fill-rose-400/10" />
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Sunset</span>
                        <span className="text-sm font-extrabold text-rose-300 mt-1 block">{panchang.sunset}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
                        <Moon className="h-5 w-5 text-indigo-400 mx-auto mb-1.5 fill-indigo-400/20" />
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Moonrise</span>
                        <span className="text-sm font-extrabold text-indigo-300 mt-1 block">{panchang.moonrise}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
                        <Moon className="h-5 w-5 text-sky-400 mx-auto mb-1.5" />
                        <span className="text-[10px] text-white/50 block font-bold uppercase">Moonset</span>
                        <span className="text-sm font-extrabold text-sky-300 mt-1 block">{panchang.moonset}</span>
                      </div>

                    </div>

                    {/* Paksha & Ritu Subheader details */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-4 border-t border-white/10 text-sm font-semibold text-white/80">
                      <div>
                        <span>Paksha: </span>
                        <span className="text-brand-orange">{panchang.paksha}</span>
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                      <div>
                        <span>Ritu (Season): </span>
                        <span className="text-brand-gold">{panchang.ritu}</span>
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                      <div>
                        <span>Sun Sign: </span>
                        <span className="text-amber-400">{panchang.sunSign}</span>
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                      <div>
                        <span>Moon Sign: </span>
                        <span className="text-sky-400">{panchang.moonSign}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ─── SECTION 2: The Four Sacred Limbs (Tithi, Nakshatra, Yog, Karan) ─── */}
                <h3 className="text-lg font-extrabold text-brand-navy flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-orange" />
                  Sacred Limbs of the Day
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Tithi Section */}
                  <Card className="border border-border bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row justify-between items-center">
                      <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                        Tithi (Lunar Day)
                      </CardTitle>
                      <span className="text-xs font-bold bg-orange-50 text-brand-orange px-2 py-0.5 rounded-md border border-brand-orange/10">
                        No. {panchang.tithi.number || '—'}
                      </span>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tithi Name</span>
                        <h4 className="text-xl font-extrabold text-brand-navy mt-0.5">{panchang.tithi.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                        <div>
                          <span className="text-xs font-bold text-slate-400 block">Deity</span>
                          <span className="text-slate-700 block mt-0.5">{panchang.tithi.deity}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Ends At
                          </span>
                          <span className="text-slate-700 block mt-0.5">{panchang.tithi.endTime}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Astrological Summary</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{panchang.tithi.summary}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nakshatra Section */}
                  <Card className="border border-border bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row justify-between items-center">
                      <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                        Nakshatra (Constellation)
                      </CardTitle>
                      <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md border border-purple-500/10">
                        Ruler: {panchang.nakshatra.ruler || '—'}
                      </span>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nakshatra Name</span>
                        <h4 className="text-xl font-extrabold text-brand-navy mt-0.5">{panchang.nakshatra.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                        <div>
                          <span className="text-xs font-bold text-slate-400 block">Deity</span>
                          <span className="text-slate-700 block mt-0.5">{panchang.nakshatra.deity}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Ends At
                          </span>
                          <span className="text-slate-700 block mt-0.5">{panchang.nakshatra.endTime}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Astrological Summary</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{panchang.nakshatra.summary}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yog Section */}
                  <Card className="border border-border bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                      <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Yog (Solar-Lunar Combo)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yog Name</span>
                        <h4 className="text-xl font-extrabold text-brand-navy mt-0.5">{panchang.yog.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                        <div>
                          <span className="text-xs font-bold text-slate-400 block">Occult Meaning</span>
                          <span className="text-slate-700 block mt-0.5">{panchang.yog.meaning}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Ends At
                          </span>
                          <span className="text-slate-700 block mt-0.5">{panchang.yog.endTime}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Significance</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{panchang.yog.special}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Karan Section */}
                  <Card className="border border-border bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                      <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        Karan (Half-Tithi)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Karan Name</span>
                        <h4 className="text-xl font-extrabold text-brand-navy mt-0.5">{panchang.karan.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                        <div>
                          <span className="text-xs font-bold text-slate-400 block">Deity</span>
                          <span className="text-slate-700 block mt-0.5">{panchang.karan.deity}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Ends At
                          </span>
                          <span className="text-slate-700 block mt-0.5">{panchang.karan.endTime}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Significance</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{panchang.karan.special}</p>
                      </div>
                    </CardContent>
                  </Card>

                </div>

                {/* ─── SECTION 3: Muhurat & Kaal Timings (Auspicious vs Malefic) ─── */}
                <h3 className="text-lg font-extrabold text-brand-navy flex items-center gap-2 pt-2">
                  <Clock className="h-5 w-5 text-brand-orange" />
                  Stellar Timings & Muhurats
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Auspicious Muhuratas */}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl overflow-hidden">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <Sparkles className="h-5 w-5 text-brand-gold fill-brand-gold" />
                        Auspicious Muhurat
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-4">
                      
                      <div className="bg-white/10 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-amber-100">Abhijit Muhurat</span>
                          <span className="text-base font-extrabold text-white">
                            {panchang.abhijitMuhurta.startTime} - {panchang.abhijitMuhurta.endTime}
                          </span>
                        </div>
                        <p className="text-xs text-amber-55 mt-2 leading-relaxed opacity-90">
                          Highly auspicious solar timing for starting any new career activities, signing business agreements, or conducting sacred ceremonies.
                        </p>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Malefic / Cautious Kaals */}
                  <Card className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        Cautious Kaal Periods
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-500/10">
                        Caution
                      </span>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">Rahukaal</span>
                          <span className="text-[10px] text-slate-400">Avoid new financial ventures</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-800">
                          {panchang.rahukaal.startTime} - {panchang.rahukaal.endTime}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">Gulikaal</span>
                          <span className="text-[10px] text-slate-400">Caution in regular daily chores</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-800">
                          {panchang.gulikaal.startTime} - {panchang.gulikaal.endTime}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">Yamghant Kaal</span>
                          <span className="text-[10px] text-slate-400">Avoid critical travel plans</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-800">
                          {panchang.yamghantKaal.startTime} - {panchang.yamghantKaal.endTime}
                        </span>
                      </div>

                    </CardContent>
                  </Card>

                </div>

              </>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

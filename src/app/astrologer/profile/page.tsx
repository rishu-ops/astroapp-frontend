'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { astrologerService } from '@/services/astrologer.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Astrologer, DaySchedule, WeeklySchedule } from '@/types';
import {
  CheckCircle, Upload, Image as ImageIcon, Briefcase, Clock,
  DollarSign, CreditCard, FileCheck, Zap, ChevronRight, ChevronLeft,
  Loader2, Star, AlertCircle, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { key: 'photos', label: 'Profile Photos', icon: ImageIcon },
  { key: 'about', label: 'About Me', icon: Star },
  { key: 'professional', label: 'Professional', icon: Briefcase },
  { key: 'availability', label: 'Availability', icon: Clock },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'kyc', label: 'KYC', icon: FileCheck },
  { key: 'payout', label: 'Payout', icon: CreditCard },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EXPERTISE_LIST = ['Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 'Vastu Shastra', 'KP Astrology', 'Nadi Astrology', 'Prashna Kundali', 'Lal Kitab', 'Angel Cards', 'Dream Analysis'];
const CATEGORIES_LIST = ['Love & Marriage', 'Career & Finance', 'Health', 'Business', 'Education', 'Family', 'Travel', 'Spirituality', 'Property'];

export default function ProfileCompletionPage() {
  const [activeSection, setActiveSection] = useState('photos');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => astrologerService.getMyApplication().then(r => r.data.data),
  });

  const astrologer = data?.astrologer as Astrologer | undefined;
  const progress = data?.progress;

  const [sectionError, setSectionError] = useState('');

  const updateSection = useMutation({
    mutationFn: (payload: Record<string, unknown>) => astrologerService.updateSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      setSectionError('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to save. Please try again.';
      setSectionError(msg);
    },
  });

  const [goLiveError, setGoLiveError] = useState('');

  const goLive = useMutation({
    mutationFn: () => astrologerService.goLive(),
    onSuccess: () => {
      // Invalidate public astrologers list so the new live astrologer appears
      queryClient.invalidateQueries({ queryKey: ['astrologers'] });
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      router.push('/astrologer?welcome=1');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to go live. Please try again.';
      setGoLiveError(msg);
    },
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (astrologer?.applicationStatus !== 'approved') {
    return (
      <ProtectedRoute allowedRoles={['astrologer']}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold">Profile completion requires approval</h2>
          <Button onClick={() => router.push('/astrologer/application')} variant="outline">
            Check Application Status
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['astrologer']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        <div className="bg-brand-navy text-white py-6">
          <div className="container">
            <h1 className="text-xl font-extrabold">Complete Your Profile</h1>
            <div className="flex items-center gap-3 mt-2">
              <Progress value={progress?.percentage || 0} className="flex-1 h-2 bg-white/20" />
              <span className="text-sm text-white/70 shrink-0">{progress?.percentage || 0}% done</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex container gap-6 py-6">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 hidden md:block">
            <nav className="space-y-1 sticky top-20">
              {SECTIONS.map(({ key, label, icon: Icon }) => {
                const sectionProgress = progress?.sections.find(s => s.key === key);
                const done = sectionProgress?.done;
                const isRequired = (sectionProgress as any)?.required;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                      activeSection === key
                        ? 'bg-brand-orange text-white shadow-sm'
                        : 'text-foreground/70 hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{label.replace(' ★', '')}</span>
                    {isRequired && !done && (
                      <span className={cn('text-[10px] font-bold px-1 rounded shrink-0',
                        activeSection === key ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600')}>
                        req
                      </span>
                    )}
                    {done && <CheckCircle className={cn('h-3.5 w-3.5 shrink-0', activeSection === key ? 'text-white/80' : 'text-green-500')} />}
                  </button>
                );
              })}

              {/* Go Live — enabled once core 3 required sections are done */}
              {(() => {
                const requiredKeys = ['photos', 'about', 'pricing'];
                const allRequiredDone = requiredKeys.every(k =>
                  progress?.sections.find(s => s.key === k)?.done
                );
                return (
                  <div className="mt-4 space-y-2">
                    {goLiveError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex gap-2">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {goLiveError}
                      </div>
                    )}
                    <Button
                      className={cn('w-full border-0 text-white font-bold gap-2',
                        allRequiredDone ? 'orange-gradient' : 'bg-muted text-muted-foreground cursor-not-allowed')}
                      onClick={() => { setGoLiveError(''); goLive.mutate(); }}
                      disabled={goLive.isPending || !allRequiredDone}
                      title={!allRequiredDone ? 'Complete required sections first' : 'Go live!'}
                    >
                      {goLive.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      {allRequiredDone ? 'Go Live!' : 'Complete Required ★'}
                    </Button>
                    {!allRequiredDone && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        Fill ★ required sections to unlock
                      </p>
                    )}
                  </div>
                );
              })()}

            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-4">
            {sectionError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {sectionError}
              </div>
            )}
            {activeSection === 'photos' && <PhotosSection astrologer={astrologer} onNext={() => setActiveSection('about')} />}
            {activeSection === 'about' && <AboutSection astrologer={astrologer} updateSection={updateSection} onNext={() => setActiveSection('professional')} />}
            {activeSection === 'professional' && <ProfessionalSection astrologer={astrologer} updateSection={updateSection} onNext={() => setActiveSection('availability')} />}
            {activeSection === 'availability' && <AvailabilitySection astrologer={astrologer} updateSection={updateSection} onNext={() => setActiveSection('pricing')} />}
            {activeSection === 'pricing' && <PricingSection astrologer={astrologer} updateSection={updateSection} onNext={() => setActiveSection('kyc')} />}
            {activeSection === 'kyc' && <KycSection astrologer={astrologer} updateSection={updateSection} onNext={() => setActiveSection('payout')} />}
            {activeSection === 'payout' && <PayoutSection astrologer={astrologer} updateSection={updateSection} />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ─── Section Components ─── */

function SectionWrapper({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-brand-navy">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function PhotosSection({ astrologer, onNext }: { astrologer?: Astrologer; onNext: () => void }) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (avatarFile) fd.append('avatar', avatarFile);
      if (coverFile) fd.append('coverPhoto', coverFile);
      galleryFiles.forEach(f => fd.append('gallery', f));
      return astrologerService.uploadPhotos(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      onNext();
    },
  });

  const PhotoUpload = ({ label, file, inputRef, existing, onChange, multi }: {
    label: string; file: File | null | File[]; inputRef: React.RefObject<HTMLInputElement | null>;
    existing?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; multi?: boolean;
  }) => {
    const hasFile = multi ? (file as File[]).length > 0 : !!file || !!existing;
    return (
      <div className="space-y-2">
        <Label className="font-semibold text-sm">{label}</Label>
        <input ref={inputRef} type="file" accept="image/*" multiple={multi} className="hidden" onChange={onChange} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-6 transition-colors',
            hasFile ? 'border-green-500 bg-green-50' : 'border-border hover:border-brand-orange/50 hover:bg-brand-orange/5'
          )}
        >
          {hasFile ? (
            <><CheckCircle className="h-6 w-6 text-green-500" /><span className="text-sm font-medium text-green-700">
              {multi ? `${(file as File[]).length} file(s) selected` : (file as File)?.name || 'Uploaded'}
            </span></>
          ) : (
            <><Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload</span></>
          )}
        </button>
      </div>
    );
  };

  return (
    <SectionWrapper title="Profile Photos" desc="Upload your profile photo, cover photo, and gallery images">
      <PhotoUpload label="Profile Photo *" file={avatarFile} inputRef={avatarRef}
        existing={astrologer?.avatar}
        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
      <PhotoUpload label="Cover Photo" file={coverFile} inputRef={coverRef}
        existing={astrologer?.coverPhoto}
        onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
      <PhotoUpload label="Gallery Images (up to 8)" file={galleryFiles} inputRef={galleryRef}
        onChange={(e) => setGalleryFiles(Array.from(e.target.files || []).slice(0, 8))} multi />
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full"
        onClick={() => upload.mutate()} disabled={upload.isPending || (!avatarFile && !astrologer?.avatar)}>
        {upload.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function AboutSection({ astrologer, updateSection, onNext }: { astrologer?: Astrologer; updateSection: any; onNext: () => void }) {
  const [aboutMe, setAboutMe] = useState(astrologer?.aboutMe || '');
  const [biography, setBiography] = useState(astrologer?.biography || '');

  const save = () => updateSection.mutate({ section: 'about', aboutMe, biography }, { onSuccess: onNext });

  return (
    <SectionWrapper title="About Me" desc="Tell users about your background and approach">
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm">About Me * <span className="text-muted-foreground font-normal">({aboutMe.length}/2000)</span></Label>
        <Textarea rows={4} placeholder="A brief introduction shown on your card..." value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} maxLength={2000} />
      </div>
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm">Detailed Biography <span className="text-muted-foreground font-normal">({biography.length}/5000)</span></Label>
        <Textarea rows={8} placeholder="Your full story, methodology, achievements..." value={biography} onChange={(e) => setBiography(e.target.value)} maxLength={5000} />
      </div>
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full"
        onClick={save} disabled={!aboutMe || updateSection.isPending}>
        {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function ProfessionalSection({ astrologer, updateSection, onNext }: { astrologer?: Astrologer; updateSection: any; onNext: () => void }) {
  const [expertise, setExpertise] = useState<string[]>(astrologer?.expertise || []);
  const [categories, setCategories] = useState<string[]>(astrologer?.consultationCategories || []);
  const [skills, setSkills] = useState(astrologer?.skills?.join(', ') || '');

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const save = () => updateSection.mutate({
    section: 'professional',
    expertise,
    consultationCategories: categories,
    skills: skills.split(',').map(s => s.trim()).filter(Boolean),
  }, { onSuccess: onNext });

  return (
    <SectionWrapper title="Professional Details" desc="Select your expertise areas and consultation categories">
      <div className="space-y-2">
        <Label className="font-semibold text-sm">Expertise Areas *</Label>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_LIST.map(e => (
            <button key={e} type="button" onClick={() => toggle(expertise, setExpertise, e)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                expertise.includes(e) ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:border-brand-orange/50')}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-semibold text-sm">Consultation Categories</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES_LIST.map(c => (
            <button key={c} type="button" onClick={() => toggle(categories, setCategories, c)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                categories.includes(c) ? 'bg-brand-navy text-white border-brand-navy' : 'border-border hover:border-brand-navy/50')}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="font-semibold text-sm">Skills <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
        <Input placeholder="e.g. Kundli Making, Match Making, Career Guidance" value={skills} onChange={e => setSkills(e.target.value)} />
      </div>
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full"
        onClick={save} disabled={!expertise.length || updateSection.isPending}>
        {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function AvailabilitySection({ astrologer, updateSection, onNext }: { astrologer?: Astrologer; updateSection: any; onNext: () => void }) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    const base = astrologer?.weeklySchedule || {};
    return DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: base[d] || { isAvailable: false, slots: [{ start: '09:00', end: '21:00' }] },
    }), {} as WeeklySchedule);
  });

  const toggleDay = (day: string) =>
    setSchedule(s => ({ ...s, [day]: { ...s[day], isAvailable: !s[day].isAvailable } }));

  const updateSlot = (day: string, idx: number, field: 'start' | 'end', val: string) =>
    setSchedule(s => ({
      ...s,
      [day]: { ...s[day], slots: s[day].slots.map((sl, i) => i === idx ? { ...sl, [field]: val } : sl) },
    }));

  const save = () => updateSection.mutate({ section: 'availability', weeklySchedule: schedule }, { onSuccess: onNext });

  return (
    <SectionWrapper title="Availability" desc="Set your weekly schedule for consultations">
      <div className="space-y-3">
        {DAYS.map(day => {
          const d = schedule[day];
          return (
            <div key={day} className={cn('rounded-xl border p-4 transition-colors', d.isAvailable ? 'border-brand-orange/30 bg-brand-orange/5' : 'border-border bg-muted/20')}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm capitalize">{day}</span>
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn('w-12 h-6 rounded-full transition-colors relative', d.isAvailable ? 'bg-brand-orange' : 'bg-muted-foreground/30')}
                >
                  <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', d.isAvailable ? 'left-7' : 'left-1')} />
                </button>
              </div>
              {d.isAvailable && d.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <input type="time" value={slot.start} onChange={e => updateSlot(day, i, 'start', e.target.value)}
                    className="border border-input rounded-md px-2 py-1 text-sm bg-white" />
                  <span className="text-muted-foreground">to</span>
                  <input type="time" value={slot.end} onChange={e => updateSlot(day, i, 'end', e.target.value)}
                    className="border border-input rounded-md px-2 py-1 text-sm bg-white" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full" onClick={save} disabled={updateSection.isPending}>
        {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function PricingSection({ astrologer, updateSection, onNext }: { astrologer?: Astrologer; updateSection: any; onNext: () => void }) {
  const [chat, setChat] = useState(String(astrologer?.chatPricePerMin || ''));
  const [call, setCall] = useState(String(astrologer?.callPricePerMin || ''));
  const [video, setVideo] = useState(String(astrologer?.videoCallPricePerMin || ''));

  const save = () => updateSection.mutate({
    section: 'pricing',
    chatPricePerMin: Number(chat),
    callPricePerMin: Number(call),
    videoCallPricePerMin: Number(video),
  }, { onSuccess: onNext });

  return (
    <SectionWrapper title="Pricing" desc="Set your consultation rates per minute (₹)">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>Set competitive rates. New astrologers typically start between ₹10–₹30/min for chat.</p>
      </div>
      {[
        { label: 'Chat Price per Minute', value: chat, set: setChat, icon: '💬' },
        { label: 'Call Price per Minute', value: call, set: setCall, icon: '📞' },
        { label: 'Video Call Price per Minute', value: video, set: setVideo, icon: '📹' },
      ].map(({ label, value, set, icon }) => (
        <div key={label} className="space-y-1.5">
          <Label className="font-semibold text-sm">{icon} {label} *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
            <Input type="number" min="0" className="pl-8 h-11 bg-white" placeholder="0" value={value} onChange={e => set(e.target.value)} />
          </div>
        </div>
      ))}
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full"
        onClick={save} disabled={!chat || updateSection.isPending}>
        {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function KycSection({ astrologer, updateSection, onNext }: { astrologer?: Astrologer; updateSection: any; onNext: () => void }) {
  const [pan, setPan] = useState(astrologer?.kyc?.panNumber || '');
  const [aadhaar, setAadhaar] = useState(astrologer?.kyc?.aadhaarNumber || '');
  const panDocRef = useRef<HTMLInputElement>(null);
  const aadhaarDocRef = useRef<HTMLInputElement>(null);
  const [panDoc, setPanDoc] = useState<File | null>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const saveKycData = useMutation({
    mutationFn: () => updateSection.mutateAsync({ section: 'kyc', panNumber: pan, aadhaarNumber: aadhaar }),
  });

  const uploadDocs = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (panDoc) fd.append('panDocument', panDoc);
      if (aadhaarDoc) fd.append('aadhaarDocument', aadhaarDoc);
      return astrologerService.uploadKycDocs(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-application'] }),
  });

  const save = async () => {
    if (pan) await saveKycData.mutateAsync();
    if (panDoc || aadhaarDoc) await uploadDocs.mutateAsync();
    onNext();
  };

  return (
    <SectionWrapper title="KYC Verification" desc="Identity verification required for payouts">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>KYC information is encrypted and used only for verification and payouts.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-semibold text-sm">PAN Number *</Label>
          <Input className="h-11 bg-white uppercase" placeholder="ABCDE1234F" value={pan}
            onChange={e => setPan(e.target.value.toUpperCase())} maxLength={10} />
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-sm">Aadhaar Number</Label>
          <Input className="h-11 bg-white" placeholder="12-digit number" value={aadhaar}
            onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'PAN Document', ref: panDocRef, file: panDoc, set: setPanDoc },
          { label: 'Aadhaar Document', ref: aadhaarDocRef, file: aadhaarDoc, set: setAadhaarDoc },
        ].map(({ label, ref, file, set }) => (
          <div key={label} className="space-y-1.5">
            <Label className="font-semibold text-sm">{label}</Label>
            <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => set(e.target.files?.[0] || null)} />
            <button type="button" onClick={() => ref.current?.click()}
              className={cn('w-full h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                file ? 'border-green-500 bg-green-50 text-green-700' : 'border-border hover:border-brand-orange/50 text-muted-foreground')}>
              {file ? <><CheckCircle className="h-4 w-4" />{file.name.slice(0, 16)}...</> : <><Upload className="h-4 w-4" />Upload</>}
            </button>
          </div>
        ))}
      </div>
      <Button className="orange-gradient border-0 text-white font-bold gap-2 w-full"
        onClick={save} disabled={!pan || saveKycData.isPending || uploadDocs.isPending}>
        {(saveKycData.isPending || uploadDocs.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save & Continue <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </SectionWrapper>
  );
}

function PayoutSection({ astrologer, updateSection }: { astrologer?: Astrologer; updateSection: any }) {
  const [form, setForm] = useState({
    accountHolderName: astrologer?.payout?.accountHolderName || '',
    bankAccount: astrologer?.payout?.bankAccount || '',
    ifscCode: astrologer?.payout?.ifscCode || '',
    bankName: astrologer?.payout?.bankName || '',
  });

  const save = () => updateSection.mutate({ section: 'payout', ...form });

  return (
    <SectionWrapper title="Payout Details" desc="Your earnings will be transferred to this account">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        💳 Payouts are processed every 15 days for completed consultations.
      </div>
      {[
        { key: 'accountHolderName', label: 'Account Holder Name', placeholder: 'As per bank records' },
        { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
        { key: 'bankAccount', label: 'Account Number', placeholder: 'Enter account number' },
        { key: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label className="font-semibold text-sm">{label} *</Label>
          <Input className="h-11 bg-white" placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={e => setForm(f => ({ ...f, [key]: key === 'ifscCode' ? e.target.value.toUpperCase() : e.target.value }))} />
        </div>
      ))}
      <Button className="orange-gradient border-0 text-white font-bold w-full"
        onClick={save} disabled={!form.bankAccount || !form.ifscCode || updateSection.isPending}>
        {updateSection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Payout Details ✓'}
      </Button>
    </SectionWrapper>
  );
}

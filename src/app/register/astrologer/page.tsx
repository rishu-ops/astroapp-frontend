'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Star, Loader2, AlertCircle, CheckCircle, Upload,
  User, Briefcase, FileText, ChevronRight, ChevronLeft, Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Schemas per step ─── */
const step1Schema = z.object({
  name: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  displayName: z.string().min(2, 'Display name required'),
  experience: z.coerce.number().min(0, 'Required'),
  primaryExpertise: z.string().min(1, 'Select primary expertise'),
  languages: z.string().min(1, 'At least one language'),
  shortBio: z.string().max(500).optional(),
});

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Professional', icon: Briefcase },
  { id: 3, label: 'Verification', icon: FileText },
];

const EXPERTISE_OPTIONS = [
  'Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 'Vastu Shastra',
  'KP Astrology', 'Nadi Astrology', 'Prashna Kundali', 'Lal Kitab',
];

export default function AstrologerRegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [step1Data, setStep1Data] = useState<z.infer<typeof step1Schema> | null>(null);
  const [step2Data, setStep2Data] = useState<z.infer<typeof step2Schema> | null>(null);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdType, setGovIdType] = useState('Aadhaar');
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const govIdRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const form1 = useForm<z.infer<typeof step1Schema>>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<z.infer<typeof step2Schema>>({ resolver: zodResolver(step2Schema) });

  const register = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      const data = { ...step1Data!, ...step2Data! };

      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('displayName', data.displayName);
      formData.append('experience', String(data.experience));
      formData.append('primaryExpertise', data.primaryExpertise);
      // Split comma-separated languages
      data.languages.split(',').map(l => l.trim()).forEach(l => formData.append('languages', l));
      if (data.shortBio) formData.append('shortBio', data.shortBio);
      formData.append('governmentIdType', govIdType);
      if (govIdFile) formData.append('governmentId', govIdFile);
      certFiles.forEach(f => formData.append('certificationDocs', f));

      return authService.registerAstrologer(formData);
    },
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/astrologer/application');
    },
  });

  const onStep1 = (data: z.infer<typeof step1Schema>) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = (data: z.infer<typeof step2Schema>) => {
    setStep2Data(data);
    setStep(3);
  };

  const apiError = register.error as {
    response?: { data?: { message?: string; errors?: { field: string; message: string }[] } };
  } | null;

  const serverErrors = apiError?.response?.data?.errors;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[38%] bg-brand-navy flex-col p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-7xl flex flex-wrap gap-4 p-8 content-start">
          {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(z => <span key={z}>{z}</span>)}
        </div>
        <Link href="/" className="relative flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-full orange-gradient flex items-center justify-center">
            <Star className="h-4 w-4 fill-white text-white" />
          </div>
          <span className="font-extrabold text-xl">NakshatraChat</span>
        </Link>

        <div className="relative flex-1">
          <h2 className="text-3xl font-extrabold mb-3 leading-tight">
            Join as an Expert<br />Astrologer
          </h2>
          <p className="text-white/60 text-sm mb-10">
            Share your wisdom with millions. A 3-step process to get started.
          </p>

          {/* Steps indicator */}
          <div className="space-y-6">
            {STEPS.map(({ id, label, icon: Icon }) => (
              <div key={id} className={cn('flex items-center gap-4', step > id ? 'opacity-100' : step === id ? 'opacity-100' : 'opacity-30')}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                  step > id ? 'bg-green-500 border-green-500' : step === id ? 'border-brand-gold bg-brand-gold/20' : 'border-white/30'
                )}>
                  {step > id ? <CheckCircle className="h-5 w-5 text-white" /> : <Icon className="h-4 w-4" />}
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', step === id && 'text-brand-gold')}>Step {id}</p>
                  <p className="text-white/60 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs">© 2024 NakshatraChat</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-start justify-center p-6 py-10 overflow-y-auto bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-full orange-gradient flex items-center justify-center">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl">
              <span className="text-brand-orange">Nakshatra</span><span className="text-brand-navy">Chat</span>
            </span>
          </Link>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of {STEPS.length}</span>
              <span>{STEPS[step - 1].label}</span>
            </div>
            <Progress value={(step / STEPS.length) * 100} className="h-1.5" />
          </div>

          {/* API Error */}
          {register.isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {apiError?.response?.data?.message || 'Registration failed. Please try again.'}
              </div>
              {serverErrors && serverErrors.length > 0 && (
                <ul className="pl-6 space-y-1">
                  {serverErrors.map((e) => (
                    <li key={e.field} className="text-xs text-destructive list-disc">
                      <span className="font-medium capitalize">{e.field}</span>: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-extrabold text-brand-navy mb-1">Personal Information</h1>
              <p className="text-muted-foreground text-sm mb-6">Tell us about yourself</p>
              <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Full Name</Label>
                  <Input className="h-11 bg-white" placeholder="As per government ID" {...form1.register('name')} />
                  {form1.formState.errors.name && <p className="text-xs text-destructive">{form1.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Email Address</Label>
                  <Input type="email" className="h-11 bg-white" placeholder="your@email.com" {...form1.register('email')} />
                  {form1.formState.errors.email && <p className="text-xs text-destructive">{form1.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Phone Number</Label>
                  <Input className="h-11 bg-white" placeholder="+91 9999999999" {...form1.register('phone')} />
                  {form1.formState.errors.phone && <p className="text-xs text-destructive">{form1.formState.errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} className="h-11 bg-white pr-9" placeholder="Min 6 chars" {...form1.register('password')} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form1.formState.errors.password && <p className="text-xs text-destructive">{form1.formState.errors.password.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Confirm</Label>
                    <Input type="password" className="h-11 bg-white" placeholder="Repeat" {...form1.register('confirmPassword')} />
                    {form1.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form1.formState.errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 orange-gradient border-0 text-white font-bold gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}

          {/* ── Step 2: Professional Info ── */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-extrabold text-brand-navy mb-1">Professional Details</h1>
              <p className="text-muted-foreground text-sm mb-6">Help users find you</p>
              <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Display Name <span className="text-muted-foreground font-normal">(shown to users)</span></Label>
                  <Input className="h-11 bg-white" placeholder="e.g. Pandit Sharma Ji" {...form2.register('displayName')} />
                  {form2.formState.errors.displayName && <p className="text-xs text-destructive">{form2.formState.errors.displayName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Experience (years)</Label>
                    <Input type="number" className="h-11 bg-white" placeholder="5" {...form2.register('experience')} />
                    {form2.formState.errors.experience && <p className="text-xs text-destructive">{form2.formState.errors.experience.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Languages</Label>
                    <Input className="h-11 bg-white" placeholder="Hindi, English" {...form2.register('languages')} />
                    {form2.formState.errors.languages && <p className="text-xs text-destructive">{form2.formState.errors.languages.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Primary Expertise</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...form2.register('primaryExpertise')}
                  >
                    <option value="">Select expertise</option>
                    {EXPERTISE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {form2.formState.errors.primaryExpertise && <p className="text-xs text-destructive">{form2.formState.errors.primaryExpertise.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Short Bio <span className="text-muted-foreground font-normal">(optional, max 500 chars)</span></Label>
                  <Textarea className="bg-white" rows={3} placeholder="Brief description of your expertise..." {...form2.register('shortBio')} />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1 h-11 orange-gradient border-0 text-white font-bold gap-2">
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ── Step 3: Verification ── */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-extrabold text-brand-navy mb-1">Identity Verification</h1>
              <p className="text-muted-foreground text-sm mb-6">Upload your government ID for verification</p>

              <div className="space-y-5">
                {/* Gov ID */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Government ID Type</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={govIdType}
                    onChange={(e) => setGovIdType(e.target.value)}
                  >
                    {['Aadhaar', 'PAN Card', 'Passport', "Driver's License", 'Voter ID'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-sm">
                    Upload {govIdType} <span className="text-destructive">*</span>
                  </Label>
                  <input ref={govIdRef} type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={(e) => setGovIdFile(e.target.files?.[0] || null)} />
                  <button
                    type="button"
                    onClick={() => govIdRef.current?.click()}
                    className={cn(
                      'w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-sm',
                      govIdFile ? 'border-green-500 bg-green-50 text-green-700' : 'border-border hover:border-brand-orange/50 hover:bg-brand-orange/5 text-muted-foreground'
                    )}
                  >
                    {govIdFile ? (
                      <><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-medium">{govIdFile.name}</span></>
                    ) : (
                      <><Upload className="h-5 w-5" /><span>Click to upload (JPG, PNG, PDF · max 10MB)</span></>
                    )}
                  </button>
                </div>

                {/* Certifications (optional) */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">
                    Certifications <span className="text-muted-foreground font-normal">(optional, up to 5)</span>
                  </Label>
                  <input ref={certRef} type="file" accept="image/*,application/pdf" multiple className="hidden"
                    onChange={(e) => setCertFiles(Array.from(e.target.files || []).slice(0, 5))} />
                  <button
                    type="button"
                    onClick={() => certRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-sm text-muted-foreground hover:border-brand-orange/50 hover:bg-brand-orange/5"
                  >
                    <Upload className="h-4 w-4" />
                    {certFiles.length > 0 ? `${certFiles.length} file(s) selected` : 'Upload certificates (optional)'}
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">📋 What happens next?</p>
                  <p>1. Your application will be reviewed by our team (usually 24-48 hours)</p>
                  <p>2. Once approved, complete your profile to go live</p>
                  <p>3. Start receiving consultation requests</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(2)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 orange-gradient border-0 text-white font-bold"
                    onClick={() => register.mutate()}
                    disabled={register.isPending}
                  >
                    {register.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
                    ) : 'Submit Application'}
                  </Button>
                </div>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

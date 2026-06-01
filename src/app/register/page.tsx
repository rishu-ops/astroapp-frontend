'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  phone: z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

const PERKS = [
  'First consultation absolutely free',
  '48,000+ verified astrologers',
  'Chat in 13 languages',
  '24×7 availability',
];

export default function RegisterPage() {
  const { registerUser } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const apiError = registerUser.error as { response?: { data?: { message?: string } } } | null;

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-[42%] bg-brand-navy flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-8xl flex flex-wrap gap-6 p-8 content-start">
          {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(z => <span key={z}>{z}</span>)}
        </div>
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full orange-gradient flex items-center justify-center">
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="font-extrabold text-2xl">NakshatraChat</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">Start your cosmic journey today</h2>
          <p className="text-white/60 text-base mb-8">Join 32 million people who trust NakshatraChat.</p>
          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-brand-gold shrink-0" />
                <span className="text-white/70">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/30 text-sm">© 2024 NakshatraChat</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full orange-gradient flex items-center justify-center">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl">
              <span className="text-brand-orange">Nakshatra</span><span className="text-brand-navy">Chat</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Create account</h1>
          <p className="text-muted-foreground mb-6">Join NakshatraChat for free today</p>

          {/* Role choice */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border-2 border-brand-orange rounded-xl p-4 text-center bg-brand-orange/5">
              <p className="text-2xl mb-1">👤</p>
              <p className="font-bold text-sm text-brand-orange">User</p>
              <p className="text-xs text-muted-foreground">Get guidance</p>
            </div>
            <Link href="/register/astrologer">
              <div className="border-2 border-border rounded-xl p-4 text-center hover:border-brand-navy/40 hover:bg-muted/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center">
                <p className="text-2xl mb-1">🔮</p>
                <p className="font-bold text-sm">Astrologer</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Join as expert <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {apiError.response?.data?.message || 'Registration failed.'}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => registerUser.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">Full Name</Label>
              <Input className="h-11 bg-white" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Email</Label>
              <Input type="email" className="h-11 bg-white" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Password</Label>
              <Input type="password" className="h-11 bg-white" placeholder="Min 6 characters" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input className="h-11 bg-white" placeholder="+91 9999999999" {...register('phone')} />
            </div>
            <Button
              type="submit"
              className="w-full h-11 orange-gradient border-0 text-white font-bold shadow-md hover:opacity-90"
              disabled={registerUser.isPending}
            >
              {registerUser.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>
                : 'Create Free Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

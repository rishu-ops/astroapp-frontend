'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'user' | 'astrologer' | 'admin';

const ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: 'user', label: 'User', emoji: '👤' },
  { value: 'astrologer', label: 'Astrologer', emoji: '🔮' },
  { value: 'admin', label: 'Admin', emoji: '🛡️' },
];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [role, setRole] = useState<Role>('user');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loginAstrologer, loginAdmin } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = role === 'user' ? loginUser : role === 'astrologer' ? loginAstrologer : loginAdmin;
  const apiError = mutation.error as { response?: { data?: { message?: string } } } | null;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] orange-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-8xl flex flex-wrap gap-6 p-8 content-start">
          {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(z => <span key={z}>{z}</span>)}
        </div>
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="font-extrabold text-2xl">NakshatraChat</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Your cosmic guide<br />awaits you
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Connect with 48,000+ verified astrologers for real-time guidance on life, love & career.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[['32M+', 'Happy Users'], ['48K+', 'Astrologers'], ['4.8★', 'App Rating'], ['Free', 'First Chat']].map(([v, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-extrabold">{v}</p>
                <p className="text-white/60 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/40 text-sm">© 2024 NakshatraChat</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full orange-gradient flex items-center justify-center">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl">
              <span className="text-brand-orange">Nakshatra</span><span className="text-brand-navy">Chat</span>
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your NakshatraChat account</p>

          {/* Role tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            {ROLES.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                  role === value
                    ? 'bg-white shadow-sm text-brand-orange'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {apiError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {apiError.response?.data?.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 bg-white"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="h-11 bg-white pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 orange-gradient border-0 text-white font-bold text-base shadow-md hover:shadow-lg hover:opacity-90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Signing in...</>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-orange font-semibold hover:underline">
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

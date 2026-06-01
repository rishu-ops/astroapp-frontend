'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  MessageCircle, Star, LogOut, LayoutDashboard, Menu, X, Phone, Video, ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

const navLinks = [
  { label: 'Consultations', href: '/astrologers' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Search', href: '/search' },
  { label: 'Panchang', href: '/panchang' },
  { label: 'Blog', href: '#' },
];


export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'astrologer') return '/astrologer';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full orange-gradient flex items-center justify-center shadow-sm">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            <span className="text-brand-orange">Nakshatra</span>
            <span className="text-brand-navy">Chat</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Link href={getDashboardLink()} className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground/70">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <NotificationBell />
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Avatar className="h-8 w-8 border-2 border-brand-orange/30">
                  <AvatarFallback className="bg-brand-orange/10 text-brand-orange text-xs font-bold">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-foreground/80 max-w-[100px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground/50 hover:text-destructive"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-foreground/70 hover:text-brand-orange">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="orange-gradient text-white font-semibold shadow-sm hover:shadow-md hover:opacity-90 border-0">
                  Register Free
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-brand-orange/5 hover:text-brand-orange transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)}>
              <div className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-brand-orange/5 hover:text-brand-orange flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </div>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

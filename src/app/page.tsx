import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CosmicAnimation } from '@/components/home/CosmicAnimation';
import {
  MessageCircle, Shield, Clock, Star, Users, Phone,
  CheckCircle, ArrowRight, Sparkles, Heart, Briefcase, Baby,
  TrendingUp, Award, Globe, ChevronRight,
} from 'lucide-react';

const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const STATS = [
  { value: '32M+', label: 'Happy Customers' },
  { value: '48K+', label: 'Expert Astrologers' },
  { value: '1.3B+', label: 'Minutes Consulted' },
  { value: '13', label: 'Languages' },
];

const CATEGORIES = [
  { icon: Heart, label: 'Love & Marriage', color: 'text-rose-500 bg-rose-50' },
  { icon: Briefcase, label: 'Career & Money', color: 'text-blue-500 bg-blue-50' },
  { icon: Baby, label: 'Child & Family', color: 'text-green-500 bg-green-50' },
  { icon: TrendingUp, label: 'Business', color: 'text-purple-500 bg-purple-50' },
  { icon: Shield, label: 'Health', color: 'text-orange-500 bg-orange-50' },
  { icon: Sparkles, label: 'Spiritual', color: 'text-yellow-500 bg-yellow-50' },
];

const WHY_US = [
  {
    icon: Shield,
    title: 'Verified Experts',
    desc: 'Every astrologer is background-checked, interview-screened, and certified before approval.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Connect with online astrologers any time of day or night — we\'re always here.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Chat',
    desc: 'Average reply time under 12 seconds. Get your answers without waiting.',
  },
  {
    icon: Globe,
    title: '13 Languages',
    desc: 'Consult in Hindi, English, Tamil, Telugu, Marathi, Kannada, and 7 more.',
  },
  {
    icon: Award,
    title: 'First Chat Free',
    desc: 'Try your first consultation absolutely free. No credit card required.',
  },
  {
    icon: Users,
    title: 'Huge Community',
    desc: 'Join 32 million users who trust NakshatraChat for life guidance.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    text: 'The astrologer predicted my job change 3 months in advance. Absolutely spot on!',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    text: 'Got clarity on my marriage decision. The guidance was very precise and practical.',
    rating: 5,
    avatar: 'RK',
  },
  {
    name: 'Ananya Singh',
    location: 'Bangalore',
    text: 'Best astrology app! The astrologers are genuine and the chat is instant.',
    rating: 5,
    avatar: 'AS',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="hero-gradient overflow-hidden relative">
        {/* Floating zodiac background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {ZODIAC.map((z, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-5 animate-float"
              style={{
                left: `${(i * 8.33) + Math.sin(i) * 3}%`,
                top: `${20 + Math.cos(i * 0.7) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            >
              {z}
            </span>
          ))}
        </div>

        <div className="container relative py-12 md:py-16 lg:py-24 xl:py-28 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 overflow-visible">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="w-full lg:max-w-[55%] xl:max-w-[50%] shrink-0 text-left z-10">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange/20 mb-6 shadow-sm">
              <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
              4.8 · Trusted by 32 Million+ Customers
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-brand-navy leading-tight mb-4">
              Talk to{' '}
              <span className="text-brand-orange relative">
                Astrologers
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none">
                  <path d="M0 6C50 2 100 7 150 4C200 1 250 6 300 3" stroke="#F97316" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>{' '}
              <br />right now
            </h1>

            <p className="text-xl text-foreground/60 mb-3 font-medium">
              India&apos;s most-loved astrology platform
            </p>
            <p className="text-base text-foreground/50 mb-8 max-w-lg">
              Get instant guidance on love, career, health & life from{' '}
              <strong className="text-foreground/70">48,000+ verified astrologers</strong> via real-time chat.
              First chat is <strong className="text-brand-orange">FREE</strong>.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/astrologers">
                <Button size="lg" className="orange-gradient text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 font-bold text-base px-8 gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Get Free Chat
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="bg-white font-semibold border-2 border-brand-orange/30 text-brand-navy hover:bg-brand-orange/5 text-base px-8">
                  Register Free
                </Button>
              </Link>
            </div>

            {/* Quick trust indicators */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
              {['48,726+ Astrologers', '13 Languages', 'Avg reply &lt;12s', '24×7 Available'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-foreground/60">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t }} />
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Cosmic Astrolabe Animation */}
          <div className="w-full lg:w-auto flex-1 flex justify-center items-center overflow-visible mt-8 lg:mt-0 h-[360px] sm:h-[450px] lg:h-[500px]">
            <div className="scale-[0.65] sm:scale-[0.8] md:scale-[0.85] lg:scale-[1] origin-center shrink-0">
              <CosmicAnimation />
            </div>
          </div>

        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="bg-brand-navy text-white py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="stat-card text-center">
                <span className="text-3xl md:text-4xl font-extrabold text-brand-gold">{value}</span>
                <span className="text-sm text-white/60 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="section-heading">What do you want to know?</h2>
          <p className="section-sub">Pick a topic and get instant guidance from experts</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ icon: Icon, label, color }) => (
            <Link key={label} href="/astrologers">
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border hover:border-brand-orange/30 hover:shadow-md hover:-translate-y-1 transition-all bg-white cursor-pointer group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-center text-foreground/80">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Why Us ─── */}
      <section className="bg-brand-navy/3 py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="section-heading">Why 32 million choose us</h2>
            <p className="section-sub">Everything you need for trusted astrological guidance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-border hover:border-brand-orange/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl orange-gradient flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-brand-navy mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="section-heading">What our users say</h2>
          <p className="section-sub">Real stories from real people</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, location, text, rating, avatar }) => (
            <div key={name} className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full orange-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="container pb-16">
        <div className="orange-gradient rounded-3xl p-10 md:p-14 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Start your free consultation</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              First chat is completely free. No credit card required. Connect in seconds.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-brand-orange hover:bg-white/90 font-bold text-base px-10 shadow-lg gap-2">
                Get Free Chat Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

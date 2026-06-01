import { Star, Mail, Shield, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

const FOOTER_LINKS = {
  Consultations: [
    { label: 'Chat with Astrologer', href: '/astrologers' },
    { label: 'Talk to Astrologer', href: '/astrologers' },
    { label: 'Love & Relationship', href: '#' },
    { label: 'Career Guidance', href: '#' },
    { label: 'Business Astrology', href: '#' },
  ],
  Horoscope: [
    { label: 'Today\'s Horoscope', href: '#' },
    { label: 'Weekly Horoscope', href: '#' },
    { label: 'Monthly Horoscope', href: '#' },
    { label: 'Yearly Horoscope', href: '#' },
    { label: 'Love Horoscope', href: '#' },
  ],
  'Free Services': [
    { label: 'Free Kundli', href: '#' },
    { label: 'Kundli Matching', href: '#' },
    { label: 'Numerology', href: '#' },
    { label: 'Panchang', href: '#' },
    { label: 'Birth Chart', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const TRUST_BADGES = [
  { icon: Shield, label: 'Private & Confidential' },
  { icon: CheckCircle, label: 'Verified Astrologers' },
  { icon: Lock, label: 'Secure Platform' },
];

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-auto">
      {/* Trust badges */}
      <div className="border-b border-white/10">
        <div className="container py-5">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/70 text-sm">
                <Icon className="h-4 w-4 text-brand-gold" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full orange-gradient flex items-center justify-center">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-extrabold text-xl">
                <span className="text-brand-gold">Nakshatra</span>Chat
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              India&apos;s most trusted astrology platform. Get guidance on love, career, health & life from verified astrologers.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
              <Mail className="h-4 w-4 text-brand-gold" />
              support@nakshatra.chat
            </div>
            <p className="text-xs text-white/30 mt-2">24×7 Chat Support Available</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 w-fit">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i <= 4 ? 'fill-brand-gold text-brand-gold' : 'text-white/20'}`} />
                ))}
              </div>
              <span className="text-sm font-bold">4.8</span>
              <span className="text-xs text-white/40">· 120M+ customers</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-white/50 text-sm hover:text-brand-gold transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} NakshatraChat. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="#" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React from 'react';

// Static seed-free coordinates to prevent hydration mismatches
const PREDEFINED_STARS = [
  { top: '8%', left: '12%', size: 2, delay: '0.2s', duration: '3s' },
  { top: '12%', left: '78%', size: 1.5, delay: '1.2s', duration: '4s' },
  { top: '24%', left: '22%', size: 3, delay: '0.8s', duration: '2.5s' },
  { top: '32%', left: '68%', size: 2, delay: '2.1s', duration: '3.5s' },
  { top: '42%', left: '8%', size: 1.5, delay: '1.5s', duration: '4.5s' },
  { top: '48%', left: '88%', size: 2.5, delay: '0.5s', duration: '3s' },
  { top: '62%', left: '15%', size: 2, delay: '2.5s', duration: '5s' },
  { top: '78%', left: '72%', size: 3, delay: '1.9s', duration: '2.8s' },
  { top: '86%', left: '38%', size: 1.5, delay: '0.3s', duration: '4.2s' },
  { top: '92%', left: '85%', size: 2, delay: '1.7s', duration: '3.3s' },
  { top: '4%', left: '48%', size: 2.5, delay: '1.0s', duration: '3.8s' },
  { top: '56%', left: '42%', size: 1, delay: '2.0s', duration: '2.0s' },
  { top: '82%', left: '12%', size: 2, delay: '0.7s', duration: '4.1s' },
  { top: '18%', left: '92%', size: 1.5, delay: '1.4s', duration: '3.6s' },
  { top: '72%', left: '4%', size: 2.5, delay: '2.3s', duration: '2.9s' },
];

const ZODIAC_DATA = [
  { char: '♈', angle: 30, label: 'Aries' },
  { char: '♉', angle: 60, label: 'Taurus' },
  { char: '♊', angle: 90, label: 'Gemini' },
  { char: '♋', angle: 120, label: 'Cancer' },
  { char: '♌', angle: 150, label: 'Leo' },
  { char: '♍', angle: 180, label: 'Virgo' },
  { char: '♎', angle: 210, label: 'Libra' },
  { char: '♏', angle: 240, label: 'Scorpio' },
  { char: '♐', angle: 270, label: 'Sagittarius' },
  { char: '♑', angle: 300, label: 'Capricorn' },
  { char: '♒', angle: 330, label: 'Aquarius' },
  { char: '♓', angle: 0, label: 'Pisces' },
];

export const CosmicAnimation: React.FC = () => {
  return (
    <div className="cosmic-container relative w-full max-w-[500px] aspect-square flex items-center justify-center select-none cursor-pointer overflow-visible">
      
      {/* ─── Background Radial Yellow Glow ─── */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-200/20 via-yellow-100/5 to-transparent rounded-full blur-3xl pointer-events-none scale-125" />

      {/* ─── Scattered Twinkling Background Stars ─── */}
      {PREDEFINED_STARS.map((star, idx) => (
        <span
          key={idx}
          className="absolute bg-brand-orange rounded-full animate-star-twinkle pointer-events-none opacity-40"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* ─── Shooting Star Effects ─── */}
      <div 
        className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent rotate-[-45deg] animate-shooting-star pointer-events-none"
        style={{
          top: '20%',
          right: '15%',
          animationDelay: '1.2s',
          animationDuration: '9s'
        }}
      />
      <div 
        className="absolute w-28 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rotate-[-45deg] animate-shooting-star pointer-events-none"
        style={{
          top: '65%',
          left: '10%',
          animationDelay: '4.8s',
          animationDuration: '11s'
        }}
      />

      {/* ─── Center Sun ─── */}
      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-brand-orange to-brand-orange-dark animate-sun-pulse z-20 flex items-center justify-center">
        {/* Sub-glowing ring overlay for a premium 3D sun effect */}
        <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent via-amber-200/40 to-white/70" />
      </div>

      {/* ─── Rotating Solar Flare Rings (Right Behind Sun) ─── */}
      <div className="absolute w-40 h-40 animate-spin-cw-slow opacity-30 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="sun-flares" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#F97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path 
            d="M 50 5 L 53 38 L 80 20 L 60 43 L 95 50 L 60 57 L 80 80 L 53 62 L 50 95 L 47 62 L 20 80 L 40 57 L 5 50 L 40 43 L 20 20 L 47 38 Z" 
            fill="url(#sun-flares)" 
          />
        </svg>
      </div>

      {/* ─── Plate 1: Inner Orbit (Clockwise Rotation) ─── */}
      <div className="absolute w-[200px] h-[200px] animate-spin-cw-fast pointer-events-none flex items-center justify-center">
        <svg className="w-full h-full absolute" viewBox="-100 -100 200 200">
          {/* Dotted Inner Orbit Line */}
          <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(249, 115, 22, 0.16)" strokeWidth="1" strokeDasharray="3 4" />
          
          {/* Inner Constellation */}
          <path 
            d="M -30,-30 L 10,-60 L 45,-25 L 15,15" 
            fill="none" 
            stroke="rgba(249, 115, 22, 0.45)" 
            strokeWidth="1.2" 
          />
          
          {/* Constellation Stars */}
          <circle cx="-30" cy="-30" r="3" fill="#F97316" className="animate-pulse" style={{ animationDuration: '2s' }} />
          <circle cx="10" cy="-60" r="2.5" fill="#F59E0B" />
          <circle cx="45" cy="-25" r="3.5" fill="#F97316" />
          <circle cx="15" cy="15" r="2" fill="#F59E0B" className="animate-pulse" style={{ animationDuration: '3s' }} />
        </svg>

        {/* Small Yellow Planet on the Inner Orbit */}
        <div 
          className="absolute w-3 h-3 rounded-full bg-amber-400 planet-glow animate-pulse-planet"
          style={{ 
            color: '#F59E0B', 
            top: 'calc(50% + 53px)', 
            left: 'calc(50% + 60px)' 
          }}
        />
      </div>

      {/* ─── Plate 2: Middle Orbit (Counter-Clockwise Rotation) ─── */}
      <div className="absolute w-[300px] h-[300px] animate-spin-ccw pointer-events-none flex items-center justify-center">
        <svg className="w-full h-full absolute" viewBox="-150 -150 300 300">
          {/* Solid Planetary Orbit Line */}
          <circle cx="0" cy="0" r="125" fill="none" stroke="rgba(15, 23, 42, 0.05)" strokeWidth="1" />
          
          {/* Another Constellation */}
          <path 
            d="M -80,40 L -115,-10 L -60,-65" 
            fill="none" 
            stroke="rgba(249, 115, 22, 0.35)" 
            strokeWidth="1" 
          />
          
          {/* Constellation Stars */}
          <circle cx="-80" cy="40" r="2.5" fill="#F97316" />
          <circle cx="-115" cy="-10" r="3.5" fill="#F59E0B" className="animate-pulse" />
          <circle cx="-60" cy="-65" r="2.5" fill="#F97316" />
        </svg>

        {/* Glowing Coral Planet on Middle Orbit */}
        <div 
          className="absolute w-4 h-4 rounded-full bg-orange-500 planet-glow"
          style={{ 
            color: '#F97316', 
            top: 'calc(50% - 90px)', 
            left: 'calc(50% + 85px)' 
          }}
        />

        {/* Glowing Pink/Red Planet on Middle Orbit (with prominent drop-shadow) */}
        <div 
          className="absolute w-5 h-5 rounded-full bg-rose-400 planet-glow"
          style={{ 
            color: '#F43F5E', 
            top: 'calc(50% + 95px)', 
            left: 'calc(50% - 95px)',
            filter: 'drop-shadow(0 0 10px #F43F5E)'
          }}
        />
      </div>

      {/* ─── Plate 3: Outer Planetary Orbit (Clockwise Rotation) ─── */}
      <div className="absolute w-[380px] h-[380px] animate-spin-cw pointer-events-none flex items-center justify-center">
        <svg className="w-full h-full absolute" viewBox="-190 -190 380 380">
          {/* Outer Dashed Orbit Line */}
          <circle cx="0" cy="0" r="165" fill="none" stroke="rgba(15, 23, 42, 0.05)" strokeWidth="1" strokeDasharray="6 8" />
          
          {/* Fine Constellation Line */}
          <path 
            d="M 60,110 L 120,80 L 140,20 L 95,-60" 
            fill="none" 
            stroke="rgba(249, 115, 22, 0.3)" 
            strokeWidth="1.2" 
          />
          <circle cx="60" cy="110" r="3" fill="#F59E0B" />
          <circle cx="120" cy="80" r="2" fill="#F97316" />
          <circle cx="140" cy="20" r="3" fill="#F59E0B" className="animate-pulse" />
          <circle cx="95" cy="-60" r="2.5" fill="#F97316" />
        </svg>

        {/* Glowing Emerald Green Planet on Outer Orbit */}
        <div 
          className="absolute w-4.5 h-4.5 rounded-full bg-emerald-400 planet-glow"
          style={{ 
            color: '#10B981', 
            top: 'calc(50% - 145px)', 
            left: 'calc(50% + 80px)',
            filter: 'drop-shadow(0 0 8px #10B981)'
          }}
        />

        {/* Glowing Golden Yellow Planet on Outer Orbit */}
        <div 
          className="absolute w-4 h-4 rounded-full bg-yellow-400 planet-glow"
          style={{ 
            color: '#EAB308', 
            top: 'calc(50% - 165px)', 
            left: 'calc(50% + 5px)',
            filter: 'drop-shadow(0 0 6px #EAB308)'
          }}
        />
      </div>

      {/* ─── Plate 4: Outer Zodiac Ring (Slow Clockwise Rotation) ─── */}
      <div className="absolute w-[460px] h-[460px] animate-spin-cw-slow flex items-center justify-center">
        
        {/* Astrolabe Circular Borders */}
        <svg className="w-full h-full absolute pointer-events-none" viewBox="-230 -230 460 460">
          {/* Ticks ring */}
          <circle cx="0" cy="0" r="225" fill="none" stroke="rgba(15, 23, 42, 0.08)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="190" fill="none" stroke="rgba(15, 23, 42, 0.08)" strokeWidth="1.5" />
          
          {/* Astrolabe Tick Marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isMajor = i % 6 === 0;
            const r1 = isMajor ? 225 : 221;
            const r2 = 190;
            const x1 = Math.cos((angle * Math.PI) / 180) * r1;
            const y1 = Math.sin((angle * Math.PI) / 180) * r1;
            const x2 = Math.cos((angle * Math.PI) / 180) * r2;
            const y2 = Math.sin((angle * Math.PI) / 180) * r2;
            return (
              <line 
                key={i} 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="rgba(15, 23, 42, 0.07)" 
                strokeWidth={isMajor ? 1.2 : 0.6} 
              />
            );
          })}
        </svg>

        {/* 12 Zodiac Symbols placed on a circle of radius ~207px */}
        {ZODIAC_DATA.map((z, idx) => {
          const rad = (z.angle * Math.PI) / 180;
          const x = Math.cos(rad) * 207;
          const y = Math.sin(rad) * 207;
          return (
            <div
              key={idx}
              className="absolute text-brand-navy/50 font-medium text-[20px] leading-none select-none cursor-default hover:text-brand-orange hover:font-bold hover:scale-130 transition-all duration-300 pointer-events-auto"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${z.angle + 90}deg)`,
              }}
              title={z.label}
            >
              {z.char}
            </div>
          );
        })}
      </div>
    </div>
  );
};

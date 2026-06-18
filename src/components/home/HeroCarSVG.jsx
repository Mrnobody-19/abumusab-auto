import React from 'react'

const HeroCarSVG = () => {
  return (
    <div className="hero-car-area" style={{ animation: 'float 6s ease-in-out infinite' }}>
      <svg className="car-svg" viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3a6a" stopOpacity="1"/>
            <stop offset="50%" stopColor="#0a1f50" stopOpacity="1"/>
            <stop offset="100%" stopColor="#050a20" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c3ff" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#0a6fff" stopOpacity="0.1"/>
          </linearGradient>
          <linearGradient id="lightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c3ff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#0a6fff" stopOpacity="0.3"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="softglow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <ellipse cx="450" cy="365" rx="340" ry="18" fill="rgba(10,111,255,0.12)"/>
        <path d="M80,300 L80,260 Q100,210 160,190 L220,170 Q280,130 360,120 L540,118 Q640,120 700,145 L760,165 Q800,185 820,220 L830,260 L830,300 Z" fill="url(#bodyGrad)" stroke="rgba(10,111,255,0.4)" strokeWidth="1.5"/>
        <path d="M260,168 Q320,115 420,108 L520,106 Q600,108 650,130 L720,162" fill="none" stroke="rgba(10,111,255,0.3)" strokeWidth="1"/>
        <path d="M265,168 Q300,118 380,110 L500,108 Q560,109 590,125 L620,145 L600,170 Z" fill="url(#glassGrad)" stroke="rgba(0,195,255,0.5)" strokeWidth="1.5"/>
        <path d="M630,145 L680,165 L700,168 L660,170 Z" fill="url(#glassGrad)" stroke="rgba(0,195,255,0.3)" strokeWidth="1"/>
        <path d="M120,295 L120,265 Q130,240 165,230 L750,228 Q790,232 810,255 L810,295 Z" fill="rgba(20,50,120,0.3)" stroke="rgba(10,111,255,0.2)" strokeWidth="1"/>
        <line x1="380" y1="168" x2="380" y2="298" stroke="rgba(10,111,255,0.3)" strokeWidth="1.5"/>
        <line x1="560" y1="162" x2="560" y2="298" stroke="rgba(10,111,255,0.3)" strokeWidth="1.5"/>
        <path d="M82,240 L82,270 Q90,278 115,275 L150,272 L155,240 Z" fill="rgba(0,195,255,0.05)" stroke="rgba(0,195,255,0.4)" strokeWidth="1.5" filter="url(#glow)"/>
        <path d="M88,245 L88,265 L145,263 L148,245 Z" fill="url(#lightGrad)" opacity="0.8" filter="url(#glow)"/>
        <path d="M85,240 L82,238 Q160,225 200,228" stroke="url(#lightGrad)" strokeWidth="2.5" fill="none" filter="url(#glow)"/>
        <path d="M818,242 L822,270 Q815,278 795,275 L760,272 L758,242 Z" fill="rgba(255,50,50,0.08)" stroke="rgba(255,80,80,0.5)" strokeWidth="1.5" filter="url(#glow)"/>
        <path d="M820,246 L820,264 L763,262 L762,246 Z" fill="rgba(255,50,50,0.4)" filter="url(#glow)"/>
        <circle cx="230" cy="300" r="55" fill="#020810" stroke="rgba(10,111,255,0.2)" strokeWidth="1.5"/>
        <circle cx="660" cy="300" r="55" fill="#020810" stroke="rgba(10,111,255,0.2)" strokeWidth="1.5"/>
        <circle cx="230" cy="300" r="48" fill="rgba(15,30,60,0.9)" stroke="rgba(30,80,180,0.6)" strokeWidth="2"/>
        <circle cx="230" cy="300" r="30" fill="rgba(8,20,50,0.8)" stroke="rgba(10,111,255,0.5)" strokeWidth="1.5"/>
        <g stroke="rgba(100,160,255,0.6)" strokeWidth="2">
          <line x1="230" y1="270" x2="230" y2="330"/>
          <line x1="200" y1="300" x2="260" y2="300"/>
          <line x1="209" y1="279" x2="251" y2="321"/>
          <line x1="251" y1="279" x2="209" y2="321"/>
        </g>
        <circle cx="230" cy="300" r="10" fill="rgba(10,111,255,0.8)" stroke="rgba(0,195,255,0.8)" strokeWidth="1.5"/>
        <circle cx="660" cy="300" r="48" fill="rgba(15,30,60,0.9)" stroke="rgba(30,80,180,0.6)" strokeWidth="2"/>
        <circle cx="660" cy="300" r="30" fill="rgba(8,20,50,0.8)" stroke="rgba(10,111,255,0.5)" strokeWidth="1.5"/>
        <g stroke="rgba(100,160,255,0.6)" strokeWidth="2">
          <line x1="660" y1="270" x2="660" y2="330"/>
          <line x1="630" y1="300" x2="690" y2="300"/>
          <line x1="639" y1="279" x2="681" y2="321"/>
          <line x1="681" y1="279" x2="639" y2="321"/>
        </g>
        <circle cx="660" cy="300" r="10" fill="rgba(10,111,255,0.8)" stroke="rgba(0,195,255,0.8)" strokeWidth="1.5"/>
        <line x1="80" y1="348" x2="830" y2="348" stroke="rgba(10,111,255,0.15)" strokeWidth="1"/>
        <rect x="400" y="105" width="80" height="3" rx="1.5" fill="rgba(10,111,255,0.4)"/>
        <path d="M125,240 L115,248 L115,258 L135,255 L140,244 Z" fill="rgba(10,40,100,0.8)" stroke="rgba(10,111,255,0.3)" strokeWidth="1"/>
        <circle cx="455" cy="300" r="8" fill="rgba(10,111,255,0.4)" stroke="rgba(0,195,255,0.6)" strokeWidth="1.5"/>
        <path d="M340,118 Q420,105 520,106" stroke="rgba(0,195,255,0.2)" strokeWidth="1" fill="none"/>
        <path d="M82,252 L20,235 L25,242 L82,258 Z" fill="rgba(0,195,255,0.08)" filter="url(#softglow)"/>
      </svg>
      <style jsx>{`
        .hero-car-area {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 55vw;
          max-width: 850px;
          z-index: 1;
        }
        .car-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 0 60px rgba(10, 111, 255, 0.3)) drop-shadow(0 0 120px rgba(0, 195, 255, 0.15));
        }
        @media (max-width: 1024px) {
          .hero-car-area { width: 48vw; right: -20px; }
        }
        @media (max-width: 768px) {
          .hero-car-area {
            position: relative;
            right: auto;
            top: auto;
            transform: none;
            width: 100%;
            max-width: 100%;
            margin-top: 40px;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default HeroCarSVG
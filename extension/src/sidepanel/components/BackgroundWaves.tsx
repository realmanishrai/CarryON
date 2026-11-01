import React from 'react';

export const BackgroundWaves: React.FC = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none select-none overflow-hidden z-0 opacity-70">
      <svg
        className="absolute bottom-0 w-full h-full preserve-3d"
        viewBox="0 0 400 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Deep Navy to Electric Blue Gradient */}
          <linearGradient id="waveGradDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#078BFF" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#0B1726" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#050D19" stopOpacity="0.95" />
          </linearGradient>

          {/* Cyan Glow Wave Gradient */}
          <linearGradient id="waveGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9F5" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#078BFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00D9F5" stopOpacity="0.04" />
          </linearGradient>

          {/* Top Edge Stroke Gradient */}
          <linearGradient id="strokeGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9F5" stopOpacity="0" />
            <stop offset="35%" stopColor="#00D9F5" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#078BFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00D9F5" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="strokeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#078BFF" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#00D9F5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#078BFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deep background wave layer */}
        <path
          d="M0 80 Q100 40 200 70 T400 50 L400 160 L0 160 Z"
          fill="url(#waveGradDeep)"
        />

        {/* Ambient middle cyan wave */}
        <path
          d="M0 100 Q80 60 180 85 T400 65 L400 160 L0 160 Z"
          fill="url(#waveGradCyan)"
          stroke="url(#strokeGrad2)"
          strokeWidth="1"
        />

        {/* Foreground sharp glowing wave curve */}
        <path
          d="M0 120 Q120 75 220 105 T400 80"
          stroke="url(#strokeGrad1)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Subtle accent second curve */}
        <path
          d="M0 135 Q140 100 260 125 T400 110"
          stroke="url(#strokeGrad2)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="4 4"
        />
      </svg>
      {/* Smooth top fade to blend seamlessly into content */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050D19] to-transparent pointer-events-none" />
    </div>
  );
};


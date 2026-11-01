import React from 'react';

interface RobotMascotProps {
  className?: string;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({ className = 'w-14 h-14' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className} animate-float select-none pointer-events-none`}>
      <svg
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,217,245,0.35)]"
      >
        <defs>
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#050D19" />
            <stop offset="100%" stopColor="#0B1726" />
          </linearGradient>

          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D9F5" />
            <stop offset="100%" stopColor="#078BFF" />
          </linearGradient>

          <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Cyan Aura behind head */}
        <circle cx="34" cy="30" r="18" fill="#00D9F5" opacity="0.15" />

        {/* Futuristic Top Antenna */}
        <path d="M34 6 L34 14" stroke="#00D9F5" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="5" r="2.5" fill="#00D9F5" className="animate-pulse" />

        {/* Cyber Ear Nodes */}
        <rect x="10" y="24" width="4" height="12" rx="2" fill="#00D9F5" opacity="0.9" />
        <rect x="54" y="24" width="4" height="12" rx="2" fill="#00D9F5" opacity="0.9" />

        {/* Head Chassis */}
        <rect
          x="14"
          y="14"
          width="40"
          height="32"
          rx="10"
          fill="url(#chassisGrad)"
          stroke="#1A2B42"
          strokeWidth="1.5"
        />

        {/* Head Side Trim Accents */}
        <path d="M18 19 L16 26" stroke="#00D9F5" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 19 L52 26" stroke="#00D9F5" strokeWidth="1.5" strokeLinecap="round" />

        {/* Visor Screen */}
        <rect
          x="19"
          y="20"
          width="30"
          height="20"
          rx="6"
          fill="url(#visorGrad)"
          stroke="#00D9F5"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Expressive Cyan Eyes */}
        <g filter="url(#eyeGlow)">
          {/* Left Eye */}
          <rect x="24" y="26" width="6" height="7" rx="3" fill="#00D9F5" />
          <circle cx="27.5" cy="28" r="1" fill="#FFFFFF" />

          {/* Right Eye */}
          <rect x="38" y="26" width="6" height="7" rx="3" fill="#00D9F5" />
          <circle cx="41.5" cy="28" r="1" fill="#FFFFFF" />
        </g>

        {/* Friendly Expressive Smile / Status Bar */}
        <path
          d="M31 35 Q34 37 37 35"
          stroke="#00D9F5"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Sleek Floating Neck / Collar */}
        <rect x="29" y="47" width="10" height="3" rx="1.5" fill="#00D9F5" opacity="0.7" />

        {/* Torso Base */}
        <path
          d="M24 51 L44 51 L48 60 Q48 63 43 63 L25 63 Q20 63 20 60 Z"
          fill="url(#chassisGrad)"
          stroke="#1A2B42"
          strokeWidth="1.5"
        />

        {/* Glowing Power Core in Chest */}
        <circle cx="34" cy="57" r="3" fill="#00D9F5" filter="url(#eyeGlow)" />
        <circle cx="34" cy="57" r="1.5" fill="#FFFFFF" />

        {/* Shoulder Highlights */}
        <circle cx="23" cy="54" r="1" fill="#00D9F5" />
        <circle cx="45" cy="54" r="1" fill="#00D9F5" />
      </svg>
    </div>
  );
};


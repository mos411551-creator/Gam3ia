import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', showText = false, className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 3 People + Pile of Golden Coins Motif */}
      <div
        className={`${sizeMap[size]} shrink-0 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white shadow-md shadow-emerald-950/20 flex items-center justify-center relative overflow-hidden border border-emerald-600/30`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Subtle background glow */}
          <circle cx="24" cy="24" r="20" fill="url(#emeraldGlow)" opacity="0.3" />

          {/* Three Connected People Silhouettes */}
          {/* Left Person */}
          <circle cx="15" cy="16" r="4.5" fill="#A7F3D0" />
          <path
            d="M8.5 28C8.5 24.5 11.5 22 15 22C18.5 22 21.5 24.5 21.5 28"
            stroke="#A7F3D0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Person */}
          <circle cx="33" cy="16" r="4.5" fill="#A7F3D0" />
          <path
            d="M26.5 28C26.5 24.5 29.5 22 33 22C36.5 22 39.5 24.5 39.5 28"
            stroke="#A7F3D0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Center Leader Person (Elevated) */}
          <circle cx="24" cy="13" r="5" fill="#FFFFFF" />
          <path
            d="M17 26.5C17 22.8 20.1 20 24 20C27.9 20 31 22.8 31 26.5"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Stack of Golden Coins at the bottom */}
          <ellipse cx="24" cy="40" rx="14" ry="4" fill="#B45309" />
          <ellipse cx="24" cy="38" rx="14" ry="3.8" fill="#F59E0B" />
          <ellipse cx="24" cy="37.5" rx="12" ry="3.2" fill="#FDE68A" />

          {/* Middle Coin */}
          <ellipse cx="24" cy="34" rx="11" ry="3" fill="#D97706" />
          <ellipse cx="24" cy="32.5" rx="11" ry="2.8" fill="#FBBF24" />

          {/* Top Coin */}
          <ellipse cx="24" cy="29" rx="8" ry="2.2" fill="#F59E0B" />
          <ellipse cx="24" cy="27.8" rx="8" ry="2" fill="#FEF08A" />

          {/* Currency Pound Sign on Top Coin */}
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fill="#78350F"
            fontSize="5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            ج
          </text>

          <defs>
            <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#065F46" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-emerald-950 ${textSizeMap[size]}`}>
              جمعيتي
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
              Gam3ety
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            نظام الجمعيات والسهم المشترك
          </span>
        </div>
      )}
    </div>
  );
};

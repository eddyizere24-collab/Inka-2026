import React from 'react';

export interface InkaLogoProps {
  variant?: 'full' | 'compact' | 'symbol';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  taglineText?: string;
  ariaLabel?: string;
}

export const InkaEmblem: React.FC<{ size?: number; className?: string; ariaLabel?: string }> = ({
  size = 40,
  className = '',
  ariaLabel = 'INKA emblem',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md transition-transform duration-200 hover:scale-105 ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="inkaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="inkaTurqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id="inkaShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>

      {/* Hexagonal Shield Container with Emerald Glow */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        fill="url(#inkaShieldGrad)"
        stroke="#10B981"
        strokeWidth="1.5"
      />

      {/* Stylized Majestic Inyambo Curved Horns (Symmetrical Gold Curves) */}
      <path
        d="M12 28 C10 14, 18 6, 28 11 C24 16, 21 21, 21 28 Z"
        fill="url(#inkaGoldGrad)"
      />
      <path
        d="M52 28 C54 14, 46 6, 36 11 C40 16, 43 21, 43 28 Z"
        fill="url(#inkaGoldGrad)"
      />

      {/* Gentle Ears with Turquoise Inner Highlights */}
      <path
        d="M18 29 C12 28, 9 32, 12 36 C15 38, 17 34, 18 29 Z"
        fill="url(#inkaTurqGrad)"
      />
      <path
        d="M46 29 C52 28, 55 32, 52 36 C49 38, 47 34, 46 29 Z"
        fill="url(#inkaTurqGrad)"
      />

      {/* Friendly Cow Face Silhouette */}
      <path
        d="M21 27 C21 24, 43 24, 43 27 C46 30, 49 36, 47 42 C44 48, 38 52, 32 52 C26 52, 20 48, 17 42 C15 36, 18 30, 21 27 Z"
        fill="#FDFBF7"
      />

      {/* Forehead Golden Star of Friendship */}
      <path
        d="M32 29 L33.2 32 L36.5 32.5 L34 34.6 L34.8 37.8 L32 36 L29.2 37.8 L30 34.6 L27.5 32.5 L30.8 32 Z"
        fill="url(#inkaGoldGrad)"
      />

      {/* Warm, Kind Eyes */}
      <ellipse cx="25.5" cy="36" rx="2.4" ry="2.8" fill="#0F172A" />
      <circle cx="26.3" cy="35.2" r="1" fill="#FFFFFF" />

      <ellipse cx="38.5" cy="36" rx="2.4" ry="2.8" fill="#0F172A" />
      <circle cx="39.3" cy="35.2" r="1" fill="#FFFFFF" />

      {/* Soft Friendly Muzzle & Warm Smile */}
      <path
        d="M23.5 42 C23.5 39.5, 40.5 39.5, 40.5 42 C41.5 46, 38.5 49.5, 32 49.5 C25.5 49.5, 22.5 46, 23.5 42 Z"
        fill="#FEF3C7"
      />
      <circle cx="28.5" cy="44" r="1.2" fill="#B45309" />
      <circle cx="35.5" cy="44" r="1.2" fill="#B45309" />
      <path
        d="M28.5 46.5 Q32 49 35.5 46.5"
        stroke="#92400E"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const InkaLogo: React.FC<InkaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = true,
  taglineText,
  ariaLabel, 
}) => {
  const pixelSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const currentPixelSize = pixelSizes[size];

  if (variant === 'symbol') {
    return <InkaEmblem size={currentPixelSize} className={className} ariaLabel={ariaLabel} />;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <InkaEmblem size={currentPixelSize} ariaLabel={ariaLabel} />

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold tracking-tight font-display text-white ${textSizes[size]}`}
          >
            INKA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
        </div>

        {variant === 'full' && showTagline && size !== 'sm' && (
          <span className="text-[10px] text-emerald-400/90 font-medium tracking-wider uppercase mt-1">
            {taglineText ?? 'Igisoro · Dame · Biyari'}
          </span>
        )}
      </div>
    </div>
  );
};

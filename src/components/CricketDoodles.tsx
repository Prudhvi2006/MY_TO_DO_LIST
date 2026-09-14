import React from 'react';

/**
 * Rohit Sharma Fan & Cricket Scrapbook Doodles
 */

export const CricketBallDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#dc2626',
}) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ball body */}
    <circle cx="16" cy="16" r="13" fill={color} stroke="#082B63" strokeWidth="1.5" />
    {/* White Seam curve 1 */}
    <path
      d="M10 5C14 10 14 22 10 27"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
    />
    {/* White Seam curve 2 */}
    <path
      d="M22 5C18 10 18 22 22 27"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
    />
    {/* Highlight shine */}
    <path
      d="M13 8C14.5 6.5 17 6 19 6.5"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const CricketBatDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#fef08a',
}) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="rotate(-40 18 18)">
      {/* Bat handle grip (Navy blue) */}
      <rect x="16.5" y="2" width="3" height="9" rx="1" fill="#082B63" stroke="#1769E0" strokeWidth="0.8" />
      {/* Handle rubber wrap markings */}
      <line x1="16.5" y1="4.5" x2="19.5" y2="4.5" stroke="#8EC5FF" strokeWidth="0.8" />
      <line x1="16.5" y1="7" x2="19.5" y2="7" stroke="#8EC5FF" strokeWidth="0.8" />
      <line x1="16.5" y1="9.5" x2="19.5" y2="9.5" stroke="#8EC5FF" strokeWidth="0.8" />
      {/* Bat shoulder & blade (English Willow wood) */}
      <path
        d="M15 11C15 10 21 10 21 11L22 30C22 32 20 33 18 33C16 33 14 32 14 30L15 11Z"
        fill={color}
        stroke="#ca8a04"
        strokeWidth="1.2"
      />
      {/* Middle sticker with 45 */}
      <rect x="16" y="16" width="4" height="6" rx="0.5" fill="#1769E0" />
      <text x="18" y="20.5" fontSize="3" fontWeight="bold" fill="#ffffff" textAnchor="middle">45</text>
    </g>
  </svg>
);

export const TrophyDoodle: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Base */}
    <rect x="12" y="30" width="12" height="3" rx="1" fill="#082B63" />
    <rect x="14" y="27" width="8" height="3" fill="#F4C95D" stroke="#082B63" strokeWidth="1" />
    {/* Cup stem */}
    <path d="M16 23V27H20V23" stroke="#082B63" strokeWidth="1.2" fill="#F4C95D" />
    {/* Cup body */}
    <path
      d="M11 9H25V16C25 19.866 21.866 23 18 23C14.134 23 11 19.866 11 16V9Z"
      fill="#F4C95D"
      stroke="#082B63"
      strokeWidth="1.3"
    />
    {/* Cup Handles */}
    <path
      d="M11 11H8C6.5 11 5.5 12.5 5.5 14C5.5 16.5 7.5 18 11 18"
      stroke="#082B63"
      strokeWidth="1.3"
      fill="none"
    />
    <path
      d="M25 11H28C29.5 11 30.5 12.5 30.5 14C30.5 16.5 28.5 18 25 18"
      stroke="#082B63"
      strokeWidth="1.3"
      fill="none"
    />
    {/* Star / 45 on Cup */}
    <circle cx="18" cy="15.5" r="3.5" fill="#1769E0" />
    <text x="18" y="17.5" fontSize="4.5" fontWeight="900" fill="#ffffff" textAnchor="middle">45</text>
  </svg>
);

export const CrownDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = '#F4C95D',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M3 17L5 7L9 12L12 4L15 12L19 7L21 17H3Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="6" r="1.2" fill="#1769E0" />
    <circle cx="12" cy="3" r="1.4" fill="#dc2626" />
    <circle cx="19" cy="6" r="1.2" fill="#1769E0" />
    <rect x="3" y="17" width="18" height="2.5" rx="0.5" fill="#082B63" />
  </svg>
);

export const RisingSunDoodle: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sun half-circle */}
    <path
      d="M12 28C12 21.3726 17.3726 16 24 16C30.6274 16 36 21.3726 36 28H12Z"
      fill="#F4C95D"
      stroke="#d97706"
      strokeWidth="1.5"
    />
    {/* Horizon water line */}
    <path d="M6 28H42" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 32H38" stroke="#8EC5FF" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15 36H33" stroke="#8EC5FF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sun Rays */}
    <line x1="24" y1="8" x2="24" y2="12" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="12" x2="16.5" y2="15" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="12" x2="31.5" y2="15" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="20" x2="11" y2="21.5" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="41" y1="20" x2="37" y2="21.5" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Number45Sticker: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-11 h-11 text-base',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-[#1769E0] text-white font-extrabold border-2 border-[#F4C95D] shadow-md shadow-blue-900/25 tracking-wider select-none shrink-0 ${sizeClasses[size]} ${className}`}
      title="Jersey 45 - The Hitman"
    >
      <span className="leading-none pt-0.5 font-mono">45</span>
    </div>
  );
};

export const BlueHeartDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#1769E0',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 20.2C12 20.2 3.8 15.5 3.8 9.8C3.8 7 5.9 4.8 8.6 4.8C10.5 4.8 11.6 5.8 12 6.5C12.4 5.8 13.5 4.8 15.4 4.8C18.1 4.8 20.2 7 20.2 9.8C20.2 15.5 12 20.2 12 20.2Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CricketHelmetDoodle: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Helmet shell */}
    <path
      d="M6 18C6 11.3726 11.3726 6 18 6C23 6 27.5 9 28.5 14L28 19C27 21 24 22 20 22H11L6 18Z"
      fill="#1769E0"
      stroke="#082B63"
      strokeWidth="1.5"
    />
    {/* Visor / grill */}
    <path d="M12 18H27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 21H25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 16V22" stroke="#ffffff" strokeWidth="1.2" />
    <path d="M21 16V22" stroke="#ffffff" strokeWidth="1.2" />
    {/* Peak */}
    <path d="M25 14L30 15L28 17H25V14Z" fill="#082B63" />
  </svg>
);

export const CricketPitchDoodle: React.FC<{ className?: string }> = ({ className = 'w-12 h-6' }) => (
  <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pitch rectangle */}
    <rect x="2" y="4" width="44" height="16" rx="2" fill="#fde68a" stroke="#d97706" strokeWidth="1.2" />
    {/* Crease lines */}
    <line x1="10" y1="4" x2="10" y2="20" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="38" y1="4" x2="38" y2="20" stroke="#ffffff" strokeWidth="1.5" />
    {/* Stumps left */}
    <line x1="6" y1="8" x2="6" y2="16" stroke="#082B63" strokeWidth="2" strokeLinecap="round" />
    {/* Stumps right */}
    <line x1="42" y1="8" x2="42" y2="16" stroke="#082B63" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StarDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#F4C95D',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2L14.9 8.26L21.8 9.27L16.8 14.14L18 21.02L12 17.77L6 21.02L7.2 14.14L2.2 9.27L9.1 8.26L12 2Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);


import React from 'react';

export interface LogoProps {
  size?: number;
}

const LogoImage: React.FC<LogoProps> = (props) => {
  const { size = 24 } = props;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#paint0_radial_6415_23699)" />
      <defs>
        <radialGradient
          id="paint0_radial_6415_23699"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${(17.04 * size) / 24} ${(4.56 * size) / 24}) rotate(121.304) scale(${(20.786 * size) / 24})`}
        >
          <stop stopColor="#EBD3FF" />
          <stop offset="0.326154" stopColor="#BEB4FF" />
          <stop offset="1" stopColor="#9197FF" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default LogoImage;

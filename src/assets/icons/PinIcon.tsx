import React from 'react';

interface PinIconProps extends React.SVGProps<SVGSVGElement> {}

export const PinIcon: React.FC<PinIconProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m-3 3 3-3m0 0 3 3m-3-3v11.25m6-3.75 3 3m0 0 3-3m-3 3V1.5m-3 3 3-3m0 0 3 3m-3-3v11.25" 
    />
  </svg>
);

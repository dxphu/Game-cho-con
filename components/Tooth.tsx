
import React from 'react';
import { Stain } from '../types';

interface ToothProps {
  stains: Stain[];
  onClean: (id: number) => void;
  brushPos: { x: number; y: number };
}

const Tooth: React.FC<ToothProps> = ({ stains, onClean, brushPos }) => {
  // Check collision with brush - Reduced radius for better gameplay
  React.useEffect(() => {
    // brushRadius in percentage of container width/height
    // 8 is about 1/12th of the area, much more reasonable than 30
    const brushRadius = 8; 
    
    stains.forEach(stain => {
      if (!stain.isCleaned) {
        const dx = brushPos.x - stain.x;
        const dy = brushPos.y - stain.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < brushRadius) {
          onClean(stain.id);
        }
      }
    });
  }, [brushPos, stains, onClean]);

  return (
    <div className="relative w-80 h-96 md:w-[450px] md:h-[550px] transition-all duration-500">
      {/* The main tooth shape */}
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
        <path
          d="M40,60 C40,20 160,20 160,60 C160,110 150,150 140,210 C135,230 115,230 110,210 C105,190 95,190 90,210 C85,230 65,230 60,210 C50,150 40,110 40,60 Z"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="4"
        />
        {/* Shiny highlights */}
        <path
          d="M60,50 Q100,40 140,50"
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Smiling face */}
        <circle cx="75" cy="80" r="6" fill="#475569" />
        <circle cx="125" cy="80" r="6" fill="#475569" />
        <path
          d="M85,110 Q100,125 115,110"
          fill="none"
          stroke="#475569"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Dirt and Bacteria */}
      {stains.map(stain => (
        !stain.isCleaned && (
          <div
            key={stain.id}
            className="absolute transition-all duration-300"
            style={{
              left: `${stain.x}%`,
              top: `${stain.y}%`,
              width: `${stain.size}px`,
              height: `${stain.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {stain.type === 'bacteria' ? (
              <img 
                src="https://img.icons8.com/color/48/bacteria.png" 
                className="w-full h-full animate-pulse"
                alt="Vi khuẩn"
              />
            ) : stain.type === 'food' ? (
              <div className="bg-yellow-700/60 rounded-full w-full h-full blur-[2px]" />
            ) : (
              <div className="bg-green-800/40 rounded-full w-full h-full blur-[4px]" />
            )}
          </div>
        )
      ))}
    </div>
  );
};

export default Tooth;

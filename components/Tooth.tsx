
import React, { useMemo, useState } from 'react';
import { Stain } from '../types';

interface ToothProps {
  stains: Stain[];
  onClean: (id: number) => void;
  brushPos: { x: number; y: number };
}

const BACTERIA_TYPES = [
  { id: 'bacteria', emoji: '👾' },
  { id: 'microbes', emoji: '🦠' },
  { id: 'virus', emoji: '🧬' },
  { id: 'bug', emoji: '🐛' }
];

const SafeBacteria: React.FC<{ typeId: string; emoji: string; size: number }> = ({ typeId, emoji, size }) => {
  const [isError, setIsError] = useState(false);
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      {!isError ? (
        <img 
          src={`https://img.icons8.com/color/48/${typeId}.png`} 
          className="w-full h-full animate-pulse" 
          onError={() => setIsError(true)} 
          draggable="false"
          alt="Vi khuẩn" 
        />
      ) : (
        <span style={{ fontSize: size * 0.8 }} className="animate-pulse">{emoji}</span>
      )}
    </div>
  );
};

const Tooth: React.FC<ToothProps> = ({ stains, onClean, brushPos }) => {
  // Gán ngẫu nhiên loại cho từng con vi khuẩn mỗi khi game reset
  const bacteriaMap = useMemo(() => {
    const map: Record<number, typeof BACTERIA_TYPES[0]> = {};
    stains.forEach(s => {
      map[s.id] = BACTERIA_TYPES[Math.floor(Math.random() * BACTERIA_TYPES.length)];
    });
    return map;
  }, [stains.length]);

  React.useEffect(() => {
    const brushRadius = 10; 
    stains.forEach(stain => {
      if (!stain.isCleaned) {
        const dx = brushPos.x - stain.x;
        const dy = brushPos.y - stain.y;
        if (Math.sqrt(dx * dx + dy * dy) < brushRadius) {
          onClean(stain.id);
        }
      }
    });
  }, [brushPos, stains, onClean]);

  return (
    <div className="relative w-80 h-96 md:w-[450px] md:h-[550px]">
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
        <path
          d="M40,60 C40,20 160,20 160,60 C160,110 150,150 140,210 C135,230 115,230 110,210 C105,190 95,190 90,210 C85,230 65,230 60,210 C50,150 40,110 40,60 Z"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="4"
        />
        <path d="M60,50 Q100,40 140,50" fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
        <circle cx="75" cy="80" r="6" fill="#475569" />
        <circle cx="125" cy="80" r="6" fill="#475569" />
        <path d="M85,110 Q100,125 115,110" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {stains.map(stain => !stain.isCleaned && (
        <div
          key={stain.id}
          className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${stain.x}%`, top: `${stain.y}%` }}
        >
          {stain.type === 'bacteria' ? (
            <SafeBacteria typeId={bacteriaMap[stain.id].id} emoji={bacteriaMap[stain.id].emoji} size={stain.size} />
          ) : (
            <div 
              style={{ width: stain.size, height: stain.size }} 
              className={`rounded-full blur-[2px] ${stain.type === 'food' ? 'bg-orange-800/50' : 'bg-yellow-800/40'}`} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Tooth;

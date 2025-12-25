
import React, { useMemo, useState, useEffect } from 'react';
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
          className="w-full h-full animate-bounce" 
          style={{ animationDuration: '2s' }}
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
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number}[]>([]);

  const bacteriaMap = useMemo(() => {
    const map: Record<number, typeof BACTERIA_TYPES[0]> = {};
    stains.forEach(s => {
      map[s.id] = BACTERIA_TYPES[Math.floor(Math.random() * BACTERIA_TYPES.length)];
    });
    return map;
  }, [stains.length]);

  useEffect(() => {
    const brushRadius = 12; 
    stains.forEach(stain => {
      if (!stain.isCleaned) {
        const dx = brushPos.x - stain.x;
        const dy = brushPos.y - stain.y;
        if (Math.sqrt(dx * dx + dy * dy) < brushRadius) {
          onClean(stain.id);
          // Tạo hiệu ứng lấp lánh tại chỗ sạch
          const newSparkle = { id: Date.now() + Math.random(), x: stain.x, y: stain.y };
          setSparkles(prev => [...prev, newSparkle]);
          setTimeout(() => {
            setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
          }, 600);
        }
      }
    });
  }, [brushPos, stains, onClean]);

  return (
    <div className="relative w-80 h-96 md:w-[480px] md:h-[580px] flex items-center justify-center">
      {/* Nướu răng (Gums) */}
      <div className="absolute top-[10%] w-[90%] h-[25%] bg-rose-200 rounded-t-[100px] -z-10 shadow-inner border-b-4 border-rose-300 opacity-80" />
      
      <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        {/* Thân răng */}
        <path
          d="M40,60 C40,20 160,20 160,60 C160,110 155,160 145,210 C140,230 115,230 110,210 C105,190 95,190 90,210 C85,230 60,230 55,210 C45,160 40,110 40,60 Z"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        {/* Bóng mờ tạo khối */}
        <path d="M50,70 Q100,60 150,70" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        <path d="M140,80 Q145,130 135,180" fill="none" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
        
        {/* Khuôn mặt dễ thương */}
        <circle cx="75" cy="100" r="7" fill="#334155" />
        <circle cx="125" cy="100" r="7" fill="#334155" />
        <circle cx="77" cy="98" r="2" fill="white" />
        <circle cx="127" cy="98" r="2" fill="white" />
        <path d="M80,135 Q100,155 120,135" fill="none" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
        {/* Má hồng */}
        <circle cx="60" cy="120" r="10" fill="#fda4af" opacity="0.4" />
        <circle cx="140" cy="120" r="10" fill="#fda4af" opacity="0.4" />
      </svg>

      {/* Vết bẩn/Vi khuẩn */}
      {stains.map(stain => !stain.isCleaned && (
        <div
          key={stain.id}
          className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: `${stain.x}%`, top: `${stain.y}%` }}
        >
          {stain.type === 'bacteria' ? (
            <SafeBacteria typeId={bacteriaMap[stain.id].id} emoji={bacteriaMap[stain.id].emoji} size={stain.size} />
          ) : (
            <div 
              style={{ width: stain.size, height: stain.size }} 
              className={`rounded-full blur-[1px] shadow-sm ${stain.type === 'food' ? 'bg-amber-800/60' : 'bg-yellow-700/50'}`} 
            />
          )}
        </div>
      ))}

      {/* Hiệu ứng lấp lánh */}
      {sparkles.map(s => (
        <div 
          key={s.id} 
          className="absolute sparkle-effect z-30 pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <span className="text-2xl">✨</span>
        </div>
      ))}
    </div>
  );
};

export default Tooth;

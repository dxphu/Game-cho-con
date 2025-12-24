
import React, { useState, useEffect, useRef } from 'react';
import { GameState, DentalTip } from '../types';
import { getPlantCareTips, getCelebrationMessage } from '../services/geminiService';

const SafeImage: React.FC<{ src: string; alt: string; className?: string; fallbackEmoji: string }> = ({ src, alt, className, fallbackEmoji }) => {
  const [isError, setIsError] = useState(false);
  
  return (
    <div className={`${className} flex items-center justify-center relative`}>
      {!isError ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain" 
          onError={() => setIsError(true)} 
          draggable="false" 
        />
      ) : (
        <span className="text-6xl drop-shadow-md">{fallbackEmoji}</span>
      )}
    </div>
  );
};

const PLANT_VARIANTS = [
  { id: 'sunflower', emoji: '🌻', name: 'Hoa Hướng Dương' },
  { id: 'cactus', emoji: '🌵', name: 'Cây Xương Rồng' },
  { id: 'rose', emoji: '🌹', name: 'Hoa Hồng' },
  { id: 'flower-pot', emoji: '🪴', name: 'Cây Trong Chậu' },
  { id: 'tulip', emoji: '🌷', name: 'Hoa Tulip' },
  { id: 'deciduous-tree', emoji: '🌳', name: 'Cây Xanh' }
];

const PlantWateringGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [growth, setGrowth] = useState(0); 
  const [currentVariant, setCurrentVariant] = useState(PLANT_VARIANTS[0]);
  const [canPos, setCanPos] = useState({ x: 50, y: 30 });
  const [isWatering, setIsWatering] = useState(false);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    // Ngẫu nhiên hóa loại cây cho lượt này
    const randomVariant = PLANT_VARIANTS[Math.floor(Math.random() * PLANT_VARIANTS.length)];
    setCurrentVariant(randomVariant);
    
    setGameState('PLAYING');
    setGrowth(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCanPos({ x, y });
    setIsWatering(x > 30 && x < 70 && y > 20 && y < 85);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setCanPos({ x, y });
    setIsWatering(x > 30 && x < 70 && y > 20 && y < 85);
  };

  useEffect(() => {
    let interval: any;
    if (isWatering && gameState === 'PLAYING') {
      interval = setInterval(() => {
        setGrowth(prev => Math.min(prev + 1.2, 100));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isWatering, gameState]);

  useEffect(() => {
    if (growth >= 100 && gameState === 'PLAYING') {
      handleWin();
    }
  }, [growth]);

  const handleWin = async () => {
    setGameState('FINISHED');
    setLoading(true);
    try {
      const [tipsData, msg] = await Promise.all([
        getPlantCareTips(),
        getCelebrationMessage(playerName, 'plants')
      ]);
      setTips(tipsData);
      setCelebrationMsg(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-50 to-green-50"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={() => setIsWatering(false)}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-green-400 z-10 mx-4">
          <h1 className="text-4xl font-bold text-green-600 mb-2">Tưới Cây Xanh</h1>
          <p className="text-slate-500 mb-8">Mỗi lượt chơi sẽ là một loại cây bí mật nhé!</p>
          <form onSubmit={handleStart} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-green-50 border-2 border-transparent focus:border-green-400 focus:outline-none text-lg"
              required
            />
            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-xl">
              KHÁM PHÁ CÂY MỚI
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full relative flex flex-col items-center justify-center cursor-none">
          {/* Thanh sức sống */}
          <div className="absolute top-8 w-64 h-8 bg-white rounded-full shadow-inner overflow-hidden border-2 border-green-200">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${growth}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-800 uppercase tracking-widest">
              Sức sống: {Math.floor(growth)}%
            </div>
          </div>

          <div className="relative mt-20 transition-all duration-500 transform" style={{ transform: `scale(${0.9 + (growth / 150)})` }}>
            <SafeImage 
              src={growth < 30 ? 'https://img.icons8.com/color/96/seedling.png' : (growth < 70 ? 'https://img.icons8.com/color/96/potted-plant.png' : `https://img.icons8.com/color/96/${currentVariant.id}.png`)}
              alt="plant" 
              className={`w-48 h-48 md:w-64 md:h-64 ${isWatering ? 'animate-pulse' : ''}`}
              fallbackEmoji={growth < 70 ? "🌱" : currentVariant.emoji}
            />
            {isWatering && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full h-full flex justify-center pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-6 bg-blue-300 rounded-full mx-1 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
          </div>

          {/* Bình tưới */}
          <div 
            className="fixed pointer-events-none z-50 transition-transform duration-75"
            style={{ 
              left: `${(canPos.x * (containerRef.current?.clientWidth || 0)) / 100 + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
              top: `${(canPos.y * (containerRef.current?.clientHeight || 0)) / 100 + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
              transform: `translate(-50%, -50%) rotate(${isWatering ? '-35deg' : '0deg'})`
            }}
          >
            <SafeImage 
              src="https://img.icons8.com/color/96/watering-can.png" 
              className="w-24 h-24 drop-shadow-2xl" 
              alt="Watering Can" 
              fallbackEmoji="🚿"
            />
          </div>

          <div className="mt-12 text-green-700 font-bold bg-white/60 backdrop-blur-sm px-8 py-3 rounded-full border border-green-200 animate-bounce shadow-sm">
             Tưới nước cho {currentVariant.name} nào! 💦
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-green-400 z-10 mx-4 overflow-y-auto max-h-[90vh]">
          <div className="relative mb-6">
            <SafeImage src={`https://img.icons8.com/color/144/${currentVariant.id}.png`} className="w-32 h-32 mx-auto animate-bounce" alt="Winner" fallbackEmoji={currentVariant.emoji} />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Bé thật mát tay!</h2>
          <p className="text-lg text-slate-700 italic mb-6">{loading ? "Đang chờ quà..." : celebrationMsg}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-green-50 p-4 rounded-2xl text-left border-l-4 border-green-400">
                <h3 className="font-bold text-green-600 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI TIẾP</button>
        </div>
      )}
    </div>
  );
};

export default PlantWateringGame;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, DentalTip } from '../types';
import { getPlantCareTips, getCelebrationMessage } from '../services/geminiService';

const PlantWateringGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [growth, setGrowth] = useState(0); // 0 to 100
  const [canPos, setCanPos] = useState({ x: 50, y: 30 });
  const [isWatering, setIsWatering] = useState(false);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setGameState('PLAYING');
    setGrowth(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCanPos({ x, y });
    
    // Check if over the plant area (center)
    if (x > 35 && x < 65 && y > 30 && y < 70) {
      setIsWatering(true);
    } else {
      setIsWatering(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setCanPos({ x, y });
    
    if (x > 35 && x < 65 && y > 30 && y < 70) {
      setIsWatering(true);
    } else {
      setIsWatering(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isWatering && gameState === 'PLAYING') {
      interval = setInterval(() => {
        setGrowth(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
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

  const getPlantImage = () => {
    if (growth < 30) return 'https://img.icons8.com/color/144/sprout.png';
    if (growth < 70) return 'https://img.icons8.com/color/144/potted-plant.png';
    return 'https://img.icons8.com/color/144/flower-pot.png';
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
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-green-400 z-10">
          <h1 className="text-4xl font-bold text-green-600 mb-2">Tưới Cây Xanh</h1>
          <p className="text-slate-500 mb-8">Bé hãy giúp mầm nhỏ lớn thành hoa xinh nhé!</p>
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
              BẮT ĐẦU CHƠI
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full relative flex flex-col items-center justify-center cursor-none">
          {/* Clouds */}
          <div className="absolute top-10 left-10 opacity-30 animate-float">
            <img src="https://img.icons8.com/color/96/cloud.png" alt="cloud" />
          </div>
          <div className="absolute top-20 right-20 opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>
            <img src="https://img.icons8.com/color/96/cloud.png" alt="cloud" />
          </div>

          {/* Sun */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 opacity-20">
             <img src="https://img.icons8.com/color/144/sun.png" className="animate-spin-slow" alt="sun" />
          </div>

          {/* Growth Meter */}
          <div className="absolute top-8 w-64 h-6 bg-white rounded-full shadow-inner overflow-hidden border-2 border-green-200">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${growth}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-800 uppercase tracking-widest">
              Sức sống: {growth}%
            </div>
          </div>

          {/* The Plant */}
          <div className="relative mt-20 transition-all duration-500 transform" style={{ scale: `${0.8 + (growth / 200)}` }}>
            <img 
              src={getPlantImage()} 
              alt="plant" 
              className={`w-48 h-48 md:w-64 md:h-64 object-contain ${isWatering ? 'animate-pulse' : ''}`}
            />
            {isWatering && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-center pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-6 bg-blue-400 rounded-full mx-1 animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s`, opacity: 0.6 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Watering Can Cursor */}
          <div 
            className="fixed pointer-events-none z-50 transition-transform duration-100"
            style={{ 
              left: `${(canPos.x * (containerRef.current?.clientWidth || 0)) / 100 + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
              top: `${(canPos.y * (containerRef.current?.clientHeight || 0)) / 100 + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
              transform: `translate(-50%, -50%) rotate(${isWatering ? '-30deg' : '0deg'})`
            }}
          >
            <img 
              src="https://img.icons8.com/color/96/watering-can.png" 
              className="w-24 h-24 drop-shadow-xl" 
              alt="Watering Can" 
            />
          </div>

          <div className="mt-12 text-green-700 font-bold bg-white/50 backdrop-blur px-6 py-2 rounded-full border border-green-200">
             Hãy di chuyển bình để tưới nước cho cây nhé!
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-green-400 z-10">
          <div className="relative mb-6">
            <img src="https://img.icons8.com/color/144/flower-pot.png" className="mx-auto animate-bounce" alt="Grown Plant" />
            <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-30 -z-10" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Cây đã nở hoa rồi!</h2>
          <div className="min-h-[3rem] flex items-center justify-center mb-6">
            {loading ? "..." : <p className="text-lg text-slate-700 italic">{celebrationMsg}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-green-50 p-4 rounded-2xl text-left border-l-4 border-green-400">
                <h3 className="font-bold text-green-600 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI LẠI</button>
        </div>
      )}
    </div>
  );
};

export default PlantWateringGame;

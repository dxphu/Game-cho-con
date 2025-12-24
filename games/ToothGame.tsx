import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Stain, DentalTip } from '../types';
import Tooth from '../components/Tooth';
import { getDentalTips, getCelebrationMessage } from '../services/geminiService';

const ToothGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [stains, setStains] = useState<Stain[]>([]);
  const [brushPos, setBrushPos] = useState({ x: 50, y: 50 });
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const newStains: Stain[] = [];
    const types: ('bacteria' | 'stain' | 'food')[] = ['bacteria', 'stain', 'food'];
    for (let i = 0; i < 18; i++) {
      newStains.push({
        id: i,
        x: 25 + Math.random() * 50,
        y: 15 + Math.random() * 70,
        size: 24 + Math.random() * 32, // To hơn một chút cho mobile dễ bấm
        isCleaned: false,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    setStains(newStains);
    setGameState('PLAYING');
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    initGame();
  };

  const handleWin = useCallback(async () => {
    if (gameState !== 'PLAYING') return;
    setGameState('FINISHED');
    setLoading(true);
    try {
      const [tipsData, msg] = await Promise.all([
        getDentalTips(),
        getCelebrationMessage(playerName)
      ]);
      setTips(tipsData);
      setCelebrationMsg(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [gameState, playerName]);

  useEffect(() => {
    if (gameState === 'PLAYING' && stains.length > 0) {
      if (stains.every(s => s.isCleaned)) {
        handleWin();
      }
    }
  }, [stains, gameState, handleWin]);

  const updateBrushPos = (clientX: number, clientY: number) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setBrushPos({ x, y });
  };

  const cleanStain = useCallback((id: number) => {
    setStains(prev => prev.map(s => s.id === id ? { ...s, isCleaned: true } : s));
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex flex-col items-center justify-center p-4 relative ${gameState === 'PLAYING' ? 'cursor-none touch-none' : ''}`}
      onMouseMove={(e) => updateBrushPos(e.clientX, e.clientY)}
      onTouchMove={(e) => updateBrushPos(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-10 shadow-xl text-center border-t-8 border-blue-400 z-10 animate-float">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Bé Tập Đánh Răng</h1>
          <p className="text-slate-500 mb-8 text-sm md:text-base">Xua đuổi vi khuẩn cho bạn Răng xinh!</p>
          <form onSubmit={handleStart} className="space-y-4">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Tên của bé là gì nhỉ?"
              className="w-full px-5 py-4 rounded-2xl bg-blue-50 border-2 border-transparent focus:border-blue-400 focus:outline-none text-lg text-center font-bold"
              required
            />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-xl">
              CHƠI NGAY ✨
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="relative flex flex-col items-center w-full max-w-lg">
          <div className="mb-6 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-md border border-blue-100 animate-pulse">
            <span className="text-lg md:text-xl font-bold text-blue-600">🦠 Còn {stains.filter(s => !s.isCleaned).length} bạn vi khuẩn</span>
          </div>
          
          <div className="w-full aspect-square flex justify-center items-center">
             <Tooth stains={stains} onClean={cleanStain} brushPos={brushPos} />
          </div>

          <div 
            className="fixed pointer-events-none z-[60] -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${(brushPos.x * (containerRef.current?.clientWidth || 0)) / 100 + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
              top: `${(brushPos.y * (containerRef.current?.clientHeight || 0)) / 100 + (containerRef.current?.getBoundingClientRect().top || 0)}px`
            }}
          >
            <img src="https://img.icons8.com/fluency/144/toothbrush.png" className="w-24 h-24 md:w-32 md:h-32 rotate-[15deg] drop-shadow-2xl" alt="Brush" />
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl text-center border-b-8 border-green-400 z-50 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <img src="https://img.icons8.com/color/144/medal.png" className="w-24 h-24 mx-auto mb-4 animate-bounce" alt="Winner" />
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">Quá giỏi luôn!</h2>
          <p className="text-base md:text-lg text-slate-700 italic mb-6 leading-relaxed">
            {loading ? "Đang chờ quà..." : celebrationMsg}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-2xl text-left border-l-4 border-blue-400 shadow-sm">
                <h3 className="font-bold text-blue-600 text-sm mb-1">{tip.title}</h3>
                <p className="text-[12px] md:text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setGameState('START')} 
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl hover:scale-105"
          >
            CHƠI TIẾP 🔄
          </button>
        </div>
      )}
    </div>
  );
};

export default ToothGame;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Stain, DentalTip } from '../types';
import Tooth from '../components/Tooth';
import { getDentalTips, getCelebrationMessage } from '../services/geminiService';

const ToothGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [stains, setStains] = useState<Stain[]>([]);
  const [brushPos, setBrushPos] = useState({ x: 0, y: 0 });
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const newStains: Stain[] = [];
    const types: ('bacteria' | 'stain' | 'food')[] = ['bacteria', 'stain', 'food'];
    for (let i = 0; i < 22; i++) {
      newStains.push({
        id: i,
        x: 25 + Math.random() * 50,
        y: 15 + Math.random() * 75,
        size: 20 + Math.random() * 30,
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
      console.error("Error ending game", e);
    } finally {
      setLoading(false);
    }
  }, [gameState, playerName]);

  useEffect(() => {
    if (gameState === 'PLAYING' && stains.length > 0) {
      const allCleaned = stains.every(s => s.isCleaned);
      if (allCleaned) {
        handleWin();
      }
    }
  }, [stains, gameState, handleWin]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBrushPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING' || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setBrushPos({ x, y });
  };

  const cleanStain = useCallback((id: number) => {
    setStains(prev => {
      const target = prev.find(s => s.id === id);
      if (!target || target.isCleaned) return prev;
      return prev.map(s => s.id === id ? { ...s, isCleaned: true } : s);
    });
  }, []);

  const restart = () => {
    setGameState('START');
    setStains([]);
    setCelebrationMsg('');
  };

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center p-4 transition-colors duration-1000 ${gameState === 'PLAYING' ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      ref={containerRef}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-blue-400">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Bé Tập Đánh Răng</h1>
          <p className="text-slate-500 mb-8">Hãy giúp bạn Răng trắng sáng trở lại nhé!</p>
          <form onSubmit={handleStart} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 border-2 border-transparent focus:border-blue-400 focus:outline-none text-lg"
              required
            />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all text-xl">
              BẮT ĐẦU CHƠI
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="relative flex flex-col items-center">
          <div className="absolute top-[-80px] text-center w-max bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm">
            <span className="text-xl font-bold text-blue-600">✨ Còn {stains.filter(s => !s.isCleaned).length} con vi khuẩn!</span>
          </div>
          <Tooth stains={stains} onClean={cleanStain} brushPos={brushPos} />
          <div 
            className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${(brushPos.x * (containerRef.current?.clientWidth || 0)) / 100 + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
              top: `${(brushPos.y * (containerRef.current?.clientHeight || 0)) / 100 + (containerRef.current?.getBoundingClientRect().top || 0)}px`
            }}
          >
            <img src="https://img.icons8.com/fluency/96/toothbrush.png" className="w-20 h-20 rotate-[15deg] drop-shadow-lg" alt="Brush" />
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-green-400">
          <img src="https://img.icons8.com/fluency/96/medal.png" className="w-24 h-24 mx-auto mb-4 animate-bounce" alt="Winner" />
          <h2 className="text-3xl font-bold text-green-600 mb-2">Tuyệt vời quá!</h2>
          <p className="text-lg text-slate-700 italic mb-6">{loading ? "..." : celebrationMsg}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-2xl text-left border-l-4 border-blue-400">
                <h3 className="font-bold text-blue-600 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={restart} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI TIẾP</button>
        </div>
      )}
    </div>
  );
};

export default ToothGame;

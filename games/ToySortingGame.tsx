import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, DentalTip } from '../types';
import { getToySortingTips, getCelebrationMessage } from '../services/geminiService';
import { ASSETS } from '../constants/assets';

const SafeImage: React.FC<{ src: string; alt: string; className?: string; fallbackEmoji: string }> = ({ src, alt, className, fallbackEmoji }) => {
  const [isError, setIsError] = useState(false);
  return (
    <div className={`${className} flex items-center justify-center relative`}>
      {!isError ? (
        <img src={src} alt={alt} className="w-full h-full object-contain" onError={() => setIsError(true)} draggable="false" />
      ) : (
        <span className="text-5xl">{fallbackEmoji}</span>
      )}
    </div>
  );
};

interface Toy {
  id: number;
  icon: string;
  emoji: string;
  x: number;
  y: number;
  isStored: boolean;
}

const TOY_POOL = [
  { id: 'BEAR', emoji: '🧸' },
  { id: 'CAR', emoji: '🚗' },
  { id: 'BALL', emoji: '⚽' },
  { id: 'CUBE', emoji: '🧊' },
  { id: 'TRAIN', emoji: '🚂' },
  { id: 'HORSE', emoji: '🎠' },
  { id: 'BLOCKS', emoji: '🧱' },
  { id: 'PLANE', emoji: '✈️' },
  { id: 'ROBOT', emoji: '🤖' },
  { id: 'DUCK', emoji: '🦆' }
];

interface ToySortingGameProps {
  onAwardSticker: () => void;
}

const ToySortingGame: React.FC<ToySortingGameProps> = ({ onAwardSticker }) => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [toys, setToys] = useState<Toy[]>([]);
  const [activeToyId, setActiveToyId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const selected = [...TOY_POOL].sort(() => 0.5 - Math.random()).slice(0, 6);
    const newToys: Toy[] = selected.map((data, i) => ({
      id: i,
      icon: (ASSETS.TOYS as any)[data.id],
      emoji: data.emoji,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 40,
      isStored: false
    }));
    setToys(newToys);
    setGameState('PLAYING');
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    initGame();
  };

  const onMove = (clientX: number, clientY: number) => {
    if (activeToyId === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = ((clientX - rect.left - dragOffset.x + 40) / rect.width) * 100;
    const yPercent = ((clientY - rect.top - dragOffset.y + 40) / rect.height) * 100;
    setToys(prev => prev.map(t => t.id === activeToyId ? { ...t, x: xPercent, y: yPercent } : t));
  };

  const onEnd = () => {
    if (activeToyId === null) return;
    const toy = toys.find(t => t.id === activeToyId);
    if (toy && toy.x > 35 && toy.x < 65 && toy.y > 60) {
      setToys(prev => prev.map(t => t.id === activeToyId ? { ...t, isStored: true } : t));
    }
    setActiveToyId(null);
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && toys.length > 0 && toys.every(t => t.isStored)) {
      handleWin();
    }
  }, [toys]);

  const handleWin = async () => {
    setGameState('FINISHED');
    onAwardSticker();
    setLoading(true);
    try {
      const [tipsData, msg] = await Promise.all([
        getToySortingTips(),
        getCelebrationMessage(playerName, 'toys')
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
      className="w-full h-full flex flex-col items-center justify-center relative select-none"
      ref={containerRef}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
      onMouseUp={onEnd}
      onTouchEnd={onEnd}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-orange-400 z-10 mx-4">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Dọn Đồ Chơi</h1>
          <p className="text-slate-500 mb-8">Hãy giúp các bạn đồ chơi đi ngủ đúng chỗ nhé!</p>
          <form onSubmit={handleStart} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-orange-50 border-2 border-transparent focus:border-orange-400 focus:outline-none text-lg"
              required
            />
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-xl">
              BẮT ĐẦU CHƠI
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm z-10 border border-orange-100">
             <span className="text-xl font-bold text-orange-600 uppercase tracking-tight">
               ✨ Còn {toys.filter(t => !t.isStored).length} món đồ!
             </span>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 flex flex-col items-center justify-end">
             <div className="text-orange-800 font-bold mb-2 bg-orange-200/50 px-4 py-1 rounded-full text-sm uppercase">Hòm đồ chơi 📦</div>
             <SafeImage 
               src={ASSETS.UI.BOX} 
               className={`w-full h-full transition-transform ${activeToyId !== null ? 'scale-110' : ''}`}
               alt="Toy Box" 
               fallbackEmoji="📦"
             />
          </div>

          {toys.map(toy => !toy.isStored && (
            <div
              key={toy.id}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${activeToyId === toy.id ? 'z-50 scale-125' : 'z-30'}`}
              style={{ left: `${toy.x}%`, top: `${toy.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={(e) => {
                setActiveToyId(toy.id);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onTouchStart={(e) => {
                setActiveToyId(toy.id);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
              }}
            >
              <SafeImage src={toy.icon} alt="toy" className="w-20 h-20 md:w-24 md:h-24 pointer-events-none" fallbackEmoji={toy.emoji} />
            </div>
          ))}
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-orange-400 z-10 mx-4 overflow-y-auto max-h-[90vh]">
          <SafeImage src={ASSETS.UI.MEDAL} className="w-24 h-24 mx-auto mb-4 animate-bounce" alt="Winner" fallbackEmoji="🏅" />
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Bé thật ngăn nắp!</h2>
          <p className="text-lg text-slate-700 italic mb-6">{celebrationMsg}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-orange-50 p-4 rounded-2xl text-left border-l-4 border-orange-400">
                <h3 className="font-bold text-orange-600 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI TIẾP</button>
        </div>
      )}
    </div>
  );
};

export default ToySortingGame;
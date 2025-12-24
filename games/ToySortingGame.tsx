
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, DentalTip } from '../types';
import { getToySortingTips, getCelebrationMessage } from '../services/geminiService';

interface Toy {
  id: number;
  icon: string;
  x: number;
  y: number;
  isStored: boolean;
  type: string;
}

const TOY_ICONS = [
  'https://img.icons8.com/color/96/teddy-bear.png',
  'https://img.icons8.com/color/96/toy-car.png',
  'https://img.icons8.com/color/96/beach-ball.png',
  'https://img.icons8.com/color/96/rubiks-cube.png',
  'https://img.icons8.com/color/96/train.png',
  'https://img.icons8.com/color/96/rocking-horse.png',
  'https://img.icons8.com/color/96/blocks.png',
  'https://img.icons8.com/color/96/paper-plane.png'
];

const ToySortingGame: React.FC = () => {
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
    const newToys: Toy[] = [];
    for (let i = 0; i < 8; i++) {
      newToys.push({
        id: i,
        icon: TOY_ICONS[i % TOY_ICONS.length],
        x: 10 + Math.random() * 80, // 10% to 90%
        y: 10 + Math.random() * 40, // Top half of screen
        isStored: false,
        type: 'toy'
      });
    }
    setToys(newToys);
    setGameState('PLAYING');
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    initGame();
  };

  const onMouseDown = (e: React.MouseEvent, id: number) => {
    if (gameState !== 'PLAYING') return;
    const toy = toys.find(t => t.id === id);
    if (!toy || toy.isStored) return;

    setActiveToyId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const onTouchStart = (e: React.TouchEvent, id: number) => {
    if (gameState !== 'PLAYING') return;
    const toy = toys.find(t => t.id === id);
    if (!toy || toy.isStored) return;

    setActiveToyId(id);
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const onMove = (clientX: number, clientY: number) => {
    if (activeToyId === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const xPercent = ((clientX - rect.left - dragOffset.x + 48) / rect.width) * 100;
    const yPercent = ((clientY - rect.top - dragOffset.y + 48) / rect.height) * 100;

    setToys(prev => prev.map(t => 
      t.id === activeToyId ? { ...t, x: xPercent, y: yPercent } : t
    ));
  };

  const onEnd = () => {
    if (activeToyId === null) return;
    
    const toy = toys.find(t => t.id === activeToyId);
    if (toy) {
      // Box is roughly at bottom center: x: 40-60, y: 70-90
      if (toy.x > 35 && toy.x < 65 && toy.y > 65) {
        setToys(prev => prev.map(t => t.id === activeToyId ? { ...t, isStored: true } : t));
      }
    }
    setActiveToyId(null);
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && toys.length > 0) {
      if (toys.every(t => t.isStored)) {
        handleWin();
      }
    }
  }, [toys]);

  const handleWin = async () => {
    setGameState('FINISHED');
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
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-orange-400 z-10">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Dọn Dẹp Đồ Chơi</h1>
          <p className="text-slate-500 mb-8">Hãy giúp các bạn đồ chơi về nhà nhé!</p>
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
          {/* Header Info */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm z-10">
             <span className="text-xl font-bold text-orange-600">
               Còn {toys.filter(t => !t.isStored).length} món đồ chơi cần dọn ✨
             </span>
          </div>

          {/* Toy Box Target */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 flex flex-col items-center justify-end">
             <div className="text-orange-800 font-bold mb-2 bg-orange-200/50 px-3 py-1 rounded-full text-sm">HÒM ĐỒ CHƠI</div>
             <img 
               src="https://img.icons8.com/color/240/open-box.png" 
               className={`w-full h-full transition-transform ${activeToyId !== null ? 'scale-110 rotate-1' : ''}`}
               alt="Toy Box" 
             />
             <div className="absolute inset-0 bg-orange-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
          </div>

          {/* Toys on Floor */}
          {toys.map(toy => (
            !toy.isStored && (
              <div
                key={toy.id}
                className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${activeToyId === toy.id ? 'z-50 drop-shadow-2xl scale-125' : 'z-30'}`}
                style={{
                  left: `${toy.x}%`,
                  top: `${toy.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => onMouseDown(e, toy.id)}
                onTouchStart={(e) => onTouchStart(e, toy.id)}
              >
                <img src={toy.icon} alt="toy" className="w-20 h-20 md:w-24 md:h-24 pointer-events-none" />
              </div>
            )
          ))}
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-green-400 z-10">
          <img src="https://img.icons8.com/color/144/medal.png" className="mx-auto mb-4 animate-bounce" alt="Winner" />
          <h2 className="text-3xl font-bold text-green-600 mb-2">Bé thật ngăn nắp!</h2>
          <div className="min-h-[3rem] flex items-center justify-center mb-6">
            {loading ? "..." : <p className="text-lg text-slate-700 italic">{celebrationMsg}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-orange-50 p-4 rounded-2xl text-left border-l-4 border-orange-400">
                <h3 className="font-bold text-orange-600 mb-1">{tip.title}</h3>
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

export default ToySortingGame;

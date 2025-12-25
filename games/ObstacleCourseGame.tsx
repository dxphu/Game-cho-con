
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, DentalTip, Obstacle } from '../types';
import { getObstacleCourseTips, getCelebrationMessage } from '../services/geminiService';

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

interface ObstacleCourseGameProps {
  onAwardSticker: () => void;
}

const ObstacleCourseGame: React.FC<ObstacleCourseGameProps> = ({ onAwardSticker }) => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [charPos, setCharPos] = useState({ x: 50, y: 90 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const newObstacles: Obstacle[] = [
      { id: 1, type: 'pillow', x: 30 + Math.random() * 40, y: 70, isPassed: false },
      { id: 2, type: 'chair', x: 30 + Math.random() * 40, y: 45, isPassed: false },
      { id: 3, type: 'pillow', x: 30 + Math.random() * 40, y: 20, isPassed: false },
    ];
    setObstacles(newObstacles);
    setCharPos({ x: 50, y: 90 });
    setGameState('PLAYING');
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    initGame();
  };

  const handleWin = useCallback(async () => {
    setIsDragging(false);
    setGameState('FINISHED');
    onAwardSticker();
    setLoading(true);
    try {
      const [tipsData, msg] = await Promise.all([
        getObstacleCourseTips(),
        getCelebrationMessage(playerName, 'obstacle')
      ]);
      setTips(tipsData);
      setCelebrationMsg(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [playerName, onAwardSticker]);

  useEffect(() => {
    if (gameState === 'PLAYING' && charPos.y < 10 && obstacles.length > 0 && obstacles.every(o => o.isPassed)) {
      handleWin();
    }
  }, [charPos, obstacles, gameState, handleWin]);

  const onMove = (clientX: number, clientY: number) => {
    if (!isDragging || gameState !== 'PLAYING' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const boundedX = Math.max(10, Math.min(90, x));
    const boundedY = Math.max(5, Math.min(95, y));
    setCharPos({ x: boundedX, y: boundedY });
    setObstacles(prev => prev.map(obs => {
      const dist = Math.sqrt(Math.pow(obs.x - x, 2) + Math.pow(obs.y - y, 2));
      if (dist < 10) return { ...obs, isPassed: true };
      return obs;
    }));
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative select-none bg-orange-50/30"
      ref={containerRef}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
      onMouseUp={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-purple-400 z-10 mx-4">
          <div className="mb-4">
            <SafeImage src="https://img.icons8.com/color/96/running-rabbit.png" alt="Hero" className="w-24 h-24 mx-auto" fallbackEmoji="🐇" />
          </div>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Đường Đua Tại Gia</h1>
          <p className="text-slate-500 mb-8">Bé hãy giúp bạn Thỏ vượt qua các chướng ngại vật để về đích nhé!</p>
          <form onSubmit={handleStart} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-purple-50 border-2 border-transparent focus:border-purple-400 focus:outline-none text-lg text-center"
              required
            />
            <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-xl">
              BẮT ĐẦU ĐUA
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
             <path 
               d="M 50 95 L 50 85 L 30 70 L 70 45 L 50 10" 
               stroke="#A855F7" 
               strokeWidth="40" 
               fill="none" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
             />
          </svg>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <SafeImage src="https://img.icons8.com/color/96/finish-flag.png" className="w-16 h-16" alt="Finish" fallbackEmoji="🏁" />
            <div className="text-purple-600 font-bold text-sm bg-white/80 px-3 py-1 rounded-full border border-purple-100">ĐÍCH ĐẾN</div>
          </div>

          {obstacles.map(obs => (
            <div 
              key={obs.id}
              className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${obs.isPassed ? 'opacity-40 scale-90 grayscale' : 'scale-110 drop-shadow-md'}`}
              style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
            >
              <SafeImage 
                src={obs.type === 'pillow' ? 'https://img.icons8.com/color/96/pillows.png' : 'https://img.icons8.com/color/96/chair.png'} 
                className="w-20 h-20 md:w-28 md:h-28" 
                alt={obs.type} 
                fallbackEmoji={obs.type === 'pillow' ? '🛏️' : '🪑'} 
              />
              {obs.isPassed && <div className="absolute inset-0 flex items-center justify-center text-4xl">✅</div>}
            </div>
          ))}

          <div 
            className={`absolute transition-transform duration-150 cursor-grab active:cursor-grabbing z-50 transform -translate-x-1/2 -translate-y-1/2 ${isDragging ? 'scale-125' : ''}`}
            style={{ left: `${charPos.x}%`, top: `${charPos.y}%` }}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="relative">
              <SafeImage 
                src="https://img.icons8.com/color/96/running-rabbit.png" 
                className="w-24 h-24 drop-shadow-lg" 
                alt="Player" 
                fallbackEmoji="🐇" 
              />
              {!isDragging && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-purple-600 animate-bounce whitespace-nowrap border border-purple-100">
                   Giữ và kéo bé đi nhé! 👇
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm text-purple-600 font-bold">
            ✨ Tiến lên nào bé ơi!
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-purple-400 z-10 mx-4 overflow-y-auto max-h-[90vh]">
          <SafeImage src="https://img.icons8.com/color/96/medal.png" className="w-24 h-24 mx-auto mb-4 animate-bounce" alt="Winner" fallbackEmoji="🏅" />
          <h2 className="text-3xl font-bold text-purple-600 mb-2">Bé thật dũng cảm!</h2>
          <p className="text-lg text-slate-700 italic mb-6">{loading ? "Đang xem thành tích..." : celebrationMsg}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-purple-50 p-4 rounded-2xl text-left border-l-4 border-purple-400">
                <h3 className="font-bold text-purple-600 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-600">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI TIẾP</button>
        </div>
      )}
    </div>
  );
};

export default ObstacleCourseGame;

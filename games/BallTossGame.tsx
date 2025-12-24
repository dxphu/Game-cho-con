
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, DentalTip } from '../types';
import { getBallTossTips, getCelebrationMessage } from '../services/geminiService';

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

const BallTossGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(10);
  const [ballPos, setBallPos] = useState({ x: 50, y: 85 });
  const [basketX, setBasketX] = useState(50);
  const [isThrowing, setIsThrowing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [hitFeedback, setHitFeedback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getRandomBasketPos = () => 20 + Math.random() * 60;

  const initGame = useCallback(() => {
    setScore(0);
    setBallsLeft(10);
    setBasketX(50);
    setGameState('PLAYING');
    setBallPos({ x: 50, y: 85 });
    setDragStart(null);
    setDragCurrent(null);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    initGame();
  };

  const handleWin = useCallback(async () => {
    setGameState('FINISHED');
    setLoading(true);
    try {
      const [tipsData, msg] = await Promise.all([
        getBallTossTips(),
        getCelebrationMessage(playerName, 'balltoss')
      ]);
      setTips(tipsData);
      setCelebrationMsg(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [playerName]);

  const onStartDrag = (clientX: number, clientY: number) => {
    if (isThrowing || gameState !== 'PLAYING') return;
    setDragStart({ x: clientX, y: clientY });
    setDragCurrent({ x: clientX, y: clientY });
  };

  const onMoveDrag = (clientX: number, clientY: number) => {
    if (!dragStart || isThrowing) return;
    setDragCurrent({ x: clientX, y: clientY });
  };

  const onEndDrag = (clientX: number, clientY: number) => {
    if (!dragStart || isThrowing) return;
    
    const dy = clientY - dragStart.y;
    const dx = clientX - dragStart.x;
    
    // Chỉ ném nếu vuốt lên (dy âm)
    if (dy < -30) {
      setIsThrowing(true);
      setDragCurrent(null);
      
      const targetY = 20; // Độ cao của rổ
      const targetX = 50 + (dx / 5); // Độ lệch ngang dựa trên vuốt
      
      setTimeout(() => {
        setBallPos({ x: targetX, y: targetY });
        
        setTimeout(() => {
          const isHit = Math.abs(targetX - basketX) < 12;
          if (isHit) {
            setScore(s => s + 1);
            setHitFeedback(true);
            setTimeout(() => setHitFeedback(false), 1000);
          }
          
          setBallsLeft(prev => prev - 1);

          setTimeout(() => {
            if (ballsLeft <= 1) {
               handleWin();
            } else {
              setBasketX(getRandomBasketPos());
              setBallPos({ x: 50, y: 85 });
              setIsThrowing(false);
              setDragStart(null);
              setDragCurrent(null);
            }
          }, 800);
        }, 400);
      }, 50);
    } else {
      setDragStart(null);
      setDragCurrent(null);
    }
  };

  // Tính toán các thông số cho mũi tên vector
  const getVectorStyle = () => {
    if (!dragStart || !dragCurrent || isThrowing) return null;
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;
    
    // Chỉ hiện mũi tên nếu bé đang vuốt lên
    if (dy >= 0) return null;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
    
    return {
      angle: angle + 90, // Cộng 90 vì SVG arrow mặc định hướng lên
      length,
      opacity: Math.min(length / 30, 1)
    };
  };

  const vector = getVectorStyle();

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative select-none bg-yellow-50/20 touch-none"
      ref={containerRef}
      onMouseDown={(e) => onStartDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => onMoveDrag(e.clientX, e.clientY)}
      onMouseUp={(e) => onEndDrag(e.clientX, e.clientY)}
      onTouchStart={(e) => onStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => onMoveDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => onEndDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
    >
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-yellow-400 z-10 mx-4">
          <SafeImage src="https://img.icons8.com/color/96/basketball-net.png" className="w-24 h-24 mx-auto mb-4" alt="Basket" fallbackEmoji="🏀" />
          <h1 className="text-3xl font-bold text-yellow-600 mb-2">Siêu Thủ Ném Bóng</h1>
          <p className="text-slate-500 mb-8 text-sm">Vuốt từ quả bóng lên phía trên để ném vào rổ nhé!</p>
          <form onSubmit={handleStart} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-yellow-50 border-2 border-transparent focus:border-yellow-400 focus:outline-none text-lg text-center"
              required
            />
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-xl">
              BẮT ĐẦU CHƠI
            </button>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full relative overflow-hidden flex flex-col items-center">
          {/* Thông tin game */}
          <div className="absolute top-4 w-full flex justify-around px-8 z-10">
            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-yellow-100 flex items-center space-x-2">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-yellow-700">Điểm: {score}</span>
            </div>
            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-yellow-100 flex items-center space-x-2">
              <span className="text-lg">🏀</span>
              <span className="font-bold text-yellow-700">Bóng: {ballsLeft}</span>
            </div>
          </div>

          {/* Rổ bóng */}
          <div 
            className="absolute transition-all duration-700 ease-in-out transform -translate-x-1/2"
            style={{ left: `${basketX}%`, top: '15%' }}
          >
            <div className="relative">
               <SafeImage 
                 src="https://img.icons8.com/color/144/basketball-net.png" 
                 className={`w-32 h-32 md:w-40 md:h-40 transition-transform ${hitFeedback ? 'scale-125' : 'scale-100'}`} 
                 alt="Basket" 
                 fallbackEmoji="🧺" 
               />
               {hitFeedback && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl animate-ping">✨</span>
                 </div>
               )}
            </div>
          </div>

          {/* Mũi tên hướng dẫn (Vector) */}
          {vector && (
            <div 
              className="absolute pointer-events-none z-20 origin-bottom"
              style={{ 
                left: `${ballPos.x}%`, 
                top: `${ballPos.y}%`, 
                transform: `translate(-50%, -100%) rotate(${vector.angle}deg)`,
                opacity: vector.opacity
              }}
            >
              <svg width="40" height={vector.length} viewBox={`0 0 40 ${vector.length}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="arrowGradient" x1="20" y1="0" x2="20" y2={vector.length} gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FACC15" />
                    <stop offset="1" stopColor="#F87171" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M20 ${vector.length} V10 M10 15 L20 0 L30 15`} 
                  stroke="url(#arrowGradient)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeDasharray="8 4"
                />
              </svg>
            </div>
          )}

          {/* Bóng */}
          <div 
            className={`absolute transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 ${isThrowing ? 'scale-75 blur-[0.5px]' : 'scale-100'}`}
            style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
          >
            <div className="relative group">
              <SafeImage 
                src="https://img.icons8.com/color/96/basketball.png" 
                className={`w-20 h-20 md:w-24 md:h-24 drop-shadow-xl ${isThrowing ? 'animate-spin' : ''}`} 
                alt="Ball" 
                fallbackEmoji="🏀" 
              />
              {!isThrowing && !dragStart && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-md text-sm font-bold text-yellow-600 animate-bounce border border-yellow-100 whitespace-nowrap">
                  Kéo lên để ném!  ☝️
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-6 text-yellow-900 font-bold bg-white/70 px-6 py-2 rounded-full border-2 border-yellow-300 backdrop-blur-sm shadow-sm text-sm">
             Ngắm rổ rồi ném nhé! 🏆
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-yellow-400 z-10 mx-4 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="text-6xl mb-4 animate-bounce">🥇</div>
          <h2 className="text-3xl font-bold text-yellow-600 mb-2">Bé là Siêu Thủ!</h2>
          <p className="text-2xl font-bold text-slate-800 mb-4">Ghi được: {score} điểm</p>
          <p className="text-sm text-slate-700 italic mb-6 leading-relaxed">{loading ? "Đang tổng kết..." : celebrationMsg}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-yellow-50 p-4 rounded-2xl text-left border-l-4 border-yellow-400">
                <h3 className="font-bold text-yellow-600 text-sm mb-1">{tip.title}</h3>
                <p className="text-[12px] text-slate-600 leading-snug">{tip.content}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl">CHƠI TIẾP</button>
        </div>
      )}
    </div>
  );
};

export default BallTossGame;

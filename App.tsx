
import React, { useState } from 'react';
import { GameInfo } from './types';
import ToothGame from './games/ToothGame';
import ToySortingGame from './games/ToySortingGame';
import PlantWateringGame from './games/PlantWateringGame';
import ObstacleCourseGame from './games/ObstacleCourseGame';
import BallTossGame from './games/BallTossGame';
import RolePlayGame from './games/RolePlayGame';

const SafeIcon: React.FC<{ src: string; fallback: string; className?: string }> = ({ src, fallback, className }) => {
  const [error, setError] = useState(false);
  if (error) return <span className="text-2xl">{fallback}</span>;
  return <img src={src} onError={() => setError(true)} className={className} alt="icon" />;
};

const GAMES: GameInfo[] = [
  {
    id: 'tooth',
    title: 'Đánh Răng Xinh',
    icon: 'https://img.icons8.com/color/96/toothbrush.png',
    fallback: '🪥',
    color: 'bg-sky-400',
    description: 'Bé giúp bạn Răng luôn trắng sáng và thơm tho nhé!'
  },
  {
    id: 'roleplay',
    title: 'Bé Tập Đóng Vai',
    icon: 'https://img.icons8.com/color/96/work.png',
    fallback: '🎭',
    color: 'bg-rose-400',
    description: 'Hóa thân thành Bác sĩ, Đầu bếp tài ba nào.'
  },
  {
    id: 'toys',
    title: 'Sắp Xếp Đồ Chơi',
    icon: 'https://img.icons8.com/color/96/teddy-bear.png',
    fallback: '🧸',
    color: 'bg-amber-400',
    description: 'Cùng dọn dẹp phòng thật ngăn nắp bé nhé!'
  },
  {
    id: 'plants',
    title: 'Tưới Cây Xanh',
    icon: 'https://img.icons8.com/color/96/potted-plant.png',
    fallback: '🪴',
    color: 'bg-emerald-400',
    description: 'Chăm sóc những mầm xanh lớn thật nhanh.'
  },
  {
    id: 'obstacle',
    title: 'Đường Đua Nhí',
    icon: 'https://img.icons8.com/color/96/running-rabbit.png',
    fallback: '🐇',
    color: 'bg-indigo-400',
    description: 'Vượt chướng ngại vật về đích thôi nào!'
  },
  {
    id: 'balltoss',
    title: 'Siêu Thủ Ném Bóng',
    icon: 'https://img.icons8.com/color/96/basketball-net.png',
    fallback: '🏀',
    color: 'bg-yellow-500',
    description: 'Ném bóng thật chuẩn vào rổ nhé bé ơi!'
  }
];

const App: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string>('tooth');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

  const handleGameSelect = (id: string) => {
    setSelectedGameId(id);
    setIsMobileMenuOpen(false);
  };

  const renderGame = () => {
    switch (selectedGameId) {
      case 'tooth': return <ToothGame />;
      case 'toys': return <ToySortingGame />;
      case 'plants': return <PlantWateringGame />;
      case 'obstacle': return <ObstacleCourseGame />;
      case 'balltoss': return <BallTossGame />;
      case 'roleplay': return <RolePlayGame />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-sky-50 overflow-hidden font-['Quicksand'] relative">
      <main className="flex-1 flex flex-col min-w-0 bg-white/50 backdrop-blur-xl md:bg-transparent transition-all duration-300">
        <header className="h-20 px-6 flex items-center justify-between z-30">
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border-b-4 border-blue-100 rotate-3 shrink-0">
               <span className="text-2xl font-black text-blue-500">K</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-slate-800 text-xl leading-none">{activeGame.title}</h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">KidPlay Hub ✨</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-md border-b-4 border-yellow-200 text-sm font-black text-slate-700 flex items-center">
              <span className="mr-2 text-lg">⭐</span> 120
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-white/20 rounded-t-[40px] shadow-2xl">
          {renderGame()}
        </div>
      </main>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar / Drawer */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-[50] transition-all duration-500 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-[85vw] max-w-[350px]' : 'translate-x-full w-[85vw] max-w-[350px]'}
        md:relative md:translate-x-0 md:shadow-none md:border-l md:border-white/50
        ${isSidebarCollapsed ? 'md:w-24' : 'md:w-80'}
      `}>
        <div className="h-24 flex items-center justify-between px-8 shrink-0">
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <span className="text-2xl font-black text-slate-800 tracking-tighter italic">VUI CHƠI <span className="text-blue-500 underline decoration-4 decoration-blue-100 underline-offset-4">THÔI!</span></span>
          )}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`w-full flex items-center p-4 rounded-[32px] transition-all duration-300 group relative ${
                selectedGameId === game.id 
                ? `${game.color} text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] scale-[1.02] z-10` 
                : 'bg-white hover:bg-slate-50 text-slate-600 shadow-sm border-b-4 border-slate-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all ${selectedGameId === game.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                <SafeIcon src={game.icon} fallback={game.fallback || '🎮'} className="w-10 h-10 object-contain" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="ml-4 text-left overflow-hidden">
                  <div className="font-black text-base leading-none mb-1 truncate">{game.title}</div>
                  <div className={`text-[11px] font-bold leading-tight opacity-80 ${selectedGameId === game.id ? 'text-white' : 'text-slate-400'}`}>
                    {game.description.split('.')[0]}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 hidden md:block border-t border-slate-100/50">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center py-4 rounded-2xl bg-slate-100/50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-bold"
          >
            {isSidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <span>THU GỌN LẠI</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default App;

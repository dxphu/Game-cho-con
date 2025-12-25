
import React, { useState, useEffect } from 'react';
import { GameInfo } from './types';
import ToothGame from './games/ToothGame';
import ToySortingGame from './games/ToySortingGame';
import PlantWateringGame from './games/PlantWateringGame';
import ObstacleCourseGame from './games/ObstacleCourseGame';
import BallTossGame from './games/BallTossGame';
import RolePlayGame from './games/RolePlayGame';

const SafeIcon: React.FC<{ src: string; fallback: string; className?: string }> = ({ src, fallback, className }) => {
  const [error, setError] = useState(false);
  if (error) return <span className="text-xl">{fallback}</span>;
  return <img src={src} onError={() => setError(true)} className={className} alt="icon" />;
};

const GAMES: GameInfo[] = [
  {
    id: 'tooth',
    title: 'Bé Tập Đánh Răng',
    icon: 'https://img.icons8.com/color/96/toothbrush.png',
    fallback: '🪥',
    color: 'bg-blue-400',
    description: 'Giúp bé học cách làm sạch răng miệng.'
  },
  {
    id: 'roleplay',
    title: 'Đóng Vai Nghề Nghiệp',
    icon: 'https://img.icons8.com/color/96/work.png',
    fallback: '🎭',
    color: 'bg-rose-400',
    description: 'Bé làm bác sĩ, đầu bếp hoặc người bán hàng.'
  },
  {
    id: 'toys',
    title: 'Sắp Xếp Đồ Chơi',
    icon: 'https://img.icons8.com/color/96/teddy-bear.png',
    fallback: '🧸',
    color: 'bg-orange-400',
    description: 'Học cách dọn dẹp phòng ngăn nắp.'
  },
  {
    id: 'plants',
    title: 'Tưới Cây Xanh',
    icon: 'https://img.icons8.com/color/96/potted-plant.png',
    fallback: '🪴',
    color: 'bg-green-400',
    description: 'Chăm sóc môi trường xung quanh.'
  },
  {
    id: 'obstacle',
    title: 'Vượt Chướng Ngại Vật',
    icon: 'https://img.icons8.com/color/96/running-rabbit.png',
    fallback: '🐇',
    color: 'bg-purple-400',
    description: 'Rèn luyện kỹ năng vận động thô tại gia.'
  },
  {
    id: 'balltoss',
    title: 'Ném Bóng Vào Rổ',
    icon: 'https://img.icons8.com/color/96/basketball-net.png',
    fallback: '🏀',
    color: 'bg-yellow-500',
    description: 'Rèn luyện sự khéo léo và khả năng ước lượng.'
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
      <main className="flex-1 flex flex-col min-w-0 bg-white md:bg-sky-50 transition-all duration-300">
        <header className="h-16 bg-white/80 backdrop-blur-md px-4 flex items-center justify-between border-b border-sky-100 z-20">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">K</div>
            <h1 className="font-bold text-slate-800 text-base md:text-xl truncate">
              {activeGame.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
              ⭐ 120
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-blue-50 text-blue-600 active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {renderGame()}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 right-0 h-full bg-white shadow-2xl z-[50] transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-[80vw] max-w-[320px]' : 'translate-x-full w-[80vw] max-w-[320px]'}
        md:relative md:translate-x-0 md:shadow-none md:border-l md:border-sky-100
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sky-100 shrink-0">
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <span className="text-xl font-bold text-slate-800">Trò chơi</span>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                selectedGameId === game.id 
                ? `${game.color} text-white shadow-lg` 
                : 'hover:bg-sky-50 text-slate-600'
              }`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <SafeIcon src={game.icon} fallback={game.fallback || '🎮'} className="w-8 h-8 object-contain" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="ml-3 text-left overflow-hidden">
                  <div className="font-bold text-sm leading-tight truncate">{game.title}</div>
                  <div className={`text-[10px] truncate opacity-80 ${selectedGameId === game.id ? 'text-white' : 'text-slate-400'}`}>
                    {game.description.split('.')[0]}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-100 hidden md:block">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-blue-500 transition-colors"
          >
            {isSidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <div className="flex items-center space-x-2 text-sm font-bold">
                <span>Thu gọn</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default App;

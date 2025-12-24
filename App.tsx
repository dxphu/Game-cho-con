
import React, { useState } from 'react';
import { GameInfo } from './types';
import ToothGame from './games/ToothGame';
import ToySortingGame from './games/ToySortingGame';
import PlantWateringGame from './games/PlantWateringGame';

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
  }
];

const App: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string>('tooth');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

  const renderGame = () => {
    switch (selectedGameId) {
      case 'tooth': return <ToothGame />;
      case 'toys': return <ToySortingGame />;
      case 'plants': return <PlantWateringGame />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden font-['Quicksand']">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-white shadow-2xl z-20 flex flex-col`}>
        <div className="p-6 flex items-center space-x-3 border-b border-sky-100">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">K</div>
          {isSidebarOpen && <span className="text-xl font-bold text-slate-800">KidPlay Hub</span>}
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                selectedGameId === game.id ? `${game.color} text-white shadow-lg` : 'hover:bg-sky-100 text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-xl bg-white/20 group-hover:scale-110 transition-transform flex items-center justify-center w-10 h-10`}>
                <SafeIcon src={game.icon} fallback={game.fallback || '🎮'} className="w-8 h-8 object-contain" />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 text-left">
                  <div className="font-bold text-sm leading-tight">{game.title}</div>
                  <div className={`text-[10px] opacity-70 ${selectedGameId === game.id ? 'text-white' : 'text-slate-400'}`}>Vui & Bổ ích</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-100">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full p-2 hover:bg-sky-50 rounded-xl text-slate-400 text-center">
            {isSidebarOpen ? '← Thu gọn' : '→'}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-16 bg-white/50 backdrop-blur-md px-8 flex items-center justify-between border-b border-sky-100 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Trò chơi:</span>
            <span className="font-bold text-slate-800 text-lg">{activeGame.title}</span>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-bold flex items-center">⭐ 120 điểm</div>
        </header>

        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {renderGame()}
        </div>
      </main>
    </div>
  );
};

export default App;

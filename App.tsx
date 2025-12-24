
import React, { useState } from 'react';
import { GameInfo } from './types';
import ToothGame from './games/ToothGame';
import ToySortingGame from './games/ToySortingGame';
import PlantWateringGame from './games/PlantWateringGame';

const GAMES: GameInfo[] = [
  {
    id: 'tooth',
    title: 'Bé Tập Đánh Răng',
    icon: 'https://img.icons8.com/color/96/toothbrush.png',
    color: 'bg-blue-400',
    description: 'Giúp bé học cách làm sạch răng miệng.'
  },
  {
    id: 'toys',
    title: 'Sắp Xếp Đồ Chơi',
    icon: 'https://img.icons8.com/color/96/teddy-bear.png',
    color: 'bg-orange-400',
    description: 'Học cách dọn dẹp phòng ngăn nắp.'
  },
  {
    id: 'plants',
    title: 'Tưới Cây Xanh',
    icon: 'https://img.icons8.com/color/96/potted-plant.png',
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
      case 'tooth':
        return <ToothGame />;
      case 'toys':
        return <ToySortingGame />;
      case 'plants':
        return <PlantWateringGame />;
      default:
        return (
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm border-t-8 border-slate-200">
             <div className="mb-4 grayscale opacity-50">
                <img src={activeGame.icon} className="w-24 h-24 mx-auto" alt="Coming soon" />
             </div>
             <h3 className="text-2xl font-bold text-slate-700 mb-2">Sắp ra mắt!</h3>
             <p className="text-slate-500 mb-6">{activeGame.description}</p>
             <button 
              onClick={() => setSelectedGameId('tooth')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg"
             >
               Quay lại Đánh Răng
             </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden font-['Quicksand']">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-white shadow-2xl z-20 flex flex-col`}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-sky-100">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            B
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-bold text-slate-800">KidPlay Hub</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                selectedGameId === game.id 
                  ? `${game.color} text-white shadow-lg` 
                  : 'hover:bg-sky-100 text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-xl bg-white/20 group-hover:scale-110 transition-transform ${selectedGameId === game.id ? 'bg-white/20' : 'bg-sky-50'}`}>
                <img src={game.icon} alt={game.title} className="w-8 h-8 object-contain" />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 text-left">
                  <div className="font-bold text-sm leading-tight">{game.title}</div>
                  <div className={`text-[10px] opacity-70 ${selectedGameId === game.id ? 'text-white' : 'text-slate-400'}`}>
                    Vui & Bổ ích
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 hover:bg-sky-50 rounded-xl text-slate-400 flex items-center justify-center transition-colors"
          >
            {isSidebarOpen ? '← Thu gọn' : '→'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Header/Title Bar */}
        <header className="h-16 bg-white/50 backdrop-blur-md px-8 flex items-center justify-between border-b border-sky-100">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Trò chơi:</span>
            <span className="font-bold text-slate-800 text-lg">{activeGame.title}</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-bold flex items-center">
               <span className="mr-1">⭐</span> 120 điểm
             </div>
          </div>
        </header>

        {/* Game Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {renderGame()}
        </div>

        {/* Decorative background for the main area */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-100/30 rounded-full blur-[100px] -z-10" />
      </main>
    </div>
  );
};

export default App;

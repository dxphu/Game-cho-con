
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, DentalTip } from '../types';
import { getRolePlayTips, getCelebrationMessage } from '../services/geminiService';

type Job = 'doctor' | 'chef' | 'cashier';

interface JobData {
  id: Job;
  title: string;
  emoji: string;
  icon: string;
  color: string;
  task: string;
}

const JOBS: JobData[] = [
  { id: 'doctor', title: 'Bác Sĩ Nhí', emoji: '🩺', icon: 'https://img.icons8.com/color/144/doctor-male.png', color: 'bg-blue-400', task: 'Khám bệnh cho Gấu bông' },
  { id: 'chef', title: 'Đầu Bếp Tài Ba', emoji: '🧑‍🍳', icon: 'https://img.icons8.com/color/144/chef-hat.png', color: 'bg-orange-400', task: 'Nấu súp rau củ' },
  { id: 'cashier', title: 'Người Bán Hàng', emoji: '🛒', icon: 'https://img.icons8.com/color/144/cash-register.png', color: 'bg-green-400', task: 'Quét mã tính tiền' }
];

const RolePlayGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const startJob = (job: Job) => {
    setSelectedJob(job);
    setTaskProgress(0);
    setGameState('PLAYING');
  };

  const completeTask = () => {
    if (taskProgress < 100) {
      setTaskProgress(prev => Math.min(prev + 34, 100));
    }
  };

  useEffect(() => {
    if (taskProgress >= 100 && gameState === 'PLAYING') {
      handleWin();
    }
  }, [taskProgress]);

  const handleWin = async () => {
    setGameState('FINISHED');
    setLoading(true);
    try {
      const currentJobTitle = JOBS.find(j => j.id === selectedJob)?.title || 'nghề nghiệp';
      const [tipsData, msg] = await Promise.all([
        getRolePlayTips(currentJobTitle),
        getCelebrationMessage(playerName, 'roleplay')
      ]);
      setTips(tipsData);
      setCelebrationMsg(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderScenario = () => {
    switch (selectedJob) {
      case 'doctor':
        return (
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <img src="https://img.icons8.com/color/240/teddy-bear.png" className="w-48 h-48 md:w-64 md:h-64" alt="Teddy" />
              {taskProgress < 50 && <span className="absolute top-0 right-0 text-4xl animate-bounce">🤒</span>}
              {taskProgress >= 100 && <span className="absolute top-0 right-0 text-4xl">😊💖</span>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['Stethoscope', 'Thermometer', 'Bandage'].map((item, idx) => (
                <button 
                  key={item} 
                  onClick={completeTask}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`p-4 rounded-2xl shadow-md border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-gray-100 opacity-50' : 'bg-white border-blue-200 hover:scale-110 active:scale-90'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${item.toLowerCase()}.png`} className="w-12 h-12" alt={item} />
                </button>
              ))}
            </div>
          </div>
        );
      case 'chef':
        return (
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <img src="https://img.icons8.com/color/240/cooking-pot.png" className={`w-48 h-48 md:w-64 md:h-64 ${taskProgress > 0 ? 'animate-bounce' : ''}`} alt="Pot" />
              {taskProgress > 0 && <div className="absolute top-0 left-1/2 -translate-x-1/2 flex space-x-1 animate-pulse"><span className="text-2xl">♨️</span><span className="text-2xl">♨️</span></div>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['Carrot', 'Tomato', 'Broccoli'].map((food, idx) => (
                <button 
                  key={food} 
                  onClick={completeTask}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`p-4 rounded-2xl shadow-md border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-gray-100 opacity-50' : 'bg-white border-orange-200 hover:scale-110 active:scale-90'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${food.toLowerCase()}.png`} className="w-12 h-12" alt={food} />
                </button>
              ))}
            </div>
          </div>
        );
      case 'cashier':
        return (
          <div className="flex flex-col items-center space-y-8">
             <div className="bg-white p-6 rounded-3xl shadow-inner border-4 border-green-100 flex flex-col items-center">
                <img src="https://img.icons8.com/color/144/shopping-cart.png" className="w-32 h-32 mb-4" alt="Cart" />
                <div className="text-2xl font-bold text-green-600">Tổng: {Math.floor(taskProgress * 1000)}đ</div>
             </div>
             <div className="grid grid-cols-3 gap-4">
              {['Milk', 'Bread', 'Apple'].map((item, idx) => (
                <button 
                  key={item} 
                  onClick={() => {
                    completeTask();
                    // Giả lập âm thanh tít tít
                    window.navigator.vibrate?.(50);
                  }}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`p-4 rounded-2xl shadow-md border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-gray-100 opacity-50' : 'bg-white border-green-200 hover:scale-110 active:scale-90'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${item.toLowerCase()}.png`} className="w-12 h-12" alt={item} />
                  <div className="text-[10px] font-bold mt-1">QUÉT MÃ</div>
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden relative bg-rose-50/20">
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border-t-8 border-rose-400 z-10 animate-float">
          <h1 className="text-3xl font-bold text-rose-600 mb-2">Bé Tập Đóng Vai</h1>
          <p className="text-slate-500 mb-8">Hôm nay bé muốn trở thành ai nhỉ?</p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên bé..."
              className="w-full px-4 py-3 rounded-2xl bg-rose-50 border-2 border-transparent focus:border-rose-400 focus:outline-none text-lg text-center font-bold"
              required
            />
            <div className="grid grid-cols-1 gap-3">
              {JOBS.map(job => (
                <button 
                  key={job.id}
                  onClick={() => playerName && startJob(job.id)}
                  className={`flex items-center p-4 rounded-2xl border-2 border-transparent hover:border-rose-200 transition-all shadow-sm ${job.color} text-white font-bold text-lg active:scale-95`}
                >
                  <img src={job.icon} className="w-12 h-12 mr-4" alt={job.title} />
                  <div className="text-left">
                    <div className="text-sm opacity-80 uppercase">Bé làm:</div>
                    <div>{job.title}</div>
                  </div>
                  <span className="ml-auto text-2xl">✨</span>
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full flex flex-col items-center">
          <header className="w-full flex justify-between items-center px-4 py-4 z-10">
            <button onClick={() => setGameState('START')} className="p-2 rounded-full bg-white shadow text-rose-500 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-rose-100 flex items-center">
              <span className="text-lg mr-2">🎯</span>
              <span className="font-bold text-rose-700">{JOBS.find(j => j.id === selectedJob)?.task}</span>
            </div>
            <div className="w-10"></div>
          </header>

          <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
            {renderScenario()}
          </div>

          <div className="w-full max-w-xs h-3 bg-white rounded-full overflow-hidden mb-12 border border-rose-100">
            <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${taskProgress}%` }} />
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl text-center border-b-8 border-rose-400 z-10 mx-4 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="text-6xl mb-4 animate-bounce">🎭</div>
          <h2 className="text-3xl font-bold text-rose-600 mb-2">Tuyệt vời quá!</h2>
          <p className="text-lg text-slate-700 italic mb-6 leading-relaxed">
            {loading ? "Đang chờ quà..." : celebrationMsg}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-rose-50 p-4 rounded-2xl text-left border-l-4 border-rose-400">
                <h3 className="font-bold text-rose-600 text-sm mb-1">{tip.title}</h3>
                <p className="text-[12px] text-slate-600 leading-snug">{tip.content}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setGameState('START')} 
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all text-xl"
            >
              HÓA THÂN TIẾP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePlayGame;

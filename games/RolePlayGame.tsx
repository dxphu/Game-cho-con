
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
  bgColor: string;
}

const JOBS: JobData[] = [
  { id: 'doctor', title: 'Bác Sĩ Nhí', emoji: '🩺', icon: 'https://img.icons8.com/color/144/doctor-male.png', color: 'bg-blue-500', bgColor: 'bg-blue-50', task: 'Khám bệnh cho Gấu bông' },
  { id: 'chef', title: 'Đầu Bếp Tài Ba', emoji: '🧑‍🍳', icon: 'https://img.icons8.com/color/144/chef-hat.png', color: 'bg-orange-500', bgColor: 'bg-orange-50', task: 'Nấu súp rau củ' },
  { id: 'cashier', title: 'Người Bán Hàng', emoji: '🛒', icon: 'https://img.icons8.com/color/144/cash-register.png', color: 'bg-green-500', bgColor: 'bg-green-50', task: 'Quét mã tính tiền' }
];

const RolePlayGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerName, setPlayerName] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [tips, setTips] = useState<DentalTip[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const startJob = (job: Job) => {
    setSelectedJob(job);
    setTaskProgress(0);
    setGameState('PLAYING');
  };

  const completeTask = () => {
    if (taskProgress < 100) {
      setTaskProgress(prev => Math.min(prev + 34, 100));
      setShowReward(true);
      setTimeout(() => setShowReward(false), 800);
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

  const jobInfo = JOBS.find(j => j.id === selectedJob);

  const renderScenario = () => {
    switch (selectedJob) {
      case 'doctor':
        return (
          <div className="flex flex-col items-center space-y-8 w-full">
            <div className="relative p-12 bg-white rounded-[40px] shadow-2xl border-b-8 border-blue-100 overflow-hidden">
               {/* Họa tiết nền phòng khám */}
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
               
               <img src="https://img.icons8.com/color/240/teddy-bear.png" className="w-48 h-48 md:w-64 md:h-64 relative z-10" alt="Teddy" />
               {taskProgress < 50 && <span className="absolute top-8 right-8 text-5xl animate-bounce">🤒</span>}
               {taskProgress >= 100 && <span className="absolute top-8 right-8 text-5xl">💖</span>}
            </div>
            <div className="flex space-x-6">
              {['Stethoscope', 'Thermometer', 'Bandage'].map((item, idx) => (
                <button 
                  key={item} 
                  onClick={completeTask}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`group relative p-6 rounded-3xl shadow-lg border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-slate-100 border-transparent grayscale' : 'bg-white border-blue-200 hover:scale-110 active:scale-95'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${item.toLowerCase()}.png`} className="w-16 h-16" alt={item} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">{idx + 1}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'chef':
        return (
          <div className="flex flex-col items-center space-y-8 w-full">
            <div className="relative p-12 bg-white rounded-[40px] shadow-2xl border-b-8 border-orange-100 overflow-hidden">
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #f97316 25%, transparent 25%, transparent 75%, #f97316 75%, #f97316), linear-gradient(45deg, #f97316 25%, transparent 25%, transparent 75%, #f97316 75%, #f97316)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }} />
               
               <img src="https://img.icons8.com/color/240/cooking-pot.png" className={`w-48 h-48 md:w-64 md:h-64 relative z-10 ${taskProgress > 0 ? 'animate-bounce' : ''}`} alt="Pot" />
               {taskProgress > 0 && <div className="absolute top-6 left-1/2 -translate-x-1/2 flex space-x-2 animate-pulse z-20"><span className="text-3xl">♨️</span><span className="text-3xl">♨️</span></div>}
            </div>
            <div className="flex space-x-6">
              {['Carrot', 'Tomato', 'Broccoli'].map((food, idx) => (
                <button 
                  key={food} 
                  onClick={completeTask}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`group relative p-6 rounded-3xl shadow-lg border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-slate-100 border-transparent grayscale' : 'bg-white border-orange-200 hover:scale-110 active:scale-95'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${food.toLowerCase()}.png`} className="w-16 h-16" alt={food} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">{idx + 1}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'cashier':
        return (
          <div className="flex flex-col items-center space-y-8 w-full">
             <div className="relative p-12 bg-white rounded-[40px] shadow-2xl border-b-8 border-green-100 flex flex-col items-center w-full max-w-sm overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 2px, transparent 2px)', backgroundSize: '25px 25px' }} />
                
                <img src="https://img.icons8.com/color/144/shopping-cart.png" className="w-32 h-32 mb-6 relative z-10" alt="Cart" />
                <div className="text-4xl font-black text-green-600 font-mono tracking-tighter relative z-10">
                   {taskProgress === 0 ? '00.00' : `${Math.floor(taskProgress * 123)}đ`}
                </div>
                <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Hóa đơn điện tử</div>
             </div>
             <div className="flex space-x-6">
              {['Milk', 'Bread', 'Apple'].map((item, idx) => (
                <button 
                  key={item} 
                  onClick={() => {
                    completeTask();
                    window.navigator.vibrate?.(40);
                  }}
                  disabled={taskProgress >= (idx + 1) * 33}
                  className={`group relative p-6 rounded-3xl shadow-lg border-2 transition-all ${taskProgress >= (idx + 1) * 33 ? 'bg-slate-100 border-transparent grayscale' : 'bg-white border-green-200 hover:scale-110 active:scale-95'}`}
                >
                  <img src={`https://img.icons8.com/color/96/${item.toLowerCase()}.png`} className="w-16 h-16" alt={item} />
                  <div className="text-[10px] font-black mt-2 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">SCAN IT</div>
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-700 ${gameState === 'PLAYING' ? jobInfo?.bgColor : 'bg-rose-50/20'}`}>
      {/* Các hình khối trôi nổi trang trí */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float-slow">🎨</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-float-slow" style={{ animationDelay: '2s' }}>🎭</div>
      <div className="absolute top-1/2 left-20 text-4xl opacity-5 animate-float-slow" style={{ animationDelay: '4s' }}>✨</div>

      {gameState === 'START' && (
        <div className="max-w-md w-full bg-white rounded-[40px] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] text-center border-t-8 border-rose-400 z-10">
          <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
             <img src="https://img.icons8.com/color/96/work.png" className="w-16 h-16" alt="Work" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Bé Tập Đóng Vai</h1>
          <p className="text-slate-500 mb-10 text-lg">Hôm nay bé muốn giúp đỡ mọi người với vai trò nào?</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Tên của bé là..."
              className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-rose-300 focus:outline-none text-xl text-center font-bold text-slate-700 transition-all"
              required
            />
            <div className="grid grid-cols-1 gap-4 pt-4">
              {JOBS.map(job => (
                <button 
                  key={job.id}
                  onClick={() => playerName && startJob(job.id)}
                  className={`flex items-center p-5 rounded-3xl border-2 border-transparent hover:border-white transition-all shadow-lg active:scale-95 group overflow-hidden relative ${job.color} text-white font-bold text-xl`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-5 shrink-0">
                    <img src={job.icon} className="w-10 h-10" alt={job.title} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-[10px] opacity-70 uppercase font-black tracking-widest">Ước mơ của bé:</div>
                    <div className="leading-tight">{job.title}</div>
                  </div>
                  <span className="text-3xl group-hover:translate-x-1 transition-transform">➡️</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="w-full h-full flex flex-col items-center max-w-4xl relative">
          {/* Header trong game */}
          <header className="w-full flex justify-between items-center px-4 py-6 z-20">
            <button 
              onClick={() => setGameState('START')} 
              className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-rose-500 hover:scale-110 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-3xl shadow-lg border border-white flex items-center space-x-3">
              <span className="text-2xl animate-pulse">🎯</span>
              <span className="font-black text-slate-700 tracking-tight">{jobInfo?.task}</span>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl">
               {jobInfo?.emoji}
            </div>
          </header>

          <div className="flex-1 w-full flex flex-col items-center justify-center relative">
            {renderScenario()}
            
            {/* Feedback tức thì */}
            {showReward && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none scale-up-center">
                 <div className="bg-yellow-400 text-white font-black px-8 py-4 rounded-full shadow-2xl text-2xl border-4 border-white flex items-center">
                    TUYỆT VỜI! 🌟
                 </div>
              </div>
            )}
          </div>

          {/* Thanh tiến trình siêu nhân */}
          <div className="w-full max-w-md px-4 mb-10">
            <div className="relative h-6 bg-slate-200/50 rounded-full border-4 border-white shadow-inner overflow-hidden">
               <div 
                 className={`h-full transition-all duration-700 ease-out ${jobInfo?.color}`} 
                 style={{ width: `${taskProgress}%` }} 
               />
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Tiến độ công việc: {Math.floor(taskProgress)}%
               </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="max-w-2xl w-full bg-white rounded-[50px] p-10 md:p-14 shadow-2xl text-center border-b-[12px] border-rose-400 z-10 mx-4 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce border-4 border-rose-100">
             <span className="text-6xl">🏆</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Bé Thật Tuyệt Vời!</h2>
          <div className="bg-rose-50 p-6 rounded-[30px] mb-10 border-2 border-rose-100">
             <p className="text-xl text-slate-700 font-bold leading-relaxed">
               {loading ? "Đang gửi lời khen..." : celebrationMsg}
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {tips.map((tip, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl text-left border-2 border-rose-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-rose-400 rounded-xl flex items-center justify-center text-white font-bold mb-3 shadow-sm">
                   {idx + 1}
                </div>
                <h3 className="font-black text-rose-500 text-sm mb-2 uppercase tracking-tighter leading-tight">{tip.title}</h3>
                <p className="text-[13px] text-slate-500 font-medium leading-snug">{tip.content}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setGameState('START')} 
            className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-black py-5 px-16 rounded-3xl shadow-[0_15px_30px_-5px_rgba(244,63,94,0.4)] transition-all text-2xl hover:scale-105 active:scale-95"
          >
            CHƠI LẠI THÔI
          </button>
        </div>
      )}
    </div>
  );
};

export default RolePlayGame;


import React from 'react';
import { Sticker } from '../types';

interface StickerBookProps {
  stickers: Sticker[];
  onClose: () => void;
}

const StickerBook: React.FC<StickerBookProps> = ({ stickers, onClose }) => {
  const unlockedCount = stickers.filter(s => s.unlocked).length;

  return (
    <div className="absolute inset-0 z-50 bg-sky-50 flex flex-col items-center p-6 overflow-y-auto custom-scrollbar">
      <header className="w-full max-w-4xl flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Sổ Tay Sticker ✨</h2>
          <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">
            Bé đã thu thập được {unlockedCount}/{stickers.length} huy hiệu
          </span>
        </div>
        <button 
          onClick={onClose}
          className="w-14 h-14 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-90 border-b-4 border-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-6">
        {stickers.map((sticker) => (
          <div 
            key={sticker.id}
            className={`relative p-6 rounded-[40px] flex flex-col items-center text-center transition-all duration-500 ${
              sticker.unlocked 
              ? 'bg-white shadow-2xl border-b-8 border-yellow-200 scale-100 rotate-0' 
              : 'bg-slate-200 opacity-60 scale-95'
            }`}
          >
            <div className={`w-24 h-24 mb-4 rounded-3xl flex items-center justify-center transition-transform duration-700 ${sticker.unlocked ? 'animate-float-slow' : ''}`}>
              {sticker.unlocked ? (
                <img src={sticker.icon} className="w-20 h-20 object-contain drop-shadow-xl" alt={sticker.name} />
              ) : (
                <div className="text-5xl grayscale opacity-30">❓</div>
              )}
            </div>
            
            <h3 className={`font-black text-lg leading-tight mb-1 ${sticker.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
              {sticker.unlocked ? sticker.name : 'Đang Khóa'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              {sticker.unlocked ? sticker.description : 'Chơi game để mở khóa nhé!'}
            </p>

            {sticker.unlocked && (
              <div className="absolute top-4 right-4 text-2xl animate-pulse">🌟</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-blue-500 text-white rounded-[40px] shadow-2xl w-full max-w-4xl text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <h4 className="text-2xl font-black mb-2">Thử thách tiếp theo?</h4>
        <p className="font-bold opacity-80 text-sm">Chăm chỉ vui chơi mỗi ngày để làm đầy cuốn sổ tay này bé nhé!</p>
      </div>
    </div>
  );
};

export default StickerBook;

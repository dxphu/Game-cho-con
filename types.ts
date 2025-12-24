
export type GameState = 'START' | 'PLAYING' | 'FINISHED';

export interface Stain {
  id: number;
  x: number;
  y: number;
  size: number;
  isCleaned: boolean;
  type: 'bacteria' | 'stain' | 'food';
}

export interface DentalTip {
  title: string;
  content: string;
}

export interface GameInfo {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

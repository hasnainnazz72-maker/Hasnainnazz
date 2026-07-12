import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, CheckCircle2, Ticket, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicSingle } from '../types';

interface MusicPlayerModalProps {
  song: MusicSingle;
  vipRate: number;
  userBalance: number;
  userInvestmentBalance?: number;
  dailyTasksLimit: number;
  onClose: () => void;
  onComplete: (earnings: number) => void;
}

export default function MusicPlayerModal({ song, vipRate, userBalance, userInvestmentBalance, dailyTasksLimit, onClose, onComplete }: MusicPlayerModalProps) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'verifying' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'playing') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setStatus('verifying');
            return 100;
          }
          return prev + 4; // Takes ~2.5 seconds to fill
        });
      }, 100);
    } else if (status === 'verifying') {
      interval = setTimeout(() => {
        setStatus('success');
      }, 1200); // 1.2s verification delay
    }

    return () => {
      clearInterval(interval);
      clearTimeout(interval);
    };
  }, [status]);

  const currentInvestment = userInvestmentBalance !== undefined ? userInvestmentBalance : userBalance;

  const handleStart = () => {
    setStatus('playing');
    setIsPlaying(true);
  };

  // Daily profit comes according to set VIP profit rate on current Investment Balance (No earnings if investment < 50)
  const calculatedEarnings = currentInvestment >= 50 && vipRate > 0
    ? Number(((currentInvestment * vipRate) / (dailyTasksLimit || 20)).toFixed(4))
    : 0;

  const handleClaim = () => {
    onComplete(calculatedEarnings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-white"
        id="music-player-modal"
      >
        {/* Banner with Album Art */}
        <div className="relative h-48 bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center p-6 border-b border-zinc-800">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${song.imageUrl})` }} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-500/50 relative group">
              <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
              {status === 'playing' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex gap-1 items-end h-8">
                    <span className="w-1 bg-emerald-500 animate-bounce h-4" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 bg-emerald-400 animate-bounce h-7" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 bg-emerald-500 animate-bounce h-5" style={{ animationDelay: '0.5s' }}></span>
                    <span className="w-1 bg-emerald-400 animate-bounce h-8" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Details */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold tracking-tight text-white mb-1">{song.title}</h3>
            <p className="text-zinc-400 text-sm">{song.artist}</p>
          </div>

          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/50 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Ticket Ticket Price:</span>
              <span className="text-white font-medium">${song.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Your Daily ROI:</span>
              <span className="text-emerald-400 font-bold">{(vipRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800">
              <span className="text-zinc-400 font-medium">Estimated Profit:</span>
              <span className="text-emerald-400 font-black text-base">${calculatedEarnings.toFixed(4)}</span>
            </div>
          </div>

          {/* Action Zone */}
          <div className="space-y-4">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                id="btn-buy-ticket"
              >
                <Ticket className="w-5 h-5" />
                Buy Ticket & Start Verification
              </button>
            )}

            {status === 'playing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Streaming Track...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-zinc-500 text-xs mt-2 animate-pulse flex items-center justify-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Playing & Auditing Ticket Contract...
                </p>
              </div>
            )}

            {status === 'verifying' && (
              <div className="py-4 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                <p className="text-sm font-medium text-emerald-400">Verifying on Latigo Smart Ledger...</p>
                <p className="text-xs text-zinc-500">This ensures compliance with decentralized streaming audits</p>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4 py-2"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <div>
                  <h4 className="text-lg font-bold text-white">Compound Commission Verified!</h4>
                  <p className="text-zinc-400 text-xs mt-1">Daily streaming tick contract settled instantly</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl inline-block">
                  <span className="text-zinc-400 text-xs block">Earnings Deposited</span>
                  <span className="text-emerald-400 font-black text-xl">+${calculatedEarnings.toFixed(4)}</span>
                </div>
                <button
                  onClick={handleClaim}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl active:scale-98 transition-all"
                  id="btn-claim-profit"
                >
                  Confirm & Claim Profit
                </button>
              </motion.div>
            )}

            <button
              onClick={onClose}
              disabled={status === 'playing' || status === 'verifying'}
              className="w-full py-3 text-zinc-400 hover:text-white font-semibold rounded-2xl text-sm transition-colors disabled:opacity-30"
              id="btn-cancel-music-player"
            >
              Close Window
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

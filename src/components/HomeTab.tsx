import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, TrendingUp, Sparkles, Trophy, Music, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicSingle } from '../types';

interface HomeTabProps {
  userBalance: number;
  userInvestmentBalance?: number;
  userVipLevel: number;
  onPlaySong: (song: MusicSingle) => void;
  songs: MusicSingle[];
}

export default function HomeTab({ userBalance, userInvestmentBalance, userVipLevel, onPlaySong, songs }: HomeTabProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "LATIGO MUSIC GLOBAL LAUNCH",
      desc: "Invest in music streaming tickets & earn secure compound daily profit!",
      bonus: "RECHARGE $310 GET $60 FREE REWARD INSTANTLY",
      accent: "from-emerald-600 via-teal-900 to-black"
    },
    {
      title: "VIP UPGRADE WELFARE INCENTIVE",
      desc: "Unlock VIP2/VIP3 to compound your daily income up to 3.5% ROI",
      bonus: "INVITE 3 FRIENDS TO UPGRADE VIP & RECEIVE TRC-20 BONUS",
      accent: "from-purple-900 via-indigo-950 to-black"
    }
  ];

  // Auto scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Marquee simulation for announcements
  const mockAlerts = [
    "Congratulations to a8m*** vip1, completed 20 tasks, earnings $10.40",
    "Congratulations to m777*** vip2, completed 30 tasks, earnings $135.00",
    "Congratulations to s9p*** vip3, completed 40 tasks, earnings $640.20",
    "Congratulations to u2k*** vip4, completed 50 tasks, earnings $1,420.50",
    "New user registered from Pakistan! Earned VIP0 welfare bonus of $2.00",
    "Withdrawal of $340.00 successful via USDT-TRC20 for member k2***"
  ];

  const [alertIndex, setAlertIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % mockAlerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const artists = [
    { name: "Ariana Grande", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80" },
    { name: "Billie Eilish", img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&auto=format&fit=crop&q=80" },
    { name: "Bruno Mars", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&auto=format&fit=crop&q=80" },
    { name: "Charlie Puth", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80" },
    { name: "Cardi B", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80" },
    { name: "Bossman", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80" },
    { name: "Central Cee", img: "https://images.unsplash.com/photo-1487180142328-054b783fc471?w=150&auto=format&fit=crop&q=80" }
  ];

  return (
    <div className="space-y-6 pb-24 text-white" id="home-tab-content">
      {/* Dynamic Slide Banner */}
      <div className="relative overflow-hidden rounded-3xl h-52 bg-zinc-950 border border-zinc-800">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-r ${banner.accent} p-6 flex flex-col justify-between transition-all duration-1000 ${
              currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded-full tracking-wider animate-pulse">
                  OFFICIAL
                </span>
                <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">LATIGO SYSTEM</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none mb-2">{banner.title}</h2>
              <p className="text-zinc-300 text-xs font-medium max-w-[85%] leading-relaxed">{banner.desc}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/40">
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider block">SPECIAL OFFER</span>
              <p className="text-white text-xs font-black tracking-tight">{banner.bonus}</p>
            </div>
          </div>
        ))}
        {/* Banner dots */}
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === i ? 'bg-emerald-400 w-4' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Marquee Audio Notification */}
      <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl">
        <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 animate-pulse">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="flex-1 overflow-hidden relative h-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={alertIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs text-zinc-300 font-medium truncate"
            >
              {mockAlerts[alertIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Star Record Man (Artists Horizontal List) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Star record man
          </h3>
          <span className="text-xs font-bold text-zinc-500 flex items-center cursor-pointer hover:text-emerald-400 transition-colors">
            More <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x mask-gradient-x">
          {artists.map((artist, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 snap-start shrink-0 w-20 text-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 hover:border-emerald-500 transition-colors cursor-pointer group">
                <img src={artist.img} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold tracking-tight truncate w-full">
                {artist.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular List Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" /> Popular list
          </h3>
          <span className="text-xs font-bold text-zinc-500 flex items-center cursor-pointer hover:text-emerald-400 transition-colors">
            More <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>

        {/* Dynamic List Grid */}
        <div className="grid grid-cols-2 gap-4" id="popular-songs-grid">
          {songs.map((song) => {
            const isLevelLocked = userVipLevel < song.vipRequired;
            return (
              <div
                key={song.id}
                className="group relative bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700/80 rounded-3xl p-3 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* VIP level badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide shadow-md ${
                    isLevelLocked 
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    VIP {song.vipRequired}
                  </span>
                </div>

                {/* Song Image & Play Button overlay */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-zinc-950">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                  {/* Play circle button - exactly matches design */}
                  <button
                    onClick={() => onPlaySong(song)}
                    className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isLevelLocked
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95'
                    }`}
                    id={`btn-play-song-${song.id}`}
                  >
                    {isLevelLocked ? (
                      <Disc className="w-4 h-4" />
                    ) : (
                      <Music className="w-4 h-4 fill-black" />
                    )}
                  </button>
                </div>

                {/* Info block */}
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white truncate">{song.title}</h4>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Voucher:{song.voucherCost}</span>
                    <span className="text-emerald-400 font-black text-sm">${song.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

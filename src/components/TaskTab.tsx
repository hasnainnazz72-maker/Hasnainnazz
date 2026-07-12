import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Disc, AlertTriangle, Sparkles, Zap, Flame, CalendarDays, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicSingle } from '../types';

interface TaskTabProps {
  userBalance: number;
  userInvestmentBalance?: number;
  userVipLevel: number;
  dailyTasksLimit: number;
  completedTasksCount: number;
  onCompleteTask: (earnings: number, songTitle: string) => void;
  songs: MusicSingle[];
  vipRate: number;
  lastProfitPayoutDate?: string;
}

export default function TaskTab({
  userBalance,
  userInvestmentBalance,
  userVipLevel,
  dailyTasksLimit,
  completedTasksCount,
  onCompleteTask,
  songs,
  vipRate,
  lastProfitPayoutDate,
}: TaskTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [earnedAccumulated, setEarnedAccumulated] = useState(0);
  const [taskLog, setTaskLog] = useState<{ time: string; title: string; payout: number }[]>([]);

  const eligibleSongs = songs.filter((s) => s.vipRequired <= userVipLevel);

  const steps = [
    "Contacting global music stream nodes...",
    "Securing official licensing ticket...",
    "Running decentralized validation algorithm...",
    "Shedding and compounding streaming commission...",
    "Settling smart contract payout instantly!"
  ];

  const currentInvestment = userInvestmentBalance !== undefined ? userInvestmentBalance : userBalance;
  const todayStr = new Date().toISOString().substring(0, 10);
  const isAlreadyPaidToday = completedTasksCount >= dailyTasksLimit;

  const handleAutoRun = () => {
    if (isAlreadyPaidToday) {
      alert("You have already completed all tasks for today. The earning limit resets automatically at 12:00 AM UTC.");
      return;
    }
    if (userVipLevel === 0) {
      alert("Please upgrade to at least VIP 1 to buy tickets and earn commissions!");
      return;
    }
    if (currentInvestment < 50) {
      alert("Your active investment is below $50. Please recharge at least $50 to start earning daily profits.");
      return;
    }
    if (completedTasksCount >= dailyTasksLimit) {
      alert("You have reached your daily ticket limit! Wait for 24-hour reset or upgrade VIP levels.");
      return;
    }
    if (eligibleSongs.length === 0) {
      alert("No songs available for your VIP tier!");
      return;
    }

    setIsRunning(true);
    setEarnedAccumulated(0);
    runSingleTask(completedTasksCount);
  };

  const runSingleTask = (currentCount: number) => {
    if (currentCount >= dailyTasksLimit) {
      setIsRunning(false);
      setCurrentStepText('');
      return;
    }

    // Pick a random song from eligible ones
    const randomSong = eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)] || { title: "Global Stream" };
    // Daily profit comes according to set VIP profit rate on current Investment Balance (No earnings if investment < 50)
    const payout = currentInvestment >= 50 && vipRate > 0
      ? Number(((currentInvestment * vipRate) / (dailyTasksLimit || 20)).toFixed(4))
      : 0;

    let stepIdx = 0;
    setCurrentStepText(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setCurrentStepText(steps[stepIdx]);
      } else {
        clearInterval(interval);
        // Complete the task
        onCompleteTask(payout, randomSong.title);
        setEarnedAccumulated((prev) => prev + payout);
        
        // Add to log
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setTaskLog((prev) => [
          { time: timeStr, title: randomSong.title, payout },
          ...prev,
        ]);

        // Run next task with a brief delay if they want to chain, or finish
        setTimeout(() => {
          // Check if we should continue running (limit not reached)
          if (currentCount + 1 < dailyTasksLimit) {
            runSingleTask(currentCount + 1);
          } else {
            setIsRunning(false);
            setCurrentStepText('');
          }
        }, 1200);
      }
    }, 700);
  };

  const effectiveCompletedTasks = isAlreadyPaidToday ? dailyTasksLimit : completedTasksCount;
  const pct = (effectiveCompletedTasks / dailyTasksLimit) * 100;

  return (
    <div className="space-y-6 pb-24 text-white" id="task-tab-content">
      {/* Overview stats panel */}
      <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Task Center
            </span>
            <h2 className="text-xl font-extrabold text-white">Daily Ticket Auditing</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block font-semibold">TICKET LIMIT</span>
            <span className="text-emerald-400 font-black text-lg">
              {effectiveCompletedTasks} / {dailyTasksLimit}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 space-y-1.5">
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
            <span>Today's Progress</span>
            <span>{Math.round(pct)}% Completed</span>
          </div>
        </div>
      </div>

      {/* Main active action container */}
      <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Animated Background Disk */}
        <div className="relative">
          <div className={`w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 to-zinc-900 p-1 shadow-2xl relative ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center relative">
              <Disc className="w-16 h-16 text-emerald-400" />
              {/* Center hole */}
              <div className="w-4 h-4 bg-zinc-900 rounded-full border border-zinc-800 absolute" />
            </div>
          </div>
          
          {/* Pulsing indicator */}
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-30" />
          )}
        </div>

        <div className="space-y-2 max-w-sm">
          {isRunning ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Flame className="w-4 h-4 animate-bounce" />
                Auto-Auditing in Progress...
              </div>
              <p className="text-white text-xs font-semibold px-4 min-h-8">
                {currentStepText}
              </p>
              {earnedAccumulated > 0 && (
                <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-full inline-block text-emerald-400 font-black">
                  Earned This Run: +${earnedAccumulated.toFixed(4)}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-base font-black">Automated Ticket Settlement</h3>
              <p className="text-zinc-500 text-xs px-2 leading-relaxed">
                Unlock daily yield matching your current VIP tier. Buying and validating music tickets instantly compounds earnings.
              </p>
            </div>
          )}
        </div>

        {userVipLevel < 1 || currentInvestment < 50 ? (
          <div className="space-y-4 w-full max-w-sm flex flex-col items-center">
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl text-left" id="payout-eligibility-warning">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-[11px] text-rose-400 font-extrabold leading-normal">
                {currentInvestment < 50 
                  ? "Your active investment is below $50. Please recharge at least $50 to start earning daily profits."
                  : "Minimum $50 active investment balance and an active VIP 1 membership are required to earn daily profits."}
              </span>
            </div>
            
            <button
              disabled
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-zinc-950 text-zinc-650 border border-zinc-900 cursor-not-allowed opacity-40"
              id="btn-auto-audit-disabled"
            >
              <Play className="w-4 h-4 fill-zinc-700 text-zinc-700" />
              Start Auto ticket audit
            </button>
          </div>
        ) : (
          <button
            onClick={handleAutoRun}
            disabled={isRunning || isAlreadyPaidToday || completedTasksCount >= dailyTasksLimit}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : (isAlreadyPaidToday || completedTasksCount >= dailyTasksLimit)
                ? 'bg-zinc-900 text-emerald-500 border border-emerald-500/10 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-98'
            }`}
            id="btn-auto-audit"
          >
            {isRunning ? (
              <>
                <Zap className="w-4 h-4 animate-bounce text-emerald-400" />
                Validating Contracts...
              </>
            ) : isAlreadyPaidToday ? (
              "Daily Profit Claimed Today!"
            ) : completedTasksCount >= dailyTasksLimit ? (
              "All Tickets Completed Today!"
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                Start Auto ticket audit
              </>
            )}
          </button>
        )}
      </div>

      {/* History log block */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-zinc-400 px-1 uppercase tracking-wider flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5" /> Recent settled ticket receipts
        </h4>

        {taskLog.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-850/60 p-6 rounded-3xl text-center text-zinc-600 text-xs">
            No tickets settled in this session. Start auto-audit to view logs.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {taskLog.map((log, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-2xl flex justify-between items-center text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-extrabold text-white truncate max-w-[200px]">{log.title}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {log.time} • Validated
                  </div>
                </div>
                <div className="text-emerald-400 font-extrabold text-right">
                  +${log.payout.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

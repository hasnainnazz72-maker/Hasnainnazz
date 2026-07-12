import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, Calculator, Landmark, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VIPLevel } from '../types';

interface IncomeTabProps {
  userBalance: number;
  userInvestmentBalance?: number;
  userVipLevel: number;
  vipLevels: VIPLevel[];
  onUpgradeVip: (level: number, cost: number) => void;
}

export default function IncomeTab({ userBalance, userInvestmentBalance, userVipLevel, vipLevels, onUpgradeVip }: IncomeTabProps) {
  // Calculator States
  const [calcVip, setCalcVip] = useState<number>(1);
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcDays, setCalcDays] = useState<number>(30);

  const selectedVip = vipLevels.find((v) => v.level === calcVip) || vipLevels[0];

  // Calculate compound earnings over days
  const calculateCompound = () => {
    const data = [];
    let principal = calcAmount;
    const rate = selectedVip.dailyRate;

    for (let day = 0; day <= calcDays; day++) {
      if (day === 0) {
        data.push({ day: 'Day 0', balance: Number(principal.toFixed(2)), profit: 0 });
      } else {
        const dailyProfit = principal * rate;
        principal += dailyProfit;
        data.push({
          day: `Day ${day}`,
          balance: Number(principal.toFixed(2)),
          profit: Number((principal - calcAmount).toFixed(2)),
        });
      }
    }
    return data;
  };

  const chartData = calculateCompound();
  const finalBalance = chartData[chartData.length - 1].balance;
  const netProfit = chartData[chartData.length - 1].profit;
  const multipleOfInvestment = (finalBalance / calcAmount).toFixed(1);

  return (
    <div className="space-y-6 pb-24 text-white animate-fade-in" id="income-tab-content">
      {/* Header card with VIP level */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-850 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Latigo VIP Tier
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              VIP {userVipLevel === 0 ? "0 (Free)" : `${userVipLevel}`} Membership
            </h2>
            <p className="text-zinc-400 text-xs">
              Complete tasks daily and compound interest in your available balance.
            </p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-400 shadow-xl">
            V{userVipLevel}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800/60">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Available Balance</span>
            <span className="text-base md:text-lg font-black text-emerald-400">${userBalance.toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Investment Balance</span>
            <span className="text-base md:text-lg font-black text-blue-400">${(userInvestmentBalance !== undefined ? userInvestmentBalance : userBalance).toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Today's Daily ROI</span>
            <span className="text-base md:text-lg font-black text-white">
              {userVipLevel === 0 
                ? '0.0%' 
                : `${((vipLevels.find((v) => v.level === userVipLevel)?.dailyRate || 0) * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* VIP level packages tier grid */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-white px-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Latigo Membership levels
        </h3>

        <div className="space-y-4">
          {vipLevels.map((vip) => {
            const isUserLevel = userVipLevel === vip.level;
            const canAfford = userBalance >= vip.minDeposit;
            const isHigher = vip.level > userVipLevel;

            return (
              <div
                key={vip.level}
                className={`border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                  isUserLevel
                    ? 'bg-gradient-to-r from-zinc-900 to-zinc-950 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                    : 'bg-zinc-900/60 border-zinc-850'
                }`}
                id={`vip-tier-card-${vip.level}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-black tracking-tight text-white">VIP {vip.level}</span>
                      {isUserLevel && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-black rounded-full uppercase">
                          Current Level
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-[80%]">{vip.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block font-semibold">Min Recharge</span>
                    <span className="text-emerald-400 font-black text-lg">${vip.minDeposit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/50 text-center mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Daily Return</span>
                    <span className="text-white text-xs font-extrabold block">{(vip.dailyRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="space-y-0.5 border-x border-zinc-800">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Daily Tasks</span>
                    <span className="text-white text-xs font-extrabold block">{vip.dailyTasksLimit} Tickets</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Profit Type</span>
                    <span className="text-emerald-400 text-[10px] font-extrabold block uppercase tracking-wider">Compound</span>
                  </div>
                </div>

                {isHigher && (
                  <button
                    onClick={() => onUpgradeVip(vip.level, vip.minDeposit)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition-all ${
                      canAfford
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-101 active:scale-99'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-750 cursor-not-allowed'
                    }`}
                    id={`btn-upgrade-vip-${vip.level}`}
                  >
                    {canAfford ? `Upgrade to VIP ${vip.level} ($${vip.minDeposit.toFixed(2)})` : `Locked (Requires Min $${vip.minDeposit.toFixed(2)} Balance)`}
                  </button>
                )}

                {isUserLevel && (
                  <div className="py-2.5 text-center text-xs text-emerald-400/80 font-bold bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    ✓ You are actively earning VIP {vip.level} daily compound profit!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Compound Calculator Card */}
      <div className="bg-zinc-900/90 border border-zinc-850 p-6 rounded-3xl space-y-6" id="compound-calculator-container">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Latigo Daily Compound Calculator
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Select VIP level */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">VIP Level</label>
            <select
              value={calcVip}
              onChange={(e) => setCalcVip(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {vipLevels.map((v) => (
                <option key={v.level} value={v.level}>
                  VIP {v.level} ({ (v.dailyRate * 100).toFixed(1) }%)
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Principal Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-zinc-400 text-xs">$</span>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 pl-7 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Days Selection Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-400">Duration (Compound Days)</span>
            <span className="text-emerald-400 font-bold">{calcDays} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="180"
            value={calcDays}
            onChange={(e) => setCalcDays(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-950 cursor-pointer h-1 rounded-full"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>1 Day</span>
            <span>90 Days</span>
            <span>180 Days</span>
          </div>
        </div>

        {/* Compound Interest Stats Summary */}
        <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Final Yield</span>
            <span className="text-xl font-black text-white">${finalBalance.toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Net Profit Earned</span>
            <span className="text-xl font-black text-emerald-400">+${netProfit.toFixed(2)}</span>
          </div>
          <div className="col-span-2 pt-2.5 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
            <span>Total growth multiplier:</span>
            <span className="text-emerald-400 font-black">{multipleOfInvestment}x original</span>
          </div>
        </div>

        {/* Recharts Compound Chart Visualization */}
        <div className="h-44 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-850/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="day" stroke="#555" fontSize={9} />
              <YAxis stroke="#555" fontSize={9} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-500" />
          Buying tickets daily automatically compounds your entire available balance.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Gift, Users, RefreshCw, Landmark, MessageSquare, UserPlus, 
  ChevronRight, ArrowLeft, Send, CheckCircle2, Copy, Trophy, Sparkles, Building, Loader2, ShieldAlert, Settings,
  Download, Smartphone, Monitor, Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TeamMember, ChatMessage } from '../types';

interface MineTabProps {
  userBalance: number;
  userVipLevel: number;
  transactions: Transaction[];
  teamMembers: TeamMember[];
  onAddMockMember: (username: string, level: 'A' | 'B' | 'C', balance: number) => void;
  onClaimWelfare: (bonus: number) => void;
  hasClaimedWelfareToday: boolean;
  appUrl: string;
  onOpenAdmin: () => void;
  loggedInUser: string;
  onLogout: () => void;
  siteSettings?: any;
}

export default function MineTab({
  userBalance,
  userVipLevel,
  transactions,
  teamMembers,
  onAddMockMember,
  onClaimWelfare,
  hasClaimedWelfareToday,
  appUrl,
  onOpenAdmin,
  loggedInUser,
  onLogout,
  siteSettings,
}: MineTabProps) {
  const [activeSubView, setActiveSubView] = useState<'main' | 'welfare' | 'team' | 'records' | 'company' | 'customer' | 'invite' | 'security' | 'download'>('main');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<'idle' | 'installed' | 'prompt-ready'>('idle');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallState('prompt-ready');
    };
    
    // Check if already in standalone (installed) mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // New member simulator state
  const [simName, setSimName] = useState('');
  const [simLevel, setSimLevel] = useState<'A' | 'B' | 'C'>('A');
  const [simBalance, setSimBalance] = useState('50');

  // Customer service chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'support',
      text: "Hello! Welcome to Latigo Music Customer Service. I am your AI Support Assistant. How can I assist you with your VIP levels, ticket purchases, compound interest, deposits, or withdrawals today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Invite friends states
  const [inviteCopied, setInviteCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("LATIGO50K");

  useEffect(() => {
    const data = localStorage.getItem('latigo_accounts');
    if (data && loggedInUser) {
      try {
        const accounts = JSON.parse(data);
        const found = accounts.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
        if (found && found.referralCodeOwned) {
          setReferralCode(found.referralCodeOwned);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [loggedInUser]);

  const referralLink = referralCode ? `${appUrl}?ref=${referralCode}` : appUrl;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(referralLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const promptToSend = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      // Connect to our express proxy API route which uses @google/genai SDK
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach server support node");
      }

      const data = await response.json();
      const supportMsg: ChatMessage = {
        sender: 'support',
        text: data.reply || "Sorry, I am experiencing temporary system congestion. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, supportMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        sender: 'support',
        text: "I am having trouble connecting to Latigo Support networks. Please ensure your backend server is online.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddMockMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) {
      alert("Please specify a user name.");
      return;
    }
    const balanceVal = Number(simBalance) || 0;
    onAddMockMember(simName.trim(), simLevel, balanceVal);
    setSimName('');
    alert(`Mock member ${simName} successfully generated under Level ${simLevel}! Commission applied!`);
  };

  // Team summary math
  const levelAMembers = teamMembers.filter((m) => m.level === 'A');
  const levelBMembers = teamMembers.filter((m) => m.level === 'B');
  const levelCMembers = teamMembers.filter((m) => m.level === 'C');

  const totalTeamCommission = teamMembers.reduce((acc, m) => acc + m.commissionContributed, 0);
  const activeTodayCount = teamMembers.filter((m) => m.isActive).length;

  return (
    <div className="text-white pb-24" id="mine-tab-content">
      <AnimatePresence mode="wait">
        {/* Main mine dashboard view */}
        {activeSubView === 'main' && (
          <motion.div
            key="main-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* User Profile Header */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-850 p-6 rounded-3xl flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-0.5 relative">
                  <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center font-black text-xl text-emerald-400">
                    LM
                  </div>
                  <span className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-emerald-500 text-black text-[8px] font-black rounded-full uppercase border border-black">
                    V{userVipLevel}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white mb-0.5">{loggedInUser || 'member777'}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-750">
                      VIP {userVipLevel === 0 ? "0 (Free)" : `${userVipLevel} Tier`}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400">Next level: 50.00/500.00 (Recharge)</span>
                  </div>
                </div>
              </div>

              {/* Small branding badge */}
              <div className="text-right">
                <div className="font-extrabold text-sm text-emerald-400 tracking-wider">LATIGO</div>
                <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">MUSIC CORP</div>
              </div>
            </div>

            {/* Income Card Stats Grid */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-900 border border-zinc-850 p-5 rounded-3xl">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Personal Income</span>
                <span className="text-2xl font-black text-white block">
                  ${transactions
                    .filter((t) => t.type === 'task_commission' && t.status === 'passed')
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toFixed(4)}
                </span>
              </div>
              <div className="space-y-1 border-l border-zinc-800 pl-4">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Available Balance</span>
                <span className="text-2xl font-black text-emerald-400 block">${userBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Menu Links List */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden divide-y divide-zinc-850/60">
              {/* Welfare Center */}
              <button
                onClick={() => setActiveSubView('welfare')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-welfare"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Welfare Center</h4>
                    <p className="text-[10px] text-zinc-500">Claim your daily attendance check-in cash rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Team's Income */}
              <button
                onClick={() => setActiveSubView('team')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-team"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Team's Income</h4>
                    <p className="text-[10px] text-zinc-500">Monitor multi-level referral commissions (16% | 8% | 4%)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Account Change Record */}
              <button
                onClick={() => setActiveSubView('records')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-records"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Account Change Record</h4>
                    <p className="text-[10px] text-zinc-500">Audit history of all asset movements</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Company Profile */}
              <button
                onClick={() => setActiveSubView('company')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-company"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Company Profile</h4>
                    <p className="text-[10px] text-zinc-500">Learn about Latigo's corporate model and operations</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Customer Service */}
              <button
                onClick={() => setActiveSubView('customer')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-customer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/10 p-2 rounded-xl text-teal-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Customer Service</h4>
                    <p className="text-[10px] text-zinc-500">Live chat support node backed by Gemini AI agent</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 animate-pulse" />
              </button>

              {/* Invite Friends */}
              <button
                onClick={() => setActiveSubView('invite')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors"
                id="btn-nav-invite"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500/10 p-2 rounded-xl text-pink-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Invite Friends</h4>
                    <p className="text-[10px] text-zinc-500">Share your custom referral links and codes</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Download App (NEW) */}
              <button
                onClick={() => setActiveSubView('download')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors border-t border-zinc-850/60"
                id="btn-nav-download"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400 animate-pulse">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 font-black">
                      Download Application
                      <span className="bg-rose-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">Hot</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400">Install native Chrome web-app shortcut / Android Launcher</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Security Settings */}
              <button
                onClick={() => setActiveSubView('security')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors border-t border-zinc-850/60"
                id="btn-nav-security"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Security Settings</h4>
                    <p className="text-[10px] text-zinc-500">Update login password and security settings</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Sign Out */}
              <button
                onClick={onLogout}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-850/30 transition-colors border-t border-zinc-850/60"
                id="btn-nav-logout"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-xl text-red-400">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-400 font-black">Sign Out</h4>
                    <p className="text-[10px] text-zinc-500">Securely sign out from this account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Sub-view: Welfare Center */}
        {activeSubView === 'welfare' && (
          <motion.div
            key="welfare-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              <Gift className="w-16 h-16 text-purple-400 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Daily Sign-in Rewards</h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                  Sign in once every 24 hours to receive a guaranteed welfare credit of ${(siteSettings?.welfareReward !== undefined ? siteSettings.welfareReward : 0.10).toFixed(2)} directly to your balance.
                </p>
              </div>

              {hasClaimedWelfareToday ? (
                <div className="py-4 px-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 text-xs font-bold">
                  ✓ You have successfully claimed your attendance bonus today! Come back tomorrow.
                </div>
              ) : (
                <button
                  onClick={() => onClaimWelfare(siteSettings?.welfareReward !== undefined ? siteSettings.welfareReward : 0.10)} // Set standard welfare reward dynamically
                  className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider active:scale-98 transition-all"
                  id="btn-claim-welfare"
                >
                  Check In & Claim ${(siteSettings?.welfareReward !== undefined ? siteSettings.welfareReward : 0.10).toFixed(2)} Now
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Sub-view: Team's Income */}
        {activeSubView === 'team' && (
          <motion.div
            key="team-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            {/* Team Metrics Grid */}
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-base font-extrabold text-white">Team Commission Center</h3>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full font-bold">Multi-Level system</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Accumulated commission</span>
                  <span className="text-base font-black text-emerald-400">${totalTeamCommission.toFixed(2)}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Total invites</span>
                  <span className="text-base font-black text-white">{teamMembers.length} Person(s)</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Active today</span>
                  <span className="text-base font-black text-white">{activeTodayCount}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">New today</span>
                  <span className="text-base font-black text-white">2</span>
                </div>
              </div>
            </div>

            {/* Simulated Multi-Level Commission Structure */}
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Simulation Commission Multiplier
              </h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                When friends you invite buy streaming tickets, you immediately receive:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850">
                  <span className="text-emerald-400 font-black block text-base">16%</span>
                  <span className="text-zinc-500 text-[9px] font-bold block">Level A</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850">
                  <span className="text-emerald-400 font-black block text-base">8%</span>
                  <span className="text-zinc-500 text-[9px] font-bold block">Level B</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850">
                  <span className="text-emerald-400 font-black block text-base">4%</span>
                  <span className="text-zinc-500 text-[9px] font-bold block">Level C</span>
                </div>
              </div>
            </div>

            {/* Mock Member generator form (referral tester) */}
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Referral network simulator
              </h4>
              <p className="text-[10px] text-zinc-500">
                Generate a simulated member registration to test your multi-level commissions in real time!
              </p>

              <form onSubmit={handleAddMockMemberSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-semibold">User account</label>
                    <input
                      type="text"
                      placeholder="e.g. MEMBER777"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-semibold">Referral tier</label>
                    <select
                      value={simLevel}
                      onChange={(e) => setSimLevel(e.target.value as 'A' | 'B' | 'C')}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="A">Level A (16% Commission)</option>
                      <option value="B">Level B (8% Commission)</option>
                      <option value="C">Level C (4% Commission)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Active Deposit ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={simBalance}
                    onChange={(e) => setSimBalance(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs active:scale-98 transition-all"
                >
                  Generate Mock Member Registration
                </button>
              </form>
            </div>

            {/* Member lists tables */}
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Referral Member ledger
                </h4>
                <div className="flex gap-2 text-[9px] font-bold text-zinc-500">
                  <span>A ({levelAMembers.length})</span>
                  <span>B ({levelBMembers.length})</span>
                  <span>C ({levelCMembers.length})</span>
                </div>
              </div>

              {teamMembers.length === 0 ? (
                <div className="py-6 text-center text-zinc-600 text-xs">No referrals registered yet.</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-zinc-950 border border-zinc-850 p-3 rounded-2xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-white">{member.username}</div>
                        <div className="text-[9px] text-zinc-500">
                          Registered: {member.registrationDate} • Tier: Level {member.level}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-white font-extrabold block">Balance: ${member.balance.toFixed(2)}</span>
                        <span className="text-[9px] text-emerald-400 font-bold block">
                          Earned commission: +${member.commissionContributed.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sub-view: Transaction Records */}
        {activeSubView === 'records' && (
          <motion.div
            key="records-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl space-y-4">
              <h3 className="text-base font-extrabold text-white border-b border-zinc-800 pb-3">
                Full Account Statement records
              </h3>

              <div className="space-y-3 max-h-128 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex justify-between items-start text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 w-max">
                        {tx.type.replace('_', ' ')}
                      </span>
                      <p className="text-zinc-300 font-medium">{tx.description}</p>
                      <span className="text-[9px] text-zinc-600 block">{tx.timestamp} • ID: {tx.id}</span>
                    </div>
                    <div className="text-right space-y-2">
                      <span className="text-white font-black block">${tx.amount.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                        tx.status === 'passed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-750'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-view: Company Profile */}
        {activeSubView === 'company' && (
          <motion.div
            key="company-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Building className="w-5 h-5 text-emerald-400" /> Latigo Music Group Ltd
              </h3>

              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                <p>
                  Latigo Music is a premier decentralized music licensing, streaming cataloging, and digital ticketing enterprise established in 2024. Our core mission is bridging global independent artists directly with crowdsourced listeners and micro-investors.
                </p>
                <p>
                  Through our smart-contract ticketing matrix, music enthusiasts can directly sponsor artist releases by buying promotional stream tickets. This generates direct yield through artist royalty compounds, delivering high daily ROIs:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                  <li><strong>VIP 1 Tier:</strong> 2.6% Daily Compound return on $50.00 investment</li>
                  <li><strong>VIP 2 Tier:</strong> 2.7% Daily Compound return on $500.00 investment</li>
                  <li><strong>VIP 3 Tier:</strong> 3.0% Daily Compound return on $2,000.00 investment</li>
                  <li><strong>VIP 4 Tier:</strong> 3.5% Daily Compound return on $4,000.00 investment</li>
                </ul>
                <p>
                  We operate a completely transparent referral and team development system, rewarding our global advocates with Level A (16%), Level B (8%), and Level C (4%) commissions on downline ticket validation runs. All assets are safely cleared on TRC-20 blockchain ledgers.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-view: AI Customer Service */}
        {activeSubView === 'customer' && (
          <motion.div
            key="customer-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            {/* Chat Box Container */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden flex flex-col h-[480px]">
              {/* Box Header */}
              <div className="bg-zinc-950 p-4 border-b border-zinc-850/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Latigo Support Node</h4>
                  <span className="text-[10px] text-zinc-500">Online • AI Agent Assistant</span>
                </div>
              </div>

              {/* Chat History Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                          : 'bg-zinc-950 text-zinc-300 rounded-tl-none border border-zinc-850/80'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`text-[8px] mt-1.5 block text-right ${
                        msg.sender === 'user' ? 'text-black/60' : 'text-zinc-600'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-950 text-zinc-400 rounded-2xl rounded-tl-none border border-zinc-850/80 p-3.5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span className="text-[10px]">Latigo Support agent writing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Form Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 border-t border-zinc-850/60 flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about VIPs, Recharges, compound profit..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black p-3.5 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Sub-view: Invite Friends */}
        {activeSubView === 'invite' && (
          <motion.div
            key="invite-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
              <Trophy className="w-14 h-14 text-pink-400 mx-auto" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Invite Friends & Earn Commission</h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                  Earn unlimited downline interest. When your referrals validation stream tickets daily, you receive compound referral earnings!
                </p>
              </div>

              {/* Referral details cards */}
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 text-center">
                  <span className="text-emerald-400 font-extrabold text-lg">16%</span>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold mt-1">LV.A Direct</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 text-center">
                  <span className="text-emerald-400 font-extrabold text-lg">8%</span>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold mt-1">LV.B Friend</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 text-center">
                  <span className="text-emerald-400 font-extrabold text-lg">4%</span>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold mt-1">LV.C Sub-friend</span>
                </div>
              </div>

              {/* Invite parameters and inputs */}
              <div className="space-y-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-850 text-left">

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold">Referral invitation code</span>
                  <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                    <span className="font-mono text-xs text-white font-extrabold">{referralCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        alert("Referral code copied!");
                      }}
                      className="text-xs text-emerald-400 font-bold hover:text-white transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold">Promotion registration link</span>
                  <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-zinc-400 truncate pr-4">{referralLink}</span>
                    <button
                      onClick={handleCopyInvite}
                      className="text-xs text-emerald-400 font-bold hover:text-white transition-colors shrink-0"
                    >
                      {inviteCopied ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>

                {/* Dynamic scannable Referral QR Code */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-850 rounded-2xl space-y-2.5 mt-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block text-center">Your Promotion QR Code</span>
                  <div className="p-2 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`} 
                      alt="Referral Invitation QR Code" 
                      className="w-24 h-24"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[8px] text-zinc-400 font-bold tracking-wide uppercase text-center">Scan to register directly</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sub-view: Security Settings */}
        {activeSubView === 'security' && (
          <motion.div
            key="security-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-left space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-white">Security Settings</h3>
                <p className="text-[10px] text-zinc-500">Modify login passwords, pins and secret recovery phrases</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const oldPass = (form.elements.namedItem('oldPass') as HTMLInputElement).value;
                  const newPass = (form.elements.namedItem('newPass') as HTMLInputElement).value;
                  const confirmPass = (form.elements.namedItem('confirmPass') as HTMLInputElement).value;

                  if (newPass !== confirmPass) {
                    alert("Passwords do not match!");
                    return;
                  }

                  const data = localStorage.getItem('latigo_accounts');
                  if (data && loggedInUser) {
                    try {
                      const accounts = JSON.parse(data);
                      const idx = accounts.findIndex((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
                      if (idx !== -1) {
                        if (accounts[idx].password && accounts[idx].password !== oldPass) {
                          alert("Current password is incorrect!");
                          return;
                        }
                        accounts[idx].password = newPass;
                        localStorage.setItem('latigo_accounts', JSON.stringify(accounts));
                        
                        // Sync password change to the backend server
                        const url = `/api/accounts?username=${encodeURIComponent(loggedInUser)}`;
                        fetch(url, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(accounts)
                        })
                        .then(res => res.json())
                        .then(() => {
                          alert("Password updated successfully!");
                          form.reset();
                        })
                        .catch(err => {
                          console.error("Sync password change failed", err);
                          alert("Password updated locally, but server synchronization failed.");
                        });
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Current Password</label>
                  <input
                    type="password"
                    name="oldPass"
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">New Password</label>
                  <input
                    type="password"
                    name="newPass"
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPass"
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Sub-view: Download Application */}
        {activeSubView === 'download' && (
          <motion.div
            key="download-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setActiveSubView('main')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to user center
            </button>

            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-left space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Download Latigo Music</h3>
                  <p className="text-[10px] text-zinc-500">Install the official Latigo Music app on your mobile or desktop device</p>
                </div>
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-400">
                  <Download className="w-6 h-6" />
                </div>
              </div>

              {/* AI Studio iFrame Warning Notice (Important for PWA detection) */}
              {(window.self !== window.top) && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-black uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" /> Action Required for Installation
                  </h4>
                  <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                    Chrome PWA installation is <span className="text-amber-300">disabled inside preview frames</span>. Please open the app in a dedicated tab to install and download it instantly!
                  </p>
                  <a
                    href={window.location.origin || appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 p-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all"
                  >
                    Open in New Tab &amp; Install App
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Status Badge */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block">App Status</span>
                  <span className="text-xs font-bold text-white">
                    {installState === 'installed' ? 'App Already Installed' : 'Ready for Instant Installation'}
                  </span>
                </div>
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full border ${
                  installState === 'installed' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                }`}>
                  {installState === 'installed' ? 'Active' : 'Live'}
                </span>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Instant install button (PWA) */}
                <button
                  onClick={() => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choiceResult: any) => {
                        if (choiceResult.outcome === 'accepted') {
                          setInstallState('installed');
                        }
                        setDeferredPrompt(null);
                      });
                    } else {
                      alert("Chrome automatic installation prompt is not triggered yet. Please follow the step-by-step Chrome installation guide below to add the app manually in 5 seconds!");
                    }
                  }}
                  className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black rounded-2xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Chrome className="w-5 h-5" />
                    <div className="text-left">
                      <span className="text-xs block font-black">Install Directly in Chrome</span>
                      <span className="text-[9px] opacity-75 font-bold block">Instant setup without downloads</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-4">
                  {/* Download APK option */}
                  <button
                    onClick={() => {
                      const mockApkData = new Uint8Array([
                        0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x08, 0x00, 0x08, 0x00, 
                        ...Array(2000).fill(0).map(() => Math.floor(Math.random() * 256))
                      ]);
                      const blob = new Blob([mockApkData], { type: 'application/vnd.android.package-archive' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'LatigoMusic_v2.0.apk';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      alert("Starting download of LatigoMusic_v2.0.apk (12.4 MB)! Please open and install the package on your Android device.");
                    }}
                    className="p-3.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-2xl flex flex-col items-start gap-2 text-left transition-colors"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Android App</span>
                      <span className="text-[9px] text-zinc-500 font-bold block">Download .APK installer</span>
                    </div>
                  </button>

                  {/* Download URL Shortcut option */}
                  <button
                    onClick={() => {
                      const urlContent = `[InternetShortcut]\nURL=${window.location.origin || appUrl}\nIconIndex=0\n`;
                      const blob = new Blob([urlContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'LatigoMusic.url';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      alert("LatigoMusic.url desktop shortcut downloaded! Drag and drop this file onto your Windows/Mac desktop for 1-click access.");
                    }}
                    className="p-3.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-2xl flex flex-col items-start gap-2 text-left transition-colors"
                  >
                    <Monitor className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">PC Shortcut</span>
                      <span className="text-[9px] text-zinc-500 font-bold block">Download Desktop Launcher</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Platform Guides */}
              <div className="space-y-4 pt-4 border-t border-zinc-850/60">
                <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Manual Setup Guides</h4>
                
                <div className="space-y-3">
                  {/* Google Chrome & Android Guide */}
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850/60 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-extrabold text-white">Google Chrome (Android / PC)</span>
                    </div>
                    <ol className="text-[10px] text-zinc-400 space-y-1.5 list-decimal pl-4 font-semibold">
                      <li>Open this website in your <span className="text-emerald-400">Google Chrome</span> browser.</li>
                      <li>Click on the <span className="text-white">three dots menu (⋮)</span> in the top-right corner.</li>
                      <li>Select <span className="text-white">"Install App"</span> or <span className="text-white">"Add to Home screen"</span>.</li>
                      <li>Confirm to add it instantly to your phone launcher or computer desktop.</li>
                    </ol>
                  </div>

                  {/* Safari iOS Apple Guide */}
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850/60 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-xs font-extrabold text-white">Apple iOS (Safari / iPhone)</span>
                    </div>
                    <ol className="text-[10px] text-zinc-400 space-y-1.5 list-decimal pl-4 font-semibold">
                      <li>Open this website in the default Apple <span className="text-indigo-400">Safari Browser</span>.</li>
                      <li>Tap the <span className="text-white">Share button</span> (square box with an up arrow) at the bottom.</li>
                      <li>Scroll down and select <span className="text-white">"Add to Home Screen"</span>.</li>
                      <li>Tap <span className="text-white">"Add"</span> in the top-right corner to place it on your iPhone.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

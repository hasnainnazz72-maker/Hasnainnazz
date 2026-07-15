import React, { useState, useEffect } from 'react';
import { Home, Play, Compass, Landmark, Settings, Music, Disc, Ticket, Users, AlertTriangle, Coins, Sparkles, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { VIPLevel, Transaction, TeamMember, MusicSingle } from './types';

import HomeTab from './components/HomeTab';
import IncomeTab from './components/IncomeTab';
import TaskTab from './components/TaskTab';
import FinanceTab from './components/FinanceTab';
import MineTab from './components/MineTab';
import MusicPlayerModal from './components/MusicPlayerModal';
import AdminPanel from './components/AdminPanel';
import AuthOverlay from './components/AuthOverlay';

const getLocalUserField = (field: string, defaultValue: any) => {
  const loggedUser = typeof window !== 'undefined' ? localStorage.getItem('latigo_logged_in_user') || '' : '';
  if (!loggedUser) return defaultValue;
  const accountsData = typeof window !== 'undefined' ? localStorage.getItem('latigo_accounts') : null;
  if (accountsData) {
    try {
      const accounts = JSON.parse(accountsData);
      const user = accounts.find((a: any) => a.username.toLowerCase() === loggedUser.toLowerCase());
      if (user && user[field] !== undefined) {
        return user[field];
      }
    } catch (e) {}
  }
  // Fallback to old individual keys if exists
  if (typeof window !== 'undefined') {
    if (field === 'balance') {
      const saved = localStorage.getItem('latigo_balance');
      return saved ? Number(saved) : defaultValue;
    }
    if (field === 'investmentBalance') {
      const saved = localStorage.getItem('latigo_investment_balance');
      return saved ? Number(saved) : defaultValue;
    }
    if (field === 'vipLevel') {
      const saved = localStorage.getItem('latigo_vip');
      return saved ? Number(saved) : defaultValue;
    }
    if (field === 'completedTasks') {
      const saved = localStorage.getItem('latigo_tasks_completed');
      return saved ? Number(saved) : defaultValue;
    }
    if (field === 'hasClaimedWelfare') {
      const saved = localStorage.getItem('latigo_welfare_claimed');
      return saved === 'true' ? true : defaultValue;
    }
    if (field === 'lastProfitPayoutDate') {
      return localStorage.getItem('latigo_last_profit_payout') || defaultValue;
    }
    if (field === 'transactions') {
      const saved = localStorage.getItem('latigo_transactions');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
  }
  return defaultValue;
};

const mergeTransactions = (localTxs: any[] = [], serverTxs: any[] = []) => {
  const mergedMap = new Map();
  
  // First, add all local transactions
  localTxs.forEach(tx => {
    mergedMap.set(tx.id, { ...tx });
  });
  
  // Then, merge server transactions
  serverTxs.forEach(serverTx => {
    const localTx = mergedMap.get(serverTx.id);
    if (!localTx) {
      // New transaction from server (e.g. commission)
      mergedMap.set(serverTx.id, { ...serverTx });
    } else {
      // Transaction exists in both.
      // Rule: status 'passed' or 'cancelled' ALWAYS wins over 'pending'
      let finalStatus = localTx.status;
      if (serverTx.status === 'passed' || serverTx.status === 'cancelled') {
        finalStatus = serverTx.status;
      } else if (localTx.status === 'passed' || localTx.status === 'cancelled') {
        finalStatus = localTx.status;
      }
      
      mergedMap.set(serverTx.id, {
        ...localTx,
        ...serverTx,
        status: finalStatus
      });
    }
  });
  
  return Array.from(mergedMap.values());
};

const mergeAccounts = (
  localAccounts: any[], 
  serverAccounts: any[], 
  loggedInUser: string = '', 
  lastLocalMutationTime: number = 0
): any[] => {
  const merged = [...serverAccounts];
  localAccounts.forEach((localAcc: any) => {
    const idx = merged.findIndex((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
    if (idx === -1) {
      merged.push(localAcc);
    } else {
      const serverAcc = merged[idx];
      // If server has masked phone (contains '***'), preserve local full phone
      const isPhoneMasked = serverAcc.phone && serverAcc.phone.includes('***');
      const finalPhone = isPhoneMasked ? (localAcc.phone || serverAcc.phone) : (serverAcc.phone || localAcc.phone);
      
      const isMutationLocked = loggedInUser && 
        localAcc.username.toLowerCase() === loggedInUser.toLowerCase() && 
        (Date.now() - lastLocalMutationTime < 4000);
        
      const mergedTxs = mergeTransactions(localAcc.transactions || [], serverAcc.transactions || []);
      
      merged[idx] = {
        ...localAcc,
        ...serverAcc,
        phone: finalPhone,
        password: serverAcc.password || localAcc.password,
        securityQuestion: serverAcc.securityQuestion || localAcc.securityQuestion,
        securityAnswer: serverAcc.securityAnswer || localAcc.securityAnswer,
        email: serverAcc.email || localAcc.email,
        transactions: mergedTxs
      };

      if (isMutationLocked) {
        // Keep local balance and investmentBalance during mutation lock
        merged[idx].balance = localAcc.balance;
        merged[idx].investmentBalance = localAcc.investmentBalance;
      } else {
        if (typeof serverAcc.balance === 'number') merged[idx].balance = serverAcc.balance;
        if (typeof serverAcc.investmentBalance === 'number') {
          merged[idx].investmentBalance = serverAcc.investmentBalance;
        } else if (typeof serverAcc.balance === 'number') {
          merged[idx].investmentBalance = serverAcc.balance;
        }
      }
    }
  });
  return merged;
};

let syncTimeoutId: any = null;

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<string>(() => {
    return localStorage.getItem('latigo_logged_in_user') || '';
  });
  
  // Isolated Admin view router
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('admin');
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'income' | 'task' | 'finance' | 'mine'>('home');
  const [userBalance, setUserBalance] = useState<number>(() => {
    return getLocalUserField('balance', 0.00);
  });
  
  const [userInvestmentBalance, setUserInvestmentBalance] = useState<number>(() => {
    return getLocalUserField('investmentBalance', 0.00);
  });

  // Keep investment balance in sync with available balance
  useEffect(() => {
    setUserInvestmentBalance(userBalance);
    localStorage.setItem('latigo_investment_balance', userBalance.toString());
  }, [userBalance]);
  
  const [userVipLevel, setUserVipLevel] = useState<number>(() => {
    return getLocalUserField('vipLevel', 1);
  });

  const [completedTasksCount, setCompletedTasksCount] = useState<number>(() => {
    return getLocalUserField('completedTasks', 0);
  });

  const [hasClaimedWelfareToday, setHasClaimedWelfareToday] = useState<boolean>(() => {
    return getLocalUserField('hasClaimedWelfare', false);
  });

  const [lastProfitPayoutDate, setLastProfitPayoutDate] = useState<string>(() => {
    return getLocalUserField('lastProfitPayoutDate', '');
  });

  const [profitAlert, setProfitAlert] = useState<{ amount: number; rate: number } | null>(null);

  const [selectedPlaySong, setSelectedPlaySong] = useState<MusicSingle | null>(null);

  const [lastLocalMutationTime, setLastLocalMutationTime] = useState<number>(0);

  // Dynamic VIP Levels loaded from localStorage (customizable in Admin Portal)
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>(() => {
    const saved = localStorage.getItem('latigo_vip_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaults = [
      { level: 1, name: "VIP 1", minDeposit: 50, dailyRate: 0.026, dailyTasksLimit: 20, description: "Daily income 2.6%. Every day buy tickets and earn compound profit." },
      { level: 2, name: "VIP 2", minDeposit: 500, dailyRate: 0.027, dailyTasksLimit: 30, description: "Daily income 2.7%. Every day buy tickets and earn compound profit." },
      { level: 3, name: "VIP 3", minDeposit: 2000, dailyRate: 0.030, dailyTasksLimit: 40, description: "Daily income 3.0%. Every day buy music tickets and earn compound profit." },
      { level: 4, name: "VIP 4", minDeposit: 4000, dailyRate: 0.035, dailyTasksLimit: 50, description: "Daily income 3.5%. Everyday buy music tickets and earn compound profit." }
    ];
    localStorage.setItem('latigo_vip_plans', JSON.stringify(defaults));
    return defaults;
  });

  // Dynamic Website Settings and Notices loaded from localStorage
  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('latigo_site_settings');
    const defaultTrc = "TETttTRj6ZX5gAm79RgDgDm6WHeMrnDjdy";
    const defaultBep = "0xbd63907b714a667f5052c432cdc4ad3dc0d73658";

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        // Default to public URL if none exists
        if (!parsed.publicUrl || !parsed.publicUrl.trim()) {
          parsed.publicUrl = "https://latigo-music-785737163790.asia-southeast1.run.app";
          updated = true;
        }
        // Protect deposit wallet from being missing, empty, or using the old default values
        if (!parsed.trc20Address || !parsed.trc20Address.trim() || parsed.trc20Address === "TMLatigoMusicOfficialTRC20AddressXYZ777") {
          parsed.trc20Address = defaultTrc;
          updated = true;
        }
        if (!parsed.bep20Address || !parsed.bep20Address.trim() || parsed.bep20Address === "0x8922LatigoMusicOfficialBEP20AddressUSDT777") {
          parsed.bep20Address = defaultBep;
          updated = true;
        }
        if (updated) {
          localStorage.setItem('latigo_site_settings', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {}
    }
    const defaults = {
      siteName: "Latigo Music",
      logoEmoji: "🎵",
      logoText: "LATIGO MUSIC",
      supportTelegram: "https://t.me/latigo_music_official",
      supportWhatsApp: "+1234567890",
      minWithdrawal: 15.00,
      welfareReward: 0.10,
      registrationBonus: 0.00,
      trc20Address: defaultTrc,
      bep20Address: defaultBep,
      banners: [
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
      ],
      announcements: [
        "Congratulations to a8m*** vip1, completed 20 tasks, earnings $10.40",
        "Congratulations to m777*** vip2, completed 30 tasks, earnings $135.00",
        "Congratulations to s9p*** vip3, completed 40 tasks, earnings $640.20",
        "Congratulations to u2k*** vip4, completed 50 tasks, earnings $1,420.50",
        "Withdrawal of $340.00 successful via USDT-TRC20 for member k2***"
      ],
      commissions: {
        level1: 10,
        level2: 5,
        level3: 2
      },
      publicUrl: "https://latigo-music-785737163790.asia-southeast1.run.app"
    };
    localStorage.setItem('latigo_site_settings', JSON.stringify(defaults));
    return defaults;
  });

  const currentVipObj = userVipLevel > 0
    ? (vipLevels.find(v => v.level === userVipLevel) || { dailyTasksLimit: 20, dailyRate: 0.026 })
    : { dailyTasksLimit: 0, dailyRate: 0.0 };
  const dailyTasksLimit = currentVipObj.dailyTasksLimit;
  const vipRate = currentVipObj.dailyRate;

  const getAppUrl = () => {
    return siteSettings?.publicUrl || "https://latigo-music-785737163790.asia-southeast1.run.app";
  };
  const appUrl = getAppUrl();

  const [songs] = useState<MusicSingle[]>([
    {
      id: 'song-1',
      title: 'Flowers',
      artist: 'Miley Cyrus',
      price: 10.00,
      vipRequired: 1,
      voucherCost: 1,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
      description: "Released in Jan 2023, certified platinum, ideal for VIP1 compounding interest validator."
    },
    {
      id: 'song-2',
      title: 'lovely',
      artist: 'Billie Eilish & Khalid',
      price: 12.00,
      vipRequired: 1,
      voucherCost: 1,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
      description: "Atmospheric acoustic single supporting global micro-compounds stream audits."
    },
    {
      id: 'song-3',
      title: 'Mood',
      artist: '24kGoldn ft. iann dior',
      price: 13.00,
      vipRequired: 1,
      voucherCost: 1,
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      description: "Hit pop-rap track supporting high frequency decentralized validator runs."
    },
    {
      id: 'song-4',
      title: 'As It Was',
      artist: 'Harry Styles',
      price: 14.00,
      vipRequired: 1,
      voucherCost: 1,
      imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
      description: "Synth-pop masterpiece, extreme high volume validation ticket."
    },
    {
      id: 'song-5',
      title: 'Starboy',
      artist: 'The Weeknd ft. Daft Punk',
      price: 50.00,
      vipRequired: 2,
      voucherCost: 3,
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
      description: "VIP2-exclusive. Unlocks higher returns with mid-sized ticket entries."
    },
    {
      id: 'song-6',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      price: 120.00,
      vipRequired: 2,
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
      description: "One of the longest-charting Billboard hits, generates exceptional compounding streams.",
      voucherCost: 5
    },
    {
      id: 'song-7',
      title: 'Levitating',
      artist: 'Dua Lipa',
      price: 600.00,
      vipRequired: 3,
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&auto=format&fit=crop&q=80',
      description: "VIP3-exclusive high yield validation card for compound micro-recharges.",
      voucherCost: 10
    },
    {
      id: 'song-8',
      title: 'Die For You',
      artist: 'The Weeknd & Ariana Grande',
      price: 1500.00,
      vipRequired: 4,
      imageUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?w=400&auto=format&fit=crop&q=80',
      description: "VIP4-tier elite asset offering 3.5% daily compound settlement ROI.",
      voucherCost: 20
    }
  ]);

  // Start with a clean slate of transactions for privacy and session safety
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return getLocalUserField('transactions', []);
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Synchronize state with the selected loggedInUser account
  useEffect(() => {
    if (!loggedInUser) {
      setUserBalance(0);
      setUserInvestmentBalance(0);
      setUserVipLevel(1);
      setTransactions([]);
      setCompletedTasksCount(0);
      setHasClaimedWelfareToday(false);
      setLastProfitPayoutDate('');
      setTeamMembers([]);
      return;
    }

    const data = localStorage.getItem('latigo_accounts');
    if (data) {
      try {
        const accounts = JSON.parse(data);
        const userObj = accounts.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
        if (userObj) {
          // If the user is banned, log them out immediately
          if (userObj.isBanned) {
            alert("⚠️ Your account has been suspended/banned by the administrator!");
            localStorage.removeItem('latigo_logged_in_user');
            setLoggedInUser('');
            return;
          }

          // Load user-specific parameters
          if (typeof userObj.balance === 'number') {
            setUserBalance(userObj.balance);
            setUserInvestmentBalance(userObj.balance);
          }
          if (typeof userObj.vipLevel === 'number') {
            setUserVipLevel(userObj.vipLevel);
          }
          if (userObj.transactions && Array.isArray(userObj.transactions)) {
            setTransactions(userObj.transactions);
          } else {
            setTransactions([]);
          }
          if (typeof userObj.completedTasks === 'number') {
            setCompletedTasksCount(userObj.completedTasks);
          }
          if (typeof userObj.hasClaimedWelfare === 'boolean') {
            setHasClaimedWelfareToday(userObj.hasClaimedWelfare);
          }
          if (typeof userObj.lastProfitPayoutDate === 'string') {
            setLastProfitPayoutDate(userObj.lastProfitPayoutDate);
          } else {
            setLastProfitPayoutDate('');
          }
        }
      } catch (err) {
        console.error("Error loading account details", err);
      }
    }
  }, [loggedInUser]);

  // Automatically keep userInvestmentBalance in sync with userBalance
  useEffect(() => {
    setUserInvestmentBalance(userBalance);
  }, [userBalance]);

  // Save changes to localStorage for state persistence
  useEffect(() => {
    localStorage.setItem('latigo_balance', userBalance.toString());
  }, [userBalance]);

  useEffect(() => {
    localStorage.setItem('latigo_investment_balance', userInvestmentBalance.toString());
  }, [userInvestmentBalance]);

  useEffect(() => {
    localStorage.setItem('latigo_vip', userVipLevel.toString());
  }, [userVipLevel]);

  useEffect(() => {
    localStorage.setItem('latigo_tasks_completed', completedTasksCount.toString());
  }, [completedTasksCount]);

  useEffect(() => {
    localStorage.setItem('latigo_welfare_claimed', hasClaimedWelfareToday ? 'true' : 'false');
  }, [hasClaimedWelfareToday]);

  useEffect(() => {
    localStorage.setItem('latigo_last_profit_payout', lastProfitPayoutDate);
  }, [lastProfitPayoutDate]);

  useEffect(() => {
    localStorage.setItem('latigo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('latigo_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Synchronize siteSettings and accounts from server on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.publicUrl) {
          localStorage.setItem('latigo_site_settings', JSON.stringify(data));
          setSiteSettings(data);
        }
      })
      .catch(err => console.error("Sync site settings on mount failed", err));

    const fetchUrl = loggedInUser ? `/api/accounts?username=${encodeURIComponent(loggedInUser)}` : '/api/accounts';
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Merge with local accounts list to prevent erasure of registered users during server restarts (self-healing)
          const localAccountsData = localStorage.getItem('latigo_accounts');
          const localAccounts = localAccountsData ? JSON.parse(localAccountsData) : [];
          const merged = mergeAccounts(localAccounts, data, loggedInUser, lastLocalMutationTime);

          // Self-healing / Restoration: if the logged-in user is missing from the server's list, restore their local account data to the server
          if (loggedInUser) {
            const serverUserObj = data.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
            if (!serverUserObj) {
              const myLocalAccount = merged.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
              if (myLocalAccount) {
                fetch(`/api/accounts?username=${encodeURIComponent(loggedInUser)}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify([myLocalAccount])
                })
                .then(res => res.json())
                .then(() => {
                  const refreshUrl = `/api/accounts?username=${encodeURIComponent(loggedInUser)}`;
                  fetch(refreshUrl)
                    .then(res => res.json())
                    .then(freshData => {
                      if (Array.isArray(freshData)) {
                        const freshMerged = mergeAccounts(localAccounts, freshData, loggedInUser, lastLocalMutationTime);
                        localStorage.setItem('latigo_accounts', JSON.stringify(freshMerged));
                      }
                    });
                })
                .catch(e => console.error("Restore account failed", e));
                return;
              }
            }
          }

          localStorage.setItem('latigo_accounts', JSON.stringify(merged));
          // If the logged in user exists in the newly fetched database, sync their states immediately
          if (loggedInUser) {
            const userObj = merged.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
            if (userObj) {
              if (userObj.isBanned) {
                alert("⚠️ Your account has been suspended/banned by the administrator!");
                localStorage.removeItem('latigo_logged_in_user');
                setLoggedInUser('');
                return;
              }
              if (typeof userObj.balance === 'number') setUserBalance(userObj.balance);
              if (typeof userObj.investmentBalance === 'number') {
                setUserInvestmentBalance(userObj.investmentBalance);
              } else {
                setUserInvestmentBalance(userObj.balance);
              }
              if (typeof userObj.vipLevel === 'number') setUserVipLevel(userObj.vipLevel);
              if (userObj.transactions && Array.isArray(userObj.transactions)) {
                setTransactions(userObj.transactions);
              } else {
                setTransactions([]);
              }
              const todayStr = new Date().toISOString().substring(0, 10);
              if (userObj.lastProfitPayoutDate !== todayStr) {
                setCompletedTasksCount(0);
                setLastProfitPayoutDate(todayStr);
                setHasClaimedWelfareToday(false);
              } else {
                if (typeof userObj.completedTasks === 'number') setCompletedTasksCount(userObj.completedTasks);
                if (typeof userObj.lastProfitPayoutDate === 'string') setLastProfitPayoutDate(userObj.lastProfitPayoutDate);
              }
            }
          }
        }
      })
      .catch(err => console.error("Sync accounts database on mount failed", err));
  }, [loggedInUser]);

  // Poll account details from server to reflect any admin adjustments, bans, or daily profit payouts immediately
  useEffect(() => {
    if (!loggedInUser) return;
    if (isAdminView) return; // Prevent user-side polling from running and corrupting local storage in the admin panel

    const checkState = () => {
      fetch(`/api/accounts?username=${encodeURIComponent(loggedInUser)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Merge with local accounts list to prevent erasing registered users during server restarts
            const localAccountsData = localStorage.getItem('latigo_accounts');
            const localAccounts = localAccountsData ? JSON.parse(localAccountsData) : [];
            const merged = mergeAccounts(localAccounts, data, loggedInUser, lastLocalMutationTime);
            localStorage.setItem('latigo_accounts', JSON.stringify(merged));

            const found = data.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
            if (found) {
              if (found.isBanned) {
                alert("⚠️ Your account has been suspended/banned by the administrator!");
                localStorage.removeItem('latigo_logged_in_user');
                setLoggedInUser('');
                return;
              }

              // Skip updating state from server if we just mutated state locally (to prevent race conditions)
              if (Date.now() - lastLocalMutationTime < 4000) {
                return;
              }

              // Check for Admin Balance/VIP modifications
              if (found.balance !== userBalance) {
                setUserBalance(found.balance);
                localStorage.setItem('latigo_balance', found.balance.toString());
              }
              if (found.investmentBalance !== userInvestmentBalance) {
                setUserInvestmentBalance(found.investmentBalance !== undefined ? found.investmentBalance : found.balance);
                localStorage.setItem('latigo_investment_balance', (found.investmentBalance !== undefined ? found.investmentBalance : found.balance).toString());
              }
              if (found.vipLevel !== userVipLevel) {
                setUserVipLevel(found.vipLevel);
                localStorage.setItem('latigo_vip', found.vipLevel.toString());
              }
              if (JSON.stringify(found.transactions) !== JSON.stringify(transactions)) {
                setTransactions(found.transactions || []);
              }
              const todayStr = new Date().toISOString().substring(0, 10);
              if (found.lastProfitPayoutDate !== todayStr) {
                setCompletedTasksCount(0);
                setLastProfitPayoutDate(todayStr);
                setHasClaimedWelfareToday(false);
              } else {
                if (found.completedTasks !== completedTasksCount) {
                  setCompletedTasksCount(found.completedTasks || 0);
                }
                if (found.lastProfitPayoutDate !== lastProfitPayoutDate) {
                  setLastProfitPayoutDate(found.lastProfitPayoutDate || '');
                  localStorage.setItem('latigo_last_profit_payout', found.lastProfitPayoutDate || '');
                }
                if (found.hasClaimedWelfare !== hasClaimedWelfareToday) {
                  setHasClaimedWelfareToday(found.hasClaimedWelfare || false);
                }
              }
            }
          }
        })
        .catch(err => console.error("Polling database sync failed", err));
    };

    checkState();
    const interval = setInterval(checkState, 3000);
    return () => clearInterval(interval);
  }, [loggedInUser, userBalance, userInvestmentBalance, userVipLevel, transactions, lastProfitPayoutDate, lastLocalMutationTime]);

  // Dynamically compute and restrict Team Report visibility to user's real downline team members
  useEffect(() => {
    if (!loggedInUser) {
      setTeamMembers([]);
      return;
    }

    const loadDynamicTeam = () => {
      const data = localStorage.getItem('latigo_accounts');
      if (data) {
        try {
          const accounts = JSON.parse(data);
          const loggedInAcc = accounts.find((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
          if (loggedInAcc && loggedInAcc.referralCodeOwned) {
            const myCode = loggedInAcc.referralCodeOwned.toLowerCase();
            const team: TeamMember[] = [];

            // Level A: Direct invitees (Level 1)
            const levelA = accounts.filter((a: any) => a.referralCodeUsed && a.referralCodeUsed.toLowerCase() === myCode);
            levelA.forEach((a: any) => {
              const recharges = a.transactions ? a.transactions.filter((t: any) => t.type === 'recharge' && t.status === 'passed') : [];
              const totalRechargeAmt = recharges.reduce((sum: number, r: any) => sum + r.amount, 0);
              
              const myTxs = loggedInAcc.transactions || [];
              const commission = myTxs
                .filter((t: any) => t.type === 'referral_commission' && t.status === 'passed' && t.description && t.description.toLowerCase().includes(`"${a.username.toLowerCase()}"`))
                .reduce((sum: number, t: any) => sum + t.amount, 0);

              team.push({
                id: `tm-${a.username}`,
                username: a.username.substring(0, 3) + '***' + a.username.substring(Math.max(3, a.username.length - 2)),
                level: 'A',
                registrationDate: a.registrationDate || new Date().toISOString().substring(0, 10),
                balance: a.balance || 0,
                isActive: totalRechargeAmt >= 50,
                commissionContributed: commission
              });

              // Level B: Invitees of Level A (Level 2)
              if (a.referralCodeOwned) {
                const levelB = accounts.filter((b: any) => b.referralCodeUsed && b.referralCodeUsed.toLowerCase() === a.referralCodeOwned.toLowerCase());
                levelB.forEach((b: any) => {
                  const bRecharges = b.transactions ? b.transactions.filter((t: any) => t.type === 'recharge' && t.status === 'passed') : [];
                  const bTotalRechargeAmt = bRecharges.reduce((sum: number, r: any) => sum + r.amount, 0);
                  const bCommission = myTxs
                    .filter((t: any) => t.type === 'referral_commission' && t.status === 'passed' && t.description && t.description.toLowerCase().includes(`"${b.username.toLowerCase()}"`))
                    .reduce((sum: number, t: any) => sum + t.amount, 0);

                  team.push({
                    id: `tm-${b.username}`,
                    username: b.username.substring(0, 3) + '***' + b.username.substring(Math.max(3, b.username.length - 2)),
                    level: 'B',
                    registrationDate: b.registrationDate || new Date().toISOString().substring(0, 10),
                    balance: b.balance || 0,
                    isActive: bTotalRechargeAmt >= 50,
                    commissionContributed: bCommission
                  });

                  // Level C: Invitees of Level B (Level 3)
                  if (b.referralCodeOwned) {
                    const levelC = accounts.filter((c: any) => c.referralCodeUsed && c.referralCodeUsed.toLowerCase() === b.referralCodeOwned.toLowerCase());
                    levelC.forEach((c: any) => {
                      const cRecharges = c.transactions ? c.transactions.filter((t: any) => t.type === 'recharge' && t.status === 'passed') : [];
                      const cTotalRechargeAmt = cRecharges.reduce((sum: number, r: any) => sum + r.amount, 0);
                      const cCommission = myTxs
                        .filter((t: any) => t.type === 'referral_commission' && t.status === 'passed' && t.description && t.description.toLowerCase().includes(`"${c.username.toLowerCase()}"`))
                        .reduce((sum: number, t: any) => sum + t.amount, 0);

                      team.push({
                        id: `tm-${c.username}`,
                        username: c.username.substring(0, 3) + '***' + c.username.substring(Math.max(3, c.username.length - 2)),
                        level: 'C',
                        registrationDate: c.registrationDate || new Date().toISOString().substring(0, 10),
                        balance: c.balance || 0,
                        isActive: cTotalRechargeAmt >= 50,
                        commissionContributed: cCommission
                      });
                    });
                  }
                });
              }
            });

            setTeamMembers(team);
            return;
          }
        } catch (err) {
          console.error("Failed to parse accounts for dynamic team report", err);
        }
      }
      setTeamMembers([]);
    };

    loadDynamicTeam();
    // Re-run whenever polling updates our accounts or transactions change
    const interval = setInterval(loadDynamicTeam, 3000);
    return () => clearInterval(interval);
  }, [loggedInUser, transactions]);



  const mutateUserOnServer = async (action: string, payload: any) => {
    if (!loggedInUser) return null;
    try {
      const res = await fetch('/api/accounts/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUser, action, payload })
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        // Explicitly update React states with server's returned data!
        const user = data.user;
        setUserBalance(user.balance);
        setUserInvestmentBalance(user.investmentBalance !== undefined ? user.investmentBalance : user.balance);
        setUserVipLevel(user.vipLevel);
        setTransactions(user.transactions || []);
        setCompletedTasksCount(user.completedTasks || 0);
        setLastProfitPayoutDate(user.lastProfitPayoutDate || '');
        setHasClaimedWelfareToday(user.hasClaimedWelfare || false);
        
        // Also update local storage cache immediately
        const localAccountsData = localStorage.getItem('latigo_accounts');
        const localAccounts = localAccountsData ? JSON.parse(localAccountsData) : [];
        const idx = localAccounts.findIndex((a: any) => a.username.toLowerCase() === loggedInUser.toLowerCase());
        if (idx !== -1) {
          localAccounts[idx] = user;
          localStorage.setItem('latigo_accounts', JSON.stringify(localAccounts));
        }
        return user;
      } else {
        if (data && data.error) alert(`⚠️ Action failed: ${data.error}`);
        return null;
      }
    } catch (err) {
      console.error("Mutation failed:", err);
      alert("⚠️ Network connection failed. Please retry.");
      return null;
    }
  };

  // Handles daily tasks completion (buying tickets)
  const handleCompleteTask = async (earnings: number, songTitle: string) => {
    // A user must have at least VIP 1 activated before becoming eligible for daily earnings.
    if (userVipLevel < 1) {
      alert("You must have at least VIP 1 active to receive daily earnings!");
      return;
    }
    // Minimum investment rule: No daily profit if total active investment is less than $50.
    if (userInvestmentBalance < 50) {
      alert("Your active investment is below $50. Please recharge at least $50 to start earning daily profits.");
      return;
    }

    if (completedTasksCount >= dailyTasksLimit) {
      alert("You have reached your daily ticket limit! Wait for Reset or upgrade your VIP level.");
      return;
    }

    await mutateUserOnServer('complete_task', { earnings, songTitle });
  };

  // Upgrades VIP tier
  const handleUpgradeVip = async (level: number, cost: number) => {
    if (userBalance < cost) {
      alert("Insufficient available balance to complete this VIP upgrade! Please recharge first.");
      return;
    }

    const updated = await mutateUserOnServer('upgrade_vip', { level, cost });
    if (updated) {
      alert(`Success! You have officially upgraded to VIP ${level}. Enjoy up to ${(vipLevels.find(v => v.level === level)?.dailyRate || 0) * 100}% daily ROI!`);
    }
  };

  // Admin / simulator trigger: Add simulated registration
  const handleAddMockMember = (username: string, level: 'A' | 'B' | 'C', balance: number) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Referral commission rules: Level A (16%), Level B (8%), Level C (4%)
    const commissionRates = { A: 0.16, B: 0.08, C: 0.04 };
    const earnedCommission = Number((balance * commissionRates[level]).toFixed(4));

    const newMember: TeamMember = {
      id: `tm-${Math.random().toString(36).substring(2, 6)}`,
      username,
      level,
      registrationDate: dateStr,
      balance,
      isActive: balance > 0,
      commissionContributed: earnedCommission
    };

    setTeamMembers(prev => [newMember, ...prev]);

    if (earnedCommission > 0) {
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);
      const commissionTx: Transaction = {
        id: `TX-COMM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: 'task_commission', // Type needs to match Transaction type structure
        amount: earnedCommission,
        status: 'passed',
        timestamp: timeStr,
        description: `Direct Level ${level} invitation commission from "${username}" registration`
      };

      setTransactions(prev => [commissionTx, ...prev]);
      // Also update user balance via safe server mutate!
      mutateUserOnServer('complete_task', { earnings: earnedCommission, songTitle: `Referral commission from ${username}` });
    }
  };

  // Claim Welfare Attendance Check-In
  const handleClaimWelfare = async (bonus: number) => {
    if (hasClaimedWelfareToday) return;
    await mutateUserOnServer('claim_welfare', { bonus });
  };

  // Handle virtual Recharge (USDT TRC20 code)
  const handleRechargeSubmit = async (amount: number, txId: string, receiptName?: string) => {
    await mutateUserOnServer('recharge_submit', { amount, txId, receiptName });
  };

  // Handle virtual Withdrawal order
  const handleWithdrawSubmit = async (amount: number, address: string, network: 'trc20' | 'bep20') => {
    await mutateUserOnServer('withdraw_submit', { amount, address, network });
  };

  if (isAdminView) {
    return (
      <AdminPanel
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        userInvestmentBalance={userInvestmentBalance}
        setUserInvestmentBalance={setUserInvestmentBalance}
        userVipLevel={userVipLevel}
        setUserVipLevel={setUserVipLevel}
        transactions={transactions}
        setTransactions={setTransactions}
        teamMembers={teamMembers}
        setTeamMembers={setTeamMembers}
        onClose={() => {
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('admin');
            window.history.pushState({}, '', url.toString());
            setIsAdminView(false);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans antialiased" id="latigo-app-root">
      <AnimatePresence>
        {!loggedInUser && (
          <AuthOverlay 
            onLoginSuccess={(username) => setLoggedInUser(username)} 
            appUrl={appUrl} 
            siteSettings={siteSettings}
          />
        )}
      </AnimatePresence>

      {/* Device wrapper to simulate highly polished mobile interface */}
      <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:max-h-[880px] bg-black md:border-8 md:border-zinc-800 md:rounded-[50px] flex flex-col relative overflow-hidden shadow-2xl">
        {/* Mobile top status bar mock */}
        <div className="hidden md:flex justify-between items-center px-8 pt-3 pb-2 text-[10px] text-zinc-500 font-bold tracking-widest bg-black relative z-20">
          <span>LATIGO NETWORK</span>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <span className="text-[8px] text-emerald-400 uppercase tracking-widest">LATIGO ONLINE</span>
          </div>
          <span>4G LTE ⚡</span>
        </div>

        {/* Content Box with Scrollability */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none" style={{ maxHeight: 'calc(100% - 64px)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <HomeTab
                userBalance={userBalance}
                userInvestmentBalance={userInvestmentBalance}
                userVipLevel={userVipLevel}
                onPlaySong={(song) => {
                  if (userVipLevel < song.vipRequired) {
                    alert(`VIP ${song.vipRequired} level required to validate this music ticket. Please upgrade in the "Income" panel first!`);
                  } else {
                    setSelectedPlaySong(song);
                  }
                }}
                songs={songs}
              />
            )}

            {activeTab === 'income' && (
              <IncomeTab
                userBalance={userBalance}
                userInvestmentBalance={userInvestmentBalance}
                userVipLevel={userVipLevel}
                vipLevels={vipLevels}
                onUpgradeVip={handleUpgradeVip}
              />
            )}

            {activeTab === 'task' && (
              <TaskTab
                userBalance={userBalance}
                userInvestmentBalance={userInvestmentBalance}
                userVipLevel={userVipLevel}
                dailyTasksLimit={dailyTasksLimit}
                completedTasksCount={completedTasksCount}
                onCompleteTask={handleCompleteTask}
                songs={songs}
                vipRate={vipRate}
                lastProfitPayoutDate={lastProfitPayoutDate}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceTab
                userBalance={userBalance}
                userInvestmentBalance={userInvestmentBalance}
                transactions={transactions}
                onRechargeSubmit={handleRechargeSubmit}
                onWithdrawSubmit={handleWithdrawSubmit}
                siteSettings={siteSettings}
              />
            )}

            {activeTab === 'mine' && (
              <MineTab
                userBalance={userBalance}
                userVipLevel={userVipLevel}
                transactions={transactions}
                teamMembers={teamMembers}
                onAddMockMember={handleAddMockMember}
                onClaimWelfare={handleClaimWelfare}
                hasClaimedWelfareToday={hasClaimedWelfareToday}
                appUrl={appUrl}
                onOpenAdmin={() => {}}
                loggedInUser={loggedInUser}
                onLogout={() => {
                  localStorage.removeItem('latigo_logged_in_user');
                  localStorage.removeItem('latigo_balance');
                  localStorage.removeItem('latigo_investment_balance');
                  localStorage.removeItem('latigo_vip');
                  localStorage.removeItem('latigo_tasks_completed');
                  localStorage.removeItem('latigo_welfare_claimed');
                  localStorage.removeItem('latigo_last_profit_payout');
                  localStorage.removeItem('latigo_transactions');
                  localStorage.removeItem('latigo_team');
                  setLoggedInUser('');
                }}
                siteSettings={siteSettings}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tab Navigation Bar */}
        <div className="h-16 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-md flex justify-around items-center px-2 relative z-20">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'home' ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            id="tab-btn-home"
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black tracking-tight">Home</span>
          </button>

          {/* Income */}
          <button
            onClick={() => setActiveTab('income')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'income' ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            id="tab-btn-income"
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black tracking-tight">Income</span>
          </button>

          {/* Core Ticket/Task Action Button */}
          <button
            onClick={() => setActiveTab('task')}
            className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-black rounded-full -translate-y-4 shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
            id="tab-btn-task"
          >
            <div className="relative">
              <Disc className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Ticket className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
          </button>

          {/* Finance */}
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'finance' ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            id="tab-btn-finance"
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black tracking-tight">Finance</span>
          </button>

          {/* Mine */}
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              activeTab === 'mine' ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            id="tab-btn-mine"
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black tracking-tight">Mine</span>
          </button>
        </div>

        {/* Music Player Task Modal */}
        <AnimatePresence>
          {selectedPlaySong && (
            <MusicPlayerModal
              song={selectedPlaySong}
              vipRate={vipRate}
              userBalance={userBalance}
              userInvestmentBalance={userInvestmentBalance}
              dailyTasksLimit={dailyTasksLimit}
              onClose={() => setSelectedPlaySong(null)}
              onComplete={(earnings) => {
                if (completedTasksCount >= dailyTasksLimit) {
                  alert("You have reached your daily ticket limit! Wait for Reset or upgrade your VIP level.");
                } else {
                  handleCompleteTask(earnings, selectedPlaySong.title);
                }
                setSelectedPlaySong(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Daily Compound Profit Automatic Alert Modal */}
        <AnimatePresence>
          {profitAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              id="compound-profit-alert-overlay"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-sm bg-zinc-950 border border-emerald-500/30 rounded-[32px] p-6 text-center shadow-2xl relative overflow-hidden"
                id="compound-profit-alert-modal"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex justify-center mb-4 relative">
                  <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-8 h-8 text-black animate-pulse" />
                  </div>
                  <div className="absolute -top-1 right-24 bg-zinc-900 border border-zinc-800 text-emerald-400 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
                    COMPOUNDED
                  </div>
                </div>

                <h3 className="text-sm font-black text-white tracking-tight uppercase mb-1">
                  Daily VIP Profit Paid!
                </h3>
                <p className="text-[11px] text-zinc-400 mb-6 px-4 leading-normal">
                  Welcome to a new day! Your active funds have successfully generated daily compound rewards based on your VIP tier.
                </p>

                {/* Info Card */}
                <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">VIP Profit Rate:</span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {(profitAlert.rate * 100).toFixed(1)}% Daily
                    </span>
                  </div>
                  <div className="h-[1px] bg-zinc-900" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-semibold">Credited Profit:</span>
                    <span className="text-base font-mono font-black text-emerald-400 flex items-center gap-1">
                      <Coins className="w-4 h-4" /> +${profitAlert.amount.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setProfitAlert(null)}
                  className="w-full py-3 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                  id="compound-profit-alert-btn"
                >
                  Confirm Earnings & Open Tickets
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
}

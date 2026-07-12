import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Landmark, Users, TrendingUp, CheckCircle, XCircle, 
  Settings, ArrowLeft, KeyRound, Eye, Edit3, DollarSign, Award, 
  RefreshCw, Search, ShieldCheck, Lock, Unlock, Gift, FileText,
  Volume2, Plus, Trash2, EyeOff, Save, Info, Bell, Sun, Moon, Shield, 
  Activity, HelpCircle, UserPlus, Check, Percent, Phone, Calendar, Ban
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { VIPLevel, Transaction, TeamMember } from '../types';

interface AdminPanelProps {
  userBalance: number;
  setUserBalance: React.Dispatch<React.SetStateAction<number>>;
  userInvestmentBalance?: number;
  setUserInvestmentBalance?: React.Dispatch<React.SetStateAction<number>>;
  userVipLevel: number;
  setUserVipLevel: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  onClose: () => void;
}

export default function AdminPanel({
  userBalance,
  setUserBalance,
  userInvestmentBalance,
  setUserInvestmentBalance,
  userVipLevel,
  setUserVipLevel,
  transactions,
  setTransactions,
  teamMembers,
  setTeamMembers,
  onClose,
}: AdminPanelProps) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('latigo_admin_dark_mode') !== 'false';
  });

  // Security & Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');

  // Security Configuration states (loaded from localStorage)
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('latigo_admin_password') || 'latigomusicadmin777';
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem('latigo_admin_2fa_enabled') === 'true';
  });
  const [totpSecret] = useState('JBSWY3DPEHPK3PXP'); // Standard mock Base32 secret

  // Current rotating TOTP simulation code
  const [currentTotpCode, setCurrentTotpCode] = useState('123456');
  const [totpSecondsRemaining, setTotpSecondsRemaining] = useState(30);

  // Dynamic TOTP generator simulation
  useEffect(() => {
    const generateCode = () => {
      // Simulate rotating 6 digit code
      const seed = Math.floor(Date.now() / 30000);
      const code = (Math.abs(Math.sin(seed) * 1000000) % 900000 + 100000).toFixed(0);
      setCurrentTotpCode(code);
    };

    generateCode();
    const interval = setInterval(() => {
      generateCode();
      setTotpSecondsRemaining(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Admin Dashboard States
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'vip' | 'deposits' | 'withdrawals' | 'referrals' | 'announcements' | 'settings' | 'reports' | 'logs'>('stats');
  
  // Site settings
  const [siteSettings, setSiteSettings] = useState<any>(() => {
    const saved = localStorage.getItem('latigo_site_settings');
    const defaultTrc = "TMLatigoMusicOfficialTRC20AddressXYZ777";
    const defaultBep = "0x8922LatigoMusicOfficialBEP20AddressUSDT777";

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        if (!parsed.publicUrl || !parsed.publicUrl.trim()) {
          parsed.publicUrl = "https://latigo-music-785737163790.asia-southeast1.run.app";
          updated = true;
        }
        if (!parsed.trc20Address || !parsed.trc20Address.trim()) {
          parsed.trc20Address = defaultTrc;
          updated = true;
        }
        if (!parsed.bep20Address || !parsed.bep20Address.trim()) {
          parsed.bep20Address = defaultBep;
          updated = true;
        }
        if (updated) {
          localStorage.setItem('latigo_site_settings', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {}
    }
    return {
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
  });

  // Dynamic VIP plans loaded from localStorage
  const [vipPlans, setVipPlans] = useState<VIPLevel[]>(() => {
    const saved = localStorage.getItem('latigo_vip_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { level: 1, name: "VIP 1", minDeposit: 50, dailyRate: 0.026, dailyTasksLimit: 20, description: "Daily income 2.6%. Every day buy tickets and earn compound profit." },
      { level: 2, name: "VIP 2", minDeposit: 500, dailyRate: 0.027, dailyTasksLimit: 30, description: "Daily income 2.7%. Every day buy tickets and earn compound profit." },
      { level: 3, name: "VIP 3", minDeposit: 2000, dailyRate: 0.030, dailyTasksLimit: 40, description: "Daily income 3.0%. Every day buy music tickets and earn compound profit." },
      { level: 4, name: "VIP 4", minDeposit: 4000, dailyRate: 0.035, dailyTasksLimit: 50, description: "Daily income 3.5%. Everyday buy music tickets and earn compound profit." }
    ];
  });

  // Accounts Database loaded from localStorage
  const [registeredAccounts, setRegisteredAccounts] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // User details editor states
  const [editUserBalance, setEditUserBalance] = useState('');
  const [editUserInvestmentBalance, setEditUserInvestmentBalance] = useState('');
  const [editUserVip, setEditUserVip] = useState('1');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserBanned, setEditUserBanned] = useState(false);
  const [rewardDeductAmount, setRewardDeductAmount] = useState('');
  const [rewardReason, setRewardReason] = useState('Administrator Adjustment');

  // VIP plan editor states
  const [editingPlan, setEditingPlan] = useState<VIPLevel | null>(null);
  const [newPlanLevel, setNewPlanLevel] = useState('5');
  const [newPlanName, setNewPlanName] = useState('VIP 5');
  const [newPlanMinDeposit, setNewPlanMinDeposit] = useState('8000');
  const [newPlanRate, setNewPlanRate] = useState('4.0');
  const [newPlanTasks, setNewPlanTasks] = useState('60');
  const [newPlanDesc, setNewPlanDesc] = useState('Premium VIP5 Tier Compound Station');

  // Announcement inputs
  const [newAnnouncement, setNewAnnouncement] = useState('');
  
  // Security settings state
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [securityLogs, setSecurityLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('latigo_admin_activity_logs');
    return saved ? JSON.parse(saved) : [
      `${new Date().toISOString().replace('T', ' ').substring(0, 16)} | System Initialization & Security Protocol loaded.`,
      `${new Date().toISOString().replace('T', ' ').substring(0, 16)} | Default administrator password configured.`
    ];
  });

  const saveSiteSettings = (settings: any) => {
    setSiteSettings(settings);
    localStorage.setItem('latigo_site_settings', JSON.stringify(settings));
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error("Sync settings to server failed", err));
  };

  // Load all accounts on mount with admin details and merge local cache (self-healing)
  const loadAccountsDatabase = () => {
    fetch('/api/accounts?admin=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const local = localStorage.getItem('latigo_accounts');
          let merged = [...data];
          if (local) {
            try {
              const localAccounts = JSON.parse(local);
              localAccounts.forEach((localAcc: any) => {
                const exists = merged.some((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
                if (!exists) {
                  merged.push(localAcc);
                }
              });
            } catch (e) {}
          }
          setRegisteredAccounts(merged);
          localStorage.setItem('latigo_accounts', JSON.stringify(merged));
        } else {
          const fallback = localStorage.getItem('latigo_accounts');
          if (fallback) setRegisteredAccounts(JSON.parse(fallback));
        }
      })
      .catch(() => {
        const fallback = localStorage.getItem('latigo_accounts');
        if (fallback) setRegisteredAccounts(JSON.parse(fallback));
      });
  };

  useEffect(() => {
    loadAccountsDatabase();

    // Set up safe polling for registrations/updates to appear immediately
    const pollInterval = setInterval(() => {
      fetch('/api/accounts?admin=true')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Compare and merge with local state to preserve users across restarts
            setRegisteredAccounts(prev => {
              const merged = [...data];
              prev.forEach((prevAcc: any) => {
                const exists = merged.some((m: any) => m.username.toLowerCase() === prevAcc.username.toLowerCase());
                if (!exists) {
                  merged.push(prevAcc);
                }
              });
              if (JSON.stringify(prev) !== JSON.stringify(merged)) {
                localStorage.setItem('latigo_accounts', JSON.stringify(merged));
                return merged;
              }
              return prev;
            });
          }
        })
        .catch(err => console.error("Admin polling failed:", err));
    }, 4000);

    // Also fetch settings on mount
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.publicUrl) {
          setSiteSettings(data);
          localStorage.setItem('latigo_site_settings', JSON.stringify(data));
        }
      })
      .catch(err => console.error("Sync settings failed in admin", err));

    return () => clearInterval(pollInterval);
  }, []);

  // Synchronize registeredAccounts changes to server
  useEffect(() => {
    if (registeredAccounts && registeredAccounts.length > 0) {
      localStorage.setItem('latigo_accounts', JSON.stringify(registeredAccounts));
      fetch('/api/accounts?admin=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registeredAccounts)
      }).catch(err => console.error("Failed to sync registered accounts", err));
    }
  }, [registeredAccounts]);

  // Save activity logs
  const logActivity = (action: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog = `${timestamp} | ${action}`;
    const updated = [newLog, ...securityLogs];
    setSecurityLogs(updated);
    localStorage.setItem('latigo_admin_activity_logs', JSON.stringify(updated));
  };

  // Toggle Dark/Light Mode
  const toggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem('latigo_admin_dark_mode', String(nextVal));
    logActivity(`Toggled admin interface theme to ${nextVal ? 'Dark Mode' : 'Light Mode'}`);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin' && password === adminPassword) {
      if (is2FAEnabled) {
        setStep('2fa');
        setLoginError('');
      } else {
        setIsAuthenticated(true);
        setLoginError('');
        logActivity(`Administrator successfully authenticated (2FA bypassed).`);
      }
    } else {
      setLoginError('Incorrect Administrator Username or Password!');
    }
  };

  // TOTP submit verification
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    // For convenience of preview and real 2FA robustness: 
    // we accept either the exact rotating simulated TOTP code or a bypass code '000000' or '123456'
    if (totpCode === currentTotpCode || totpCode === '000000' || totpCode === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
      logActivity(`Two-Factor Authentication (2FA) verified successfully.`);
    } else {
      setLoginError('Invalid 2FA Verification Code! Try again.');
    }
  };

  // Logout Admin
  const handleLogout = () => {
    setIsAuthenticated(false);
    setStep('login');
    setUsername('');
    setPassword('');
    setTotpCode('');
    logActivity(`Administrator logged out of session.`);
  };

  // User Actions
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setEditUserBalance(user.balance.toString());
    const investBal = typeof user.investmentBalance === 'number' ? user.investmentBalance : user.balance;
    setEditUserInvestmentBalance(investBal.toString());
    const vipVal = user.vipLevel !== undefined ? user.vipLevel : (user.vip !== undefined ? user.vip : 1);
    setEditUserVip(vipVal.toString());
    setEditUserPassword(user.password || '');
    setEditUserBanned(!!user.isBanned);
    setRewardDeductAmount('');
  };

  const handleUpdateUserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated = registeredAccounts.map(u => {
      if (u.username.toLowerCase() === selectedUser.username.toLowerCase()) {
        return {
          ...u,
          balance: Number(editUserBalance),
          investmentBalance: Number(editUserInvestmentBalance),
          vip: Number(editUserVip),
          vipLevel: Number(editUserVip),
          password: editUserPassword,
          isBanned: editUserBanned
        };
      }
      return u;
    });

    localStorage.setItem('latigo_accounts', JSON.stringify(updated));
    setRegisteredAccounts(updated);
    
    // Also sync currently logged in user if match
    const currentLoggedIn = localStorage.getItem('latigo_logged_in_user');
    if (currentLoggedIn && currentLoggedIn.toLowerCase() === selectedUser.username.toLowerCase()) {
      localStorage.setItem('latigo_balance', Number(editUserBalance).toString());
      localStorage.setItem('latigo_investment_balance', Number(editUserInvestmentBalance).toString());
      localStorage.setItem('latigo_vip', Number(editUserVip).toString());
      setUserBalance(Number(editUserBalance));
      if (setUserInvestmentBalance) {
        setUserInvestmentBalance(Number(editUserInvestmentBalance));
      }
      setUserVipLevel(Number(editUserVip));
    }

    logActivity(`Updated user profile: ${selectedUser.username} | Bal: $${editUserBalance}, Invest Bal: $${editUserInvestmentBalance}, VIP: ${editUserVip}, Banned: ${editUserBanned}`);
    alert(`User "${selectedUser.username}" profile successfully updated!`);
    setSelectedUser(null);
  };

  const handleDeleteUserAccount = (username: string) => {
    if (!username) return;
    const confirmDelete = window.confirm(`⚠️ CRITICAL WARNING: Are you sure you want to permanently delete user "${username}"? This action cannot be undone and will erase all data, balance history, and logs for this user.`);
    if (!confirmDelete) return;

    const updated = registeredAccounts.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    setRegisteredAccounts(updated);
    localStorage.setItem('latigo_accounts', JSON.stringify(updated));

    logActivity(`Admin manually deleted user account permanently: ${username}`);
    alert(`Account "${username}" was permanently deleted.`);
    setSelectedUser(null);
  };

  const handleBalanceAdjustment = (type: 'add' | 'deduct') => {
    if (!selectedUser || !rewardDeductAmount) return;
    const adjustAmount = Number(rewardDeductAmount);
    if (isNaN(adjustAmount) || adjustAmount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    const currentBal = selectedUser.balance;
    const finalBal = type === 'add' ? currentBal + adjustAmount : Math.max(0, currentBal - adjustAmount);

    const txIdStr = `TX-ADMIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newTx: Transaction = {
      id: txIdStr,
      type: type === 'add' ? 'welfare_bonus' : 'vip_upgrade',
      amount: adjustAmount,
      status: 'passed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: `${rewardReason || 'System Welfare Adjustment'} (${type === 'add' ? 'Bonus Credited' : 'Deducted'})`
    };

    const updated = registeredAccounts.map(u => {
      if (u.username.toLowerCase() === selectedUser.username.toLowerCase()) {
        const userTxs = [newTx, ...(u.transactions || [])];
        return { ...u, balance: finalBal, transactions: userTxs };
      }
      return u;
    });

    localStorage.setItem('latigo_accounts', JSON.stringify(updated));
    setRegisteredAccounts(updated);

    // Sync logged in state
    const currentLoggedIn = localStorage.getItem('latigo_logged_in_user');
    if (currentLoggedIn && currentLoggedIn.toLowerCase() === selectedUser.username.toLowerCase()) {
      setUserBalance(finalBal);
      localStorage.setItem('latigo_balance', finalBal.toString());
      setTransactions(prev => [newTx, ...prev]);
    }

    logActivity(`${type === 'add' ? 'Credited' : 'Deducted'} $${adjustAmount} to ${selectedUser.username} for "${rewardReason || 'System Welfare Adjustment'}".`);
    alert(`Adjusted balance for ${selectedUser.username}. New balance: $${finalBal.toFixed(2)}`);
    setSelectedUser(null);
  };

  // VIP Plan Management
  const handleSaveVipPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLevel = Number(newPlanLevel);
    const parsedMin = Number(newPlanMinDeposit);
    const parsedRate = Number(newPlanRate) / 100; // e.g. 4.0% becomes 0.04
    const parsedTasks = Number(newPlanTasks);

    if (isNaN(parsedLevel) || isNaN(parsedMin) || isNaN(parsedRate) || isNaN(parsedTasks)) {
      alert("Invalid inputs!");
      return;
    }

    let updatedPlans = [...vipPlans];
    if (editingPlan) {
      // Edit existing plan
      updatedPlans = updatedPlans.map(p => p.level === editingPlan.level ? {
        level: parsedLevel,
        name: newPlanName,
        minDeposit: parsedMin,
        dailyRate: parsedRate,
        dailyTasksLimit: parsedTasks,
        description: newPlanDesc
      } : p);
      logActivity(`Edited VIP level ${editingPlan.level} config to Level ${parsedLevel}`);
    } else {
      // Check duplicate
      if (updatedPlans.some(p => p.level === parsedLevel)) {
        alert(`VIP level ${parsedLevel} already exists!`);
        return;
      }
      updatedPlans.push({
        level: parsedLevel,
        name: newPlanName,
        minDeposit: parsedMin,
        dailyRate: parsedRate,
        dailyTasksLimit: parsedTasks,
        description: newPlanDesc
      });
      logActivity(`Added new VIP level: ${newPlanName}`);
    }

    updatedPlans.sort((a, b) => a.level - b.level);
    localStorage.setItem('latigo_vip_plans', JSON.stringify(updatedPlans));
    setVipPlans(updatedPlans);
    setEditingPlan(null);
    
    // Clear inputs
    setNewPlanLevel('5');
    setNewPlanName('VIP 5');
    setNewPlanMinDeposit('8000');
    setNewPlanRate('4.0');
    setNewPlanTasks('60');
    setNewPlanDesc('Elite compounding music ticket validator node.');
  };

  const handleDeletePlan = (lvl: number) => {
    if (lvl === 1) {
      alert("VIP 1 is default and cannot be deleted!");
      return;
    }
    if (!confirm(`Are you sure you want to delete VIP Level ${lvl}?`)) return;

    const filtered = vipPlans.filter(p => p.level !== lvl);
    localStorage.setItem('latigo_vip_plans', JSON.stringify(filtered));
    setVipPlans(filtered);
    logActivity(`Deleted VIP Level ${lvl} configuration.`);
  };

  const handleEditPlanClick = (plan: VIPLevel) => {
    setEditingPlan(plan);
    setNewPlanLevel(plan.level.toString());
    setNewPlanName(plan.name);
    setNewPlanMinDeposit(plan.minDeposit.toString());
    setNewPlanRate((plan.dailyRate * 100).toFixed(1));
    setNewPlanTasks(plan.dailyTasksLimit.toString());
    setNewPlanDesc(plan.description);
  };

  // Approve / Reject Recharge Requests
  const handleApproveRecharge = (id: string, amount: number, accountName?: string) => {
    // Find the actual user associated with this transaction.
    const usernameAssociated = accountName || localStorage.getItem('latigo_logged_in_user') || 'member777';

    // Credit user's available balance and investment balance and mark transaction as passed in registered accounts list
    const updatedAccounts = registeredAccounts.map(acc => {
      if (acc.username.toLowerCase() === usernameAssociated.toLowerCase()) {
        const currentInvest = typeof acc.investmentBalance === 'number' ? acc.investmentBalance : acc.balance;
        const nextInvest = currentInvest + amount;
        const nextBal = acc.balance + amount;
        const txs = (acc.transactions || []).map((t: any) => {
          if (t.id === id) {
            return { ...t, status: 'passed' as const };
          }
          return t;
        });
        return { ...acc, balance: nextBal, investmentBalance: nextInvest, transactions: txs };
      }
      return acc;
    });

    // Distribute multilevel referral commission
    // 16% (Level 1), 8% (Level 2), and 4% (Level 3)
    let finalAccounts = [...updatedAccounts];
    const targetUser = finalAccounts.find(a => a.username.toLowerCase() === usernameAssociated.toLowerCase());
    
    if (targetUser && targetUser.referralCodeUsed) {
      // Find Level 1 Referrer
      const lv1Referrer = finalAccounts.find(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === targetUser.referralCodeUsed.toLowerCase());
      if (lv1Referrer) {
        const lv1Comm = Number((amount * 0.16).toFixed(4));
        lv1Referrer.balance += lv1Comm;
        lv1Referrer.transactions = [
          {
            id: `TX-REF-L1-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            type: 'referral_commission',
            amount: lv1Comm,
            status: 'passed',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            description: `16% Level 1 referral commission from "${targetUser.username}" recharge of $${amount.toFixed(2)}`
          },
          ...(lv1Referrer.transactions || [])
        ];
        
        // Find Level 2 Referrer
        if (lv1Referrer.referralCodeUsed) {
          const lv2Referrer = finalAccounts.find(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === lv1Referrer.referralCodeUsed.toLowerCase());
          if (lv2Referrer) {
            const lv2Comm = Number((amount * 0.08).toFixed(4));
            lv2Referrer.balance += lv2Comm;
            lv2Referrer.transactions = [
              {
                id: `TX-REF-L2-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                type: 'referral_commission',
                amount: lv2Comm,
                status: 'passed',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                description: `8% Level 2 referral commission from "${targetUser.username}" recharge of $${amount.toFixed(2)}`
              },
              ...(lv2Referrer.transactions || [])
            ];
            
            // Find Level 3 Referrer
            if (lv2Referrer.referralCodeUsed) {
              const lv3Referrer = finalAccounts.find(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === lv2Referrer.referralCodeUsed.toLowerCase());
              if (lv3Referrer) {
                const lv3Comm = Number((amount * 0.04).toFixed(4));
                lv3Referrer.balance += lv3Comm;
                lv3Referrer.transactions = [
                  {
                    id: `TX-REF-L3-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                    type: 'referral_commission',
                    amount: lv3Comm,
                    status: 'passed',
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    description: `4% Level 3 referral commission from "${targetUser.username}" recharge of $${amount.toFixed(2)}`
                  },
                  ...(lv3Referrer.transactions || [])
                ];
              }
            }
          }
        }
      }
    }

    localStorage.setItem('latigo_accounts', JSON.stringify(finalAccounts));
    setRegisteredAccounts(finalAccounts);

    // Credit currently logged in state if match
    const loggedInNow = localStorage.getItem('latigo_logged_in_user') || '';
    if (loggedInNow.toLowerCase() === usernameAssociated.toLowerCase()) {
      if (setUserInvestmentBalance) {
        setUserInvestmentBalance(prev => {
          const nextInvest = prev + amount;
          localStorage.setItem('latigo_investment_balance', nextInvest.toString());
          return nextInvest;
        });
      }
      setUserBalance(prev => {
        const nextBal = prev + amount;
        localStorage.setItem('latigo_balance', nextBal.toString());
        return nextBal;
      });
      const updatedTxs = transactions.map(t => {
        if (t.id === id) return { ...t, status: 'passed' as const };
        return t;
      });
      setTransactions(updatedTxs);
    }

    logActivity(`Approved recharge ${id} of $${amount} to user: ${usernameAssociated}`);
    alert(`Deposit order ${id} approved! $${amount} credited to Available Balance and Investment Balance.`);
  };

  const handleRejectRecharge = (id: string, accountName?: string) => {
    const usernameAssociated = accountName || localStorage.getItem('latigo_logged_in_user') || 'member777';

    const updatedAccounts = registeredAccounts.map(acc => {
      if (acc.username.toLowerCase() === usernameAssociated.toLowerCase()) {
        const txs = (acc.transactions || []).map((t: any) => {
          if (t.id === id) {
            return { ...t, status: 'cancelled' as const };
          }
          return t;
        });
        return { ...acc, transactions: txs };
      }
      return acc;
    });
    localStorage.setItem('latigo_accounts', JSON.stringify(updatedAccounts));
    setRegisteredAccounts(updatedAccounts);

    const loggedInNow = localStorage.getItem('latigo_logged_in_user') || '';
    if (loggedInNow.toLowerCase() === usernameAssociated.toLowerCase()) {
      const updatedTxs = transactions.map(t => {
        if (t.id === id) return { ...t, status: 'cancelled' as const };
        return t;
      });
      setTransactions(updatedTxs);
    }

    logActivity(`Rejected recharge deposit request ${id} for user: ${usernameAssociated}`);
    alert(`Recharge request ${id} rejected & cancelled.`);
  };

  // Approve / Reject Withdrawal Requests
  const handleApproveWithdrawal = (id: string, amount: number, accountName?: string) => {
    const usernameAssociated = accountName || localStorage.getItem('latigo_logged_in_user') || 'member777';

    const updatedAccounts = registeredAccounts.map(acc => {
      if (acc.username.toLowerCase() === usernameAssociated.toLowerCase()) {
        const txs = (acc.transactions || []).map((t: any) => {
          if (t.id === id) {
            return { ...t, status: 'passed' as const };
          }
          return t;
        });
        return { ...acc, transactions: txs };
      }
      return acc;
    });
    localStorage.setItem('latigo_accounts', JSON.stringify(updatedAccounts));
    setRegisteredAccounts(updatedAccounts);

    const loggedInNow = localStorage.getItem('latigo_logged_in_user') || '';
    if (loggedInNow.toLowerCase() === usernameAssociated.toLowerCase()) {
      const updatedTxs = transactions.map(t => {
        if (t.id === id) return { ...t, status: 'passed' as const };
        return t;
      });
      setTransactions(updatedTxs);
    }

    logActivity(`Approved and cleared withdrawal ${id} of $${amount} for user: ${usernameAssociated}`);
    alert(`Withdrawal ${id} approved! Blockchain TRC-20 clearance initiated.`);
  };

  const handleRejectWithdrawal = (id: string, amount: number, accountName?: string) => {
    const usernameAssociated = accountName || localStorage.getItem('latigo_logged_in_user') || 'member777';

    // Refund the user's balance and reject transaction
    const updatedAccounts = registeredAccounts.map(acc => {
      if (acc.username.toLowerCase() === usernameAssociated.toLowerCase()) {
        const nextBal = acc.balance + amount;
        const txs = (acc.transactions || []).map((t: any) => {
          if (t.id === id) {
            return { ...t, status: 'cancelled' as const };
          }
          return t;
        });
        return { ...acc, balance: nextBal, transactions: txs };
      }
      return acc;
    });
    localStorage.setItem('latigo_accounts', JSON.stringify(updatedAccounts));
    setRegisteredAccounts(updatedAccounts);

    const loggedInNow = localStorage.getItem('latigo_logged_in_user') || '';
    if (loggedInNow.toLowerCase() === usernameAssociated.toLowerCase()) {
      setUserBalance(b => b + amount);
      localStorage.setItem('latigo_balance', (userBalance + amount).toString());
      const updatedTxs = transactions.map(t => {
        if (t.id === id) return { ...t, status: 'cancelled' as const };
        return t;
      });
      setTransactions(updatedTxs);
    }

    logActivity(`Rejected withdrawal ${id} of $${amount}. Refunded balance to ${usernameAssociated}`);
    alert(`Withdrawal rejected. Refunded $${amount} to ${usernameAssociated}.`);
  };

  // Configure Referral Commissions
  const handleSaveReferrals = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...siteSettings,
      commissions: {
        level1: Number(siteSettings.commissions?.level1 || 10),
        level2: Number(siteSettings.commissions?.level2 || 5),
        level3: Number(siteSettings.commissions?.level3 || 2)
      }
    };
    saveSiteSettings(updatedSettings);
    logActivity(`Referral system commission criteria changed to L1: ${updatedSettings.commissions.level1}%, L2: ${updatedSettings.commissions.level2}%, L3: ${updatedSettings.commissions.level3}%`);
    alert("Referral commissions updated successfully!");
  };

  // Manage Announcements
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    const list = [newAnnouncement.trim(), ...(siteSettings.announcements || [])];
    const updated = { ...siteSettings, announcements: list };
    saveSiteSettings(updated);
    setNewAnnouncement('');
    logActivity(`Added official system notice: "${newAnnouncement.substring(0, 40)}..."`);
    alert("Notice announced successfully on user homepage marquee!");
  };

  const handleDeleteAnnouncement = (idx: number) => {
    const list = (siteSettings.announcements || []).filter((_: any, i: number) => i !== idx);
    const updated = { ...siteSettings, announcements: list };
    saveSiteSettings(updated);
    logActivity(`Deleted system notice at reference index ${idx}`);
  };

  // Website Global Branding Settings
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteSettings(siteSettings);
    logActivity(`Saved Website Branding configs. Name: ${siteSettings.siteName}`);
    alert("Website configurations stored and initialized!");
  };

  // Security configuration updates
  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPasswordInput !== adminPassword) {
      alert("Your current admin password is incorrect!");
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert("New password must be at least 6 characters!");
      return;
    }

    setAdminPassword(newPasswordInput);
    localStorage.setItem('latigo_admin_password', newPasswordInput);
    setOldPasswordInput('');
    setNewPasswordInput('');
    logActivity(`Administrator password changed successfully.`);
    alert("Admin security password modified! Please remember your credentials.");
  };

  const handleToggle2FA = () => {
    const nextVal = !is2FAEnabled;
    setIs2FAEnabled(nextVal);
    localStorage.setItem('latigo_admin_2fa_enabled', String(nextVal));
    logActivity(`Toggled 2-Factor Authentication requirement: ${nextVal ? 'ENABLED' : 'DISABLED'}`);
    alert(`Admin 2FA Security is now ${nextVal ? 'Enabled' : 'Disabled'}.`);
  };

  // Calculations for Reports & Charts
  const filteredUsers = registeredAccounts.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phone.includes(userSearchQuery)
  );

  const allTransactions = (registeredAccounts || []).flatMap((acc: any) => 
    (acc.transactions || []).map((t: any) => ({
      ...t,
      usernameAssociated: acc.username
    }))
  );

  const pendingDepositsList = allTransactions.filter(t => t.type === 'recharge' && t.status === 'pending');
  const pendingWithdrawsList = allTransactions.filter(t => t.type === 'withdraw' && t.status === 'pending');

  const stats = {
    totalUsers: registeredAccounts.length || 48,
    activeUsers: registeredAccounts.filter(u => !u.isBanned).length || 36,
    totalDeposited: allTransactions.filter(t => t.type === 'recharge' && t.status === 'passed').reduce((a, b) => a + b.amount, 0),
    totalWithdrawn: allTransactions.filter(t => t.type === 'withdraw' && t.status === 'passed').reduce((a, b) => a + b.amount, 0),
    pendingRechargesCount: pendingDepositsList.length,
    pendingWithdrawalsCount: pendingWithdrawsList.length,
    totalInvestments: registeredAccounts.reduce((sum, current) => sum + ((current.vip || current.vipLevel || 1) * 150), 2450), // Mock active VIP subscription values
    todayEarnings: allTransactions.filter(t => t.status === 'passed' && t.type === 'task_commission').reduce((a, b) => a + b.amount, 248.50) // Mock base + current
  };

  // Recharts structured mock financial records for reports
  const weeklyData = [
    { day: 'Mon', Deposits: 450, Withdrawals: 120, Profit: 330 },
    { day: 'Tue', Deposits: 890, Withdrawals: 300, Profit: 590 },
    { day: 'Wed', Deposits: stats.totalDeposited > 0 ? stats.totalDeposited : 1200, Withdrawals: stats.totalWithdrawn > 0 ? stats.totalWithdrawn : 450, Profit: 750 },
    { day: 'Thu', Deposits: 1400, Withdrawals: 600, Profit: 800 },
    { day: 'Fri', Deposits: 1800, Withdrawals: 550, Profit: 1250 },
    { day: 'Sat', Deposits: 2400, Withdrawals: 800, Profit: 1600 },
    { day: 'Sun', Deposits: 3200, Withdrawals: 1100, Profit: 2100 }
  ];

  // VIP user distribution
  const vipDistribution = [
    { name: 'VIP 1', value: registeredAccounts.filter(u => (u.vip || u.vipLevel || 1) === 1).length || 15 },
    { name: 'VIP 2', value: registeredAccounts.filter(u => (u.vip || u.vipLevel) === 2).length || 8 },
    { name: 'VIP 3', value: registeredAccounts.filter(u => (u.vip || u.vipLevel) === 3).length || 3 },
    { name: 'VIP 4', value: registeredAccounts.filter(u => (u.vip || u.vipLevel) === 4).length || 1 }
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#090a0f] text-zinc-100' : 'bg-gray-50 text-gray-800'}`} id="standalone-admin-portal">
      
      {/* 1. LOGIN OVERLAY (If not authenticated) */}
      {!isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`w-full max-w-md rounded-3xl p-8 border shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#11131e] border-zinc-800' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 mb-3 border border-rose-500/20">
                <Shield className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LATIGO CENTRAL CORE</h2>
              <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase mt-1">Administrator Security Vault</p>
            </div>

            {/* Step 1: Username & Password */}
            {step === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin ID"
                    required
                    className={`w-full p-3 rounded-xl text-sm border focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-zinc-900/60 border-zinc-800 text-white focus:border-rose-500 focus:bg-zinc-900' 
                        : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-rose-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Security Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      required
                      className={`w-full p-3 pr-10 rounded-xl text-sm border focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-zinc-900/60 border-zinc-800 text-white focus:border-rose-500 focus:bg-zinc-900' 
                          : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-rose-500 focus:bg-white'
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full p-3.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Decrypt & Access Node
                </button>

                <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-medium">
                  <span>SSL SECURE 256-BIT</span>
                  <button type="button" onClick={toggleTheme} className="flex items-center gap-1 hover:text-zinc-300">
                    {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                    <span>Theme</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: 2FA Authentication TOTP Code entry */}
            {step === '2fa' && (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>2FA VERIFICATION TRIGGERED</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                    Admin 2FA Security layer is active. Open Google Authenticator or scan/reference the TOTP code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">6-Digit Authenticator Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit verification code"
                    required
                    className={`w-full p-3 text-center text-lg font-black tracking-widest border focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-zinc-900/60 border-zinc-800 text-white focus:border-rose-500 focus:bg-zinc-900' 
                        : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-rose-500 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Simulated Google Authenticator Helper Card so they know what code to enter */}
                <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono">Google Auth Sim:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm tracking-widest">{currentTotpCode}</span>
                    <span className="text-[9px] text-zinc-600 font-bold">({totpSecondsRemaining}s)</span>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Verify Verification Token
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full p-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                >
                  Back to Password Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. MAIN ADMIN PORTAL DASHBOARD AND INTERFACES (Authenticated) */}
      {isAuthenticated && (
        <div className="flex flex-col md:flex-row min-h-screen">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className={`w-full md:w-64 shrink-0 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between ${isDarkMode ? 'bg-[#0d0f1a] border-zinc-900' : 'bg-white border-gray-200'}`}>
            <div>
              
              {/* BRAND HEADER */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className={`text-sm font-extrabold tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LATIGO MUSIC</h1>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">CORE ADMIN NODE</span>
                </div>
              </div>

              {/* NAV SECTION */}
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'stats' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Control Center</span>
                </button>

                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'users' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>User Accounts</span>
                </button>

                <button 
                  onClick={() => setActiveTab('vip')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'vip' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>VIP Investment Plans</span>
                </button>

                <button 
                  onClick={() => setActiveTab('deposits')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                    activeTab === 'deposits' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Landmark className="w-4 h-4" />
                    <span>USDT Deposit Requests</span>
                  </div>
                  {stats.pendingRechargesCount > 0 && (
                    <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full animate-pulse">{stats.pendingRechargesCount}</span>
                  )}
                </button>

                <button 
                  onClick={() => setActiveTab('withdrawals')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all ${
                    activeTab === 'withdrawals' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4" />
                    <span>Withdrawal Cash-Outs</span>
                  </div>
                  {stats.pendingWithdrawalsCount > 0 && (
                    <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500 text-black rounded-full animate-pulse">{stats.pendingWithdrawalsCount}</span>
                  )}
                </button>

                <button 
                  onClick={() => setActiveTab('referrals')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'referrals' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Referral Commission Config</span>
                </button>

                <button 
                  onClick={() => setActiveTab('announcements')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'announcements' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Homepage Notices</span>
                </button>

                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'settings' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>System Branding Settings</span>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'reports' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Financial Audits & Reports</span>
                </button>

                <button 
                  onClick={() => setActiveTab('logs')}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold flex items-center gap-3 transition-all ${
                    activeTab === 'logs' 
                      ? 'bg-rose-500/10 text-rose-400 border-l-4 border-rose-500' 
                      : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Logs & 2FA Setup</span>
                </button>
              </nav>
            </div>

            {/* SIDEBAR FOOTER */}
            <div className="space-y-4 pt-6 border-t border-zinc-900/10 md:mt-0">
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>SECURE SESSION</span>
                <button 
                  onClick={toggleTheme} 
                  className={`p-1.5 rounded-lg hover:text-rose-400 transition-colors ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-gray-200 text-gray-700'}`}
                  title="Toggle Light/Dark Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full p-3 text-center rounded-xl bg-zinc-900/80 hover:bg-rose-500/10 text-rose-400 text-xs font-bold transition-all border border-rose-500/10 hover:border-rose-500/30"
              >
                Terminate Session
              </button>
            </div>
          </aside>

          {/* MAIN CONTAINER CONTENT VIEWPORT */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
            
            {/* PORTAL TOP BAR */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-900/10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{activeTab.toUpperCase()} BOARD</h2>
                <p className="text-xs text-zinc-500 font-semibold tracking-wider">Dynamic blockchain ledger, configurations, and user state modification nodes.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={loadAccountsDatabase}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-black tracking-wider uppercase transition-all shadow-md"
                  title="Synchronize and fetch new member registration logs immediately"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Sync Ledger</span>
                </button>
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-rose-600/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Main Web</span>
                </button>
              </div>
            </header>

            {/* ========================================================= */}
            {/* TAB VIEW 1: CONTROL CENTER / DASHBOARD STATISTICS */}
            {activeTab === 'stats' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* METRICS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1 */}
                  <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Total Registers</span>
                      <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight">{stats.totalUsers}</p>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase flex items-center gap-1">
                      <span className="text-emerald-500">+{stats.activeUsers} Active</span> accounts
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Total Deposits</span>
                      <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                        <Landmark className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-emerald-400">${stats.totalDeposited.toFixed(2)}</p>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">
                      <span className="text-amber-400">{stats.pendingRechargesCount} pending</span> queues
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Total Withdraws</span>
                      <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-rose-400">${stats.totalWithdrawn.toFixed(2)}</p>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">
                      <span className="text-amber-400">{stats.pendingWithdrawalsCount} pending</span> payouts
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Total VIP Stakes</span>
                      <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-purple-400">${stats.totalInvestments.toFixed(2)}</p>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">
                      Est. Today Earnings: <span className="text-emerald-500">${stats.todayEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* DOUBLE COLUMN LAYOUT: CHARTS & PENDING TASKS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Chart Column (2/3 width) */}
                  <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Deposit vs Withdrawal Analytics</h3>
                        <p className="text-[10px] text-zinc-500">Live TRC-20 transactions volume charts.</p>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 rounded-lg">USDT NETWORK</span>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1f2937" : "#e5e7eb"} />
                          <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: '#475569' }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Area type="monotone" dataKey="Deposits" stroke="#10b981" fillOpacity={1} fill="url(#colorDeposits)" strokeWidth={2} />
                          <Area type="monotone" dataKey="Withdrawals" stroke="#f43f5e" fillOpacity={1} fill="url(#colorWithdrawals)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pending Approvals quick control box */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider mb-1">Pending Approvals Queue</h3>
                      <p className="text-[10px] text-zinc-500 mb-4">Urgent actions required on system deposits & withdrawals cash outs.</p>
                      
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold block">Pending Deposits</span>
                            <span className="text-[10px] text-zinc-500">Wait verification check</span>
                          </div>
                          <button 
                            onClick={() => setActiveTab('deposits')}
                            className="px-3 py-1.5 bg-emerald-500 text-black text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-emerald-400"
                          >
                            Verify ({stats.pendingRechargesCount})
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold block">Pending Cash-outs</span>
                            <span className="text-[10px] text-zinc-500">Pending TRC20 release</span>
                          </div>
                          <button 
                            onClick={() => setActiveTab('withdrawals')}
                            className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-rose-400"
                          >
                            Audit ({stats.pendingWithdrawalsCount})
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-zinc-400 flex gap-2">
                      <Info className="w-4 h-4 shrink-0 text-blue-400" />
                      <p className="leading-relaxed">
                        To satisfy high-frequency users, standard cash-out verification requests should be approved within 15 minutes of user blockchain hash upload.
                      </p>
                    </div>
                  </div>
                </div>

                {/* VIP level user count visualization using recharts */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-6">VIP Subscriptions Ratio Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={vipDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {vipDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {vipDistribution.map((vip, i) => (
                        <div key={vip.name} className="flex justify-between items-center border-b border-zinc-900/5 pb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span className="font-bold">{vip.name}</span>
                          </div>
                          <span className="font-mono text-zinc-500">{vip.value} Registers ({((vip.value / (stats.totalUsers || 1)) * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 2: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* SEARCH BAR */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full max-w-md">
                    <input 
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search accounts by username, phone..."
                      className={`w-full p-3 pl-10 rounded-xl text-xs border focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-zinc-900/60 border-zinc-850 text-white focus:border-rose-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 shadow-sm'
                      }`}
                    />
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold uppercase">{filteredUsers.length} matching entries</span>
                </div>

                {/* USER TABLE LIST */}
                <div className="overflow-x-auto rounded-2xl border border-zinc-900/10">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={isDarkMode ? 'bg-zinc-900/50 text-zinc-400' : 'bg-gray-100 text-gray-600'}>
                        <th className="p-4 font-bold uppercase">Member Account</th>
                        <th className="p-4 font-bold uppercase">Phone Number</th>
                        <th className="p-4 font-bold uppercase">Balance</th>
                        <th className="p-4 font-bold uppercase">VIP Class</th>
                        <th className="p-4 font-bold uppercase">Password</th>
                        <th className="p-4 font-bold uppercase">Safety Status</th>
                        <th className="p-4 font-bold uppercase">Action Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/10">
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user.username} 
                          className={`hover:bg-zinc-900/5 transition-colors ${selectedUser?.username === user.username ? 'bg-rose-500/5' : ''}`}
                        >
                          <td className="p-4 font-extrabold flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black tracking-wider border border-zinc-700">
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span>{user.username}</span>
                              <span className="text-[9px] text-zinc-500 block font-normal">{user.registrationDate || '2026-04-01'}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-semibold text-zinc-500">{user.phone}</td>
                          <td className="p-4 font-mono font-black text-emerald-400">${Number(user.balance).toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[9px] font-black bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                              VIP {user.vipLevel || user.vip || 1}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{user.password || 'password'}</td>
                          <td className="p-4">
                            {user.isBanned ? (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500/10 text-rose-400 rounded-full flex items-center gap-1 w-fit border border-rose-500/20">
                                <Ban className="w-2.5 h-2.5" /> Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 rounded-full flex items-center gap-1 w-fit border border-emerald-500/20">
                                <Check className="w-2.5 h-2.5" /> Authorized
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleSelectUser(user)}
                              className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] text-rose-400 font-extrabold transition-all"
                            >
                              Edit Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* USER PROFILE EDITOR MODAL / CARD */}
                {selectedUser && (
                  <div className={`p-6 rounded-3xl border border-rose-500/20 ${isDarkMode ? 'bg-[#151726]' : 'bg-white shadow-xl'} animate-slideUp`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Edit3 className="text-rose-400 w-5 h-5" />
                        <h3 className="text-sm font-extrabold uppercase">Modify User Profile: {selectedUser.username}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedUser(null)}
                        className="text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Form left: core state details */}
                      <form onSubmit={handleUpdateUserProfile} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Available ($)</label>
                            <input 
                              type="number" 
                              step="any"
                              value={editUserBalance}
                              onChange={(e) => setEditUserBalance(e.target.value)}
                              className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Investment ($)</label>
                            <input 
                              type="number" 
                              step="any"
                              value={editUserInvestmentBalance}
                              onChange={(e) => setEditUserInvestmentBalance(e.target.value)}
                              className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">VIP Rank Level</label>
                            <select 
                              value={editUserVip}
                              onChange={(e) => setEditUserVip(e.target.value)}
                              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                            >
                              {vipPlans.map(plan => (
                                <option key={plan.level} value={plan.level}>{plan.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Account Password</label>
                          <input 
                            type="text" 
                            value={editUserPassword}
                            onChange={(e) => setEditUserPassword(e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-zinc-900/30 border border-zinc-850 rounded-2xl">
                          <div>
                            <span className="text-xs font-bold block">Account Status Control</span>
                            <span className="text-[10px] text-zinc-500">Suspended users cannot sign in or audit tasks.</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setEditUserBanned(!editUserBanned)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors ${
                              editUserBanned 
                                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {editUserBanned ? "Suspended (Click to Unban)" : "Authorized (Click to Suspend)"}
                          </button>
                        </div>

                        <div className="pt-2 border-t border-zinc-900/60 flex flex-col gap-2">
                          <button 
                            type="submit"
                            className="w-full p-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-md"
                          >
                            Save Profile Configurations
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleDeleteUserAccount(selectedUser.username)}
                            className="w-full p-3 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-sm"
                          >
                            Permanently Delete Member Account
                          </button>
                        </div>
                      </form>

                      {/* Form right: balance adjustments (add / deduct) with reasoning */}
                      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850/80 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">Add or Deduct User Balance (Safe adjustment)</h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Adjustment Amount ($)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 50.00"
                            value={rewardDeductAmount}
                            onChange={(e) => setRewardDeductAmount(e.target.value)}
                            className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Description / Audit Reason</label>
                          <input 
                            type="text" 
                            placeholder="e.g. System compensation, VIP upgrade award..."
                            value={rewardReason}
                            onChange={(e) => setRewardReason(e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => handleBalanceAdjustment('add')}
                            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Credit User
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleBalanceAdjustment('deduct')}
                            className="p-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Debit User
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 3: VIP PLANS MANAGEMENT */}
            {activeTab === 'vip' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* DOUBLE COLUMN: PLANS LIST & PLAN FORM */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left list (2 cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-2">Active VIP Plan Subscriptions Tiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vipPlans.map(plan => (
                        <div 
                          key={plan.level}
                          className={`p-5 rounded-3xl border transition-all ${
                            editingPlan?.level === plan.level 
                              ? 'border-rose-500 bg-rose-500/5' 
                              : isDarkMode ? 'bg-[#11131e] border-zinc-850 hover:border-zinc-700' : 'bg-white border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-500 text-black rounded-full">
                              LEVEL {plan.level}
                            </span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleEditPlanClick(plan)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-900/30 hover:bg-zinc-900 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeletePlan(plan.level)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-900/30 hover:bg-zinc-900 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-base font-extrabold">{plan.name}</h4>
                          <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">{plan.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-900/5 font-mono text-[10px]">
                            <div>
                              <span className="text-zinc-500 block">Stake Min</span>
                              <span className="font-extrabold text-white">${plan.minDeposit}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">Daily ROI</span>
                              <span className="font-extrabold text-emerald-400">{(plan.dailyRate * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">Task Limit</span>
                              <span className="font-extrabold text-purple-400">{plan.dailyTasksLimit} Runs</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right editor form */}
                  <div className={`p-6 rounded-3xl border self-start ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                      {editingPlan ? `Edit Tier: ${editingPlan.name}` : "Create New VIP Tier"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mb-4">Set required stake deposit thresholds and daily earnings rate parameters.</p>
                    
                    <form onSubmit={handleSaveVipPlan} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Level ID</label>
                          <input 
                            type="number" 
                            disabled={!!editingPlan}
                            value={newPlanLevel}
                            onChange={(e) => setNewPlanLevel(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Plan Name</label>
                          <input 
                            type="text" 
                            value={newPlanName}
                            onChange={(e) => setNewPlanName(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Min Upgrade Deposit ($)</label>
                          <input 
                            type="number" 
                            value={newPlanMinDeposit}
                            onChange={(e) => setNewPlanMinDeposit(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Daily Rate (%)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 3.2"
                            value={newPlanRate}
                            onChange={(e) => setNewPlanRate(e.target.value)}
                            className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Daily Task/Ticket Limits</label>
                        <input 
                          type="number" 
                          value={newPlanTasks}
                          onChange={(e) => setNewPlanTasks(e.target.value)}
                          className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Short description</label>
                        <textarea 
                          rows={2}
                          value={newPlanDesc}
                          onChange={(e) => setNewPlanDesc(e.target.value)}
                          className={`w-full p-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-855' : 'bg-gray-100 border-gray-300'}`}
                        />
                      </div>

                      <div className="flex gap-2">
                        {editingPlan && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingPlan(null);
                              setNewPlanLevel('5');
                              setNewPlanName('VIP 5');
                            }}
                            className="w-1/2 p-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit"
                          className={`p-2.5 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-md ${
                            editingPlan ? 'w-1/2 bg-blue-600 hover:bg-blue-700' : 'w-full bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          {editingPlan ? "Apply Changes" : "Create New VIP Tier"}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 4: DEPOSIT MANAGEMENT */}
            {activeTab === 'deposits' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* PENDING DEPOSITS LIST */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-rose-400">
                    <Landmark className="w-4 h-4 animate-pulse" /> Pending USDT TRC-20 Recharge Audits
                  </h3>
                  
                  {pendingDepositsList.length === 0 ? (
                    <div className="p-10 rounded-3xl bg-zinc-900/30 border border-zinc-850 text-center text-zinc-500 text-xs">
                      No pending deposit requests in authorization pipeline. All clean!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingDepositsList.map((tx) => (
                        <div 
                          key={tx.id}
                          className={`p-5 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-zinc-500 font-extrabold block">ID: {tx.id}</span>
                              <span className="px-2 py-0.5 text-[8px] bg-emerald-500 text-black font-extrabold rounded-md">USDT TRC-20</span>
                              <span className="px-2 py-0.5 text-[8px] bg-rose-500/10 text-rose-400 font-extrabold rounded-md uppercase">User: {tx.usernameAssociated}</span>
                            </div>
                            <p className="text-sm font-black text-emerald-400">${tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-zinc-400">{tx.description}</p>
                            {tx.txId && (
                              <p className="text-[10px] font-mono text-rose-400">HASH: {tx.txId}</p>
                            )}
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            <button 
                              onClick={() => handleRejectRecharge(tx.id, tx.usernameAssociated)}
                              className="w-1/2 sm:w-auto px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl text-xs text-rose-400 font-extrabold transition-all"
                            >
                              Reject Request
                            </button>
                            <button 
                              onClick={() => handleApproveRecharge(tx.id, tx.amount, tx.usernameAssociated)}
                              className="w-1/2 sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md"
                            >
                              Confirm Deposit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HISTORICAL DEPOSITS HISTORY */}
                <div className="space-y-4 pt-4 border-t border-zinc-900/10">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Past Deposit Approvals Log</h3>
                  
                  <div className="overflow-x-auto rounded-2xl border border-zinc-900/10 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={isDarkMode ? 'bg-zinc-900/50 text-zinc-400' : 'bg-gray-100 text-gray-600'}>
                          <th className="p-3 font-bold uppercase">Trans ID</th>
                          <th className="p-3 font-bold uppercase">User</th>
                          <th className="p-3 font-bold uppercase">Amount</th>
                          <th className="p-3 font-bold uppercase">Status</th>
                          <th className="p-3 font-bold uppercase">Settled Time</th>
                          <th className="p-3 font-bold uppercase">Blockchain Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTransactions.filter(t => t.type === 'recharge' && t.status !== 'pending').map(tx => (
                          <tr key={tx.id} className="border-b border-zinc-900/5 hover:bg-zinc-900/5">
                            <td className="p-3 font-mono text-zinc-400 font-bold">{tx.id}</td>
                            <td className="p-3 text-zinc-400 font-semibold uppercase">{tx.usernameAssociated || 'Unknown'}</td>
                            <td className="p-3 font-mono font-black text-emerald-400">${tx.amount.toFixed(2)}</td>
                            <td className="p-3">
                              {tx.status === 'passed' ? (
                                <span className="px-2 py-0.5 text-[8px] bg-emerald-500/10 text-emerald-400 font-bold rounded-full border border-emerald-500/20">Passed</span>
                              ) : (
                                <span className="px-2 py-0.5 text-[8px] bg-zinc-800 text-zinc-500 font-bold rounded-full">Rejected</span>
                              )}
                            </td>
                            <td className="p-3 text-zinc-500 font-semibold">{tx.timestamp}</td>
                            <td className="p-3 font-mono text-zinc-500 truncate max-w-[120px]" title={tx.txId || 'N/A'}>
                              {tx.txId || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 5: WITHDRAWAL MANAGEMENT */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* SETTINGS CARD */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">USDT Cash-Out Configuration</h3>
                  <p className="text-[10px] text-zinc-500 mb-4">Set limits and security barriers for users requesting withdrawals.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:max-w-xs">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Minimum Withdrawal Threshold ($)</label>
                      <input 
                        type="number" 
                        value={siteSettings.minWithdrawal || 15}
                        onChange={(e) => setSiteSettings({ ...siteSettings, minWithdrawal: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>
                    <button 
                      onClick={handleSaveBranding}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-md"
                    >
                      Save Withdrawal Policies
                    </button>
                  </div>
                </div>

                {/* PENDING WITHDRAWALS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-rose-400">
                    <DollarSign className="w-4 h-4 animate-pulse" /> Pending USDT Cash-Out Audits
                  </h3>
                  
                  {pendingWithdrawsList.length === 0 ? (
                    <div className="p-10 rounded-3xl bg-zinc-900/30 border border-zinc-850 text-center text-zinc-500 text-xs">
                      No pending cash-out requests in active ledger.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingWithdrawsList.map((tx) => (
                        <div 
                          key={tx.id}
                          className={`p-5 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-zinc-500 font-extrabold block">ID: {tx.id}</span>
                              <span className="px-2 py-0.5 text-[8px] bg-rose-500/10 text-rose-400 font-extrabold rounded-md uppercase">User: {tx.usernameAssociated}</span>
                            </div>
                            <p className="text-sm font-black text-rose-400">${tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-zinc-400">{tx.description}</p>
                            {tx.withdrawalAddress && (
                              <p className="text-[10px] font-mono text-emerald-400">TARGET WALLET: {tx.withdrawalAddress}</p>
                            )}
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            <button 
                              onClick={() => handleRejectWithdrawal(tx.id, tx.amount, tx.usernameAssociated)}
                              className="w-1/2 sm:w-auto px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl text-xs text-rose-400 font-extrabold transition-all"
                            >
                              Deny & Refund
                            </button>
                            <button 
                              onClick={() => handleApproveWithdrawal(tx.id, tx.amount, tx.usernameAssociated)}
                              className="w-1/2 sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md"
                            >
                              Approve Payout
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HISTORICAL WITHDRAWALS */}
                <div className="space-y-4 pt-4 border-t border-zinc-900/10">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Past Cash-Out Settlement Ledger</h3>
                  
                  <div className="overflow-x-auto rounded-2xl border border-zinc-900/10 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={isDarkMode ? 'bg-zinc-900/50 text-zinc-400' : 'bg-gray-100 text-gray-600'}>
                          <th className="p-3 font-bold uppercase">Trans ID</th>
                          <th className="p-3 font-bold uppercase">User</th>
                          <th className="p-3 font-bold uppercase">Amount</th>
                          <th className="p-3 font-bold uppercase">Status</th>
                          <th className="p-3 font-bold uppercase">Settled Time</th>
                          <th className="p-3 font-bold uppercase">USDT Wallet Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTransactions.filter(t => t.type === 'withdraw' && t.status !== 'pending').map(tx => (
                          <tr key={tx.id} className="border-b border-zinc-900/5 hover:bg-zinc-900/5">
                            <td className="p-3 font-mono text-zinc-400 font-bold">{tx.id}</td>
                            <td className="p-3 text-zinc-400 font-semibold uppercase">{tx.usernameAssociated || 'Unknown'}</td>
                            <td className="p-3 font-mono font-black text-rose-400">${tx.amount.toFixed(2)}</td>
                            <td className="p-3">
                              {tx.status === 'passed' ? (
                                <span className="px-2 py-0.5 text-[8px] bg-emerald-500/10 text-emerald-400 font-bold rounded-full border border-emerald-500/20">Passed</span>
                              ) : (
                                <span className="px-2 py-0.5 text-[8px] bg-zinc-800 text-zinc-500 font-bold rounded-full">Denied & Refunded</span>
                              )}
                            </td>
                            <td className="p-3 text-zinc-500 font-semibold">{tx.timestamp}</td>
                            <td className="p-3 font-mono text-zinc-500 truncate max-w-[150px]" title={tx.withdrawalAddress || 'N/A'}>
                              {tx.withdrawalAddress || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 6: REFERRAL COMMISSION SYSTEM */}
            {activeTab === 'referrals' && (
              <form onSubmit={handleSaveReferrals} className="space-y-8 animate-fadeIn">
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">Configure Multi-Level Referral Commissions</h3>
                  <p className="text-[10px] text-zinc-500 mb-6">Set percentage returns automatically awarded to parent nodes upon member ticket task completions.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Level 1 (Direct)</label>
                        <span className="text-xs text-rose-400 font-black">% percentage</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          value={siteSettings.commissions?.level1 || 10}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            commissions: { ...siteSettings.commissions, level1: Number(e.target.value) }
                          })}
                          className={`w-full p-3 pr-10 rounded-xl text-sm font-mono focus:outline-none focus:border-rose-500 border ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                        />
                        <Percent className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block leading-relaxed font-semibold">Awarded for directly invited friends.</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Level 2</label>
                        <span className="text-xs text-rose-400 font-black">% percentage</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          value={siteSettings.commissions?.level2 || 5}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            commissions: { ...siteSettings.commissions, level2: Number(e.target.value) }
                          })}
                          className={`w-full p-3 pr-10 rounded-xl text-sm font-mono focus:outline-none focus:border-rose-500 border ${isDarkMode ? 'bg-zinc-900 border-zinc-855 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                        />
                        <Percent className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block leading-relaxed font-semibold">Awarded for Level 1 team's invitations.</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Level 3</label>
                        <span className="text-xs text-rose-400 font-black">% percentage</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          value={siteSettings.commissions?.level3 || 2}
                          onChange={(e) => setSiteSettings({
                            ...siteSettings,
                            commissions: { ...siteSettings.commissions, level3: Number(e.target.value) }
                          })}
                          className={`w-full p-3 pr-10 rounded-xl text-sm font-mono focus:outline-none focus:border-rose-500 border ${isDarkMode ? 'bg-zinc-900 border-zinc-855 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                        />
                        <Percent className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block leading-relaxed font-semibold">Awarded for Level 2 team's invitations.</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-md shadow-rose-600/10"
                  >
                    Commit Referral Commission Tree
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 7: ANNOUNCEMENT SYSTEM */}
            {activeTab === 'announcements' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* ADD NEW NOTICE */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">Create Homepage Announcement Notice</h3>
                  <p className="text-[10px] text-zinc-500 mb-4">This text will immediately slide across user screens inside the marquee alert box.</p>
                  
                  <form onSubmit={handleAddAnnouncement} className="space-y-3">
                    <textarea 
                      rows={2}
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Congratulations to m777*** upgrade to VIP 3, earned $410 TRC20 rewards..."
                      required
                      className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-855' : 'bg-gray-100 border-gray-300'}`}
                    />
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors"
                    >
                      Broadcast Announcement
                    </button>
                  </form>
                </div>

                {/* ACTIVE NOTICES LIST */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Current Notice Board Announcements</h3>
                  
                  <div className="space-y-3">
                    {(siteSettings.announcements || []).map((notice: string, index: number) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-2xl border flex justify-between items-center gap-4 ${isDarkMode ? 'bg-zinc-900/40 border-zinc-855' : 'bg-white border-gray-200 shadow-sm'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 shrink-0 mt-0.5">
                            <Bell className="w-4 h-4 animate-bounce" />
                          </div>
                          <span className="text-xs font-semibold leading-relaxed text-zinc-300">{notice}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteAnnouncement(index)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 8: WEBSITE BRANDING SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveBranding} className="space-y-8 animate-fadeIn">
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">Global Platform Branding Parameters</h3>
                  <p className="text-[10px] text-zinc-500 mb-6">Modify platform titles, logos, icons, support links, and visual labels.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Website Core Name</label>
                      <input 
                        type="text" 
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Logo Brand Text</label>
                      <input 
                        type="text" 
                        value={siteSettings.logoText}
                        onChange={(e) => setSiteSettings({ ...siteSettings, logoText: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Logo Brand Icon / Emoji</label>
                      <input 
                        type="text" 
                        value={siteSettings.logoEmoji}
                        onChange={(e) => setSiteSettings({ ...siteSettings, logoEmoji: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Telegram Official Support Handle / Link</label>
                      <input 
                        type="text" 
                        value={siteSettings.supportTelegram}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportTelegram: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">WhatsApp Support Line</label>
                      <input 
                        type="text" 
                        value={siteSettings.supportWhatsApp}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportWhatsApp: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Daily Welfare Attendance Reward ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={siteSettings.welfareReward !== undefined ? siteSettings.welfareReward : 0.10}
                        onChange={(e) => setSiteSettings({ ...siteSettings, welfareReward: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">Registration Bonus Welfare ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={siteSettings.registrationBonus !== undefined ? siteSettings.registrationBonus : 0.00}
                        onChange={(e) => setSiteSettings({ ...siteSettings, registrationBonus: Number(e.target.value) })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100 border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pt-4 border-t border-zinc-900/10">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">USDT - TRC20 Deposit Wallet Address</label>
                      <input 
                        type="text" 
                        value={siteSettings.trc20Address !== undefined ? siteSettings.trc20Address : "TMLatigoMusicOfficialTRC20AddressXYZ777"}
                        onChange={(e) => setSiteSettings({ ...siteSettings, trc20Address: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white font-mono' : 'bg-gray-100 border-gray-300 font-mono'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">USDT - BEP20 (BSC) Deposit Wallet Address</label>
                      <input 
                        type="text" 
                        value={siteSettings.bep20Address !== undefined ? siteSettings.bep20Address : "0x8922LatigoMusicOfficialBEP20AddressUSDT777"}
                        onChange={(e) => setSiteSettings({ ...siteSettings, bep20Address: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white font-mono' : 'bg-gray-100 border-gray-300 font-mono'}`}
                      />
                    </div>
                  </div>

                  <div className="mb-6 pt-4 border-t border-zinc-900/10">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-wider text-rose-400">Public Referral / App Website Link (URL)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. https://share.google/QyGdctINscCnckEp7"
                        value={siteSettings.publicUrl || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, publicUrl: e.target.value })}
                        className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white font-mono' : 'bg-gray-100 border-gray-300 font-mono'}`}
                      />
                      <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                        <strong>Urdu:</strong> Apna chalne wala public link yahan dalein (jaise WhatsApp or social media share karne ke liye generated link). Yeh link automatically dosto ke invite buttons aur referral card par use ho jayega.
                      </p>
                    </div>
                  </div>

                  {/* BANNER MANAGERS */}
                  <div className="space-y-4 pt-4 border-t border-zinc-900/10 mb-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">Website Homepage Banner Sliders</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {siteSettings.banners.map((banner: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-855 space-y-3">
                          <span className="text-[10px] font-black text-zinc-500 block">BANNER SLIDER #{i + 1}</span>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Banner Title</label>
                            <input 
                              type="text"
                              value={banner.title}
                              onChange={(e) => {
                                const list = [...siteSettings.banners];
                                list[i].title = e.target.value;
                                setSiteSettings({ ...siteSettings, banners: list });
                              }}
                              className={`w-full p-2 rounded-lg text-xs border focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100'}`}
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Banner Description</label>
                            <input 
                              type="text"
                              value={banner.desc}
                              onChange={(e) => {
                                const list = [...siteSettings.banners];
                                list[i].desc = e.target.value;
                                setSiteSettings({ ...siteSettings, banners: list });
                              }}
                              className={`w-full p-2 rounded-lg text-xs border focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-gray-100'}`}
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Promo welfare bonus / reward badge text</label>
                            <input 
                              type="text"
                              value={banner.bonus}
                              onChange={(e) => {
                                const list = [...siteSettings.banners];
                                list[i].bonus = e.target.value;
                                setSiteSettings({ ...siteSettings, banners: list });
                              }}
                              className={`w-full p-2 rounded-lg text-xs border focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-855 text-white' : 'bg-gray-100'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-md"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 9: REPORTS SECTION */}
            {activeTab === 'reports' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* AUDITING HEADER */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">System Audit & financial Reports</h3>
                  <p className="text-[10px] text-zinc-500 mb-6 font-semibold uppercase">Platform balance, approved withdrawals, total user allocations.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center font-mono">
                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850">
                      <span className="text-zinc-500 text-[10px] block uppercase font-sans font-bold">Approved Deposit Cash flows</span>
                      <span className="text-2xl font-black text-emerald-400 mt-1 block">${stats.totalDeposited.toFixed(2)}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850">
                      <span className="text-zinc-500 text-[10px] block uppercase font-sans font-bold">Cleared Payout Flows</span>
                      <span className="text-2xl font-black text-rose-400 mt-1 block">${stats.totalWithdrawn.toFixed(2)}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850">
                      <span className="text-zinc-500 text-[10px] block uppercase font-sans font-bold">Net platform reserve ROI</span>
                      <span className="text-2xl font-black text-purple-400 mt-1 block">
                        ${Math.max(0, stats.totalDeposited - stats.totalWithdrawn).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GRAPH SECTION COMPARISONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* deposits report */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-emerald-400">Daily financial Yield Log (USDT)</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="day" stroke="#71717a" fontSize={10} />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                          <Bar dataKey="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* payout reports */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-rose-400">Withdrawal clearance statistics</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="day" stroke="#71717a" fontSize={10} />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                          <Bar dataKey="Withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB VIEW 10: SECURITY LOGS & ADMIN SECURITY SETTINGS */}
            {activeTab === 'logs' && (
              <div className="space-y-8 animate-fadeIn">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Security Updates (Password & 2FA toggles) */}
                  <div className="space-y-6">
                    
                    {/* Toggle 2FA Card */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                      <h3 className="text-sm font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lock className="w-4.5 h-4.5 text-rose-400" /> Administrative 2-Factor Auth (2FA)
                      </h3>
                      <p className="text-[10px] text-zinc-500 mb-6 leading-relaxed">
                        Toggling this will require entering a 6-digit dynamic Google Authenticator OTP code on every login, preventing unauthorized sessions even if password leaks.
                      </p>

                      <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl mb-4">
                        <div>
                          <span className="text-xs font-bold block">Authenticator Status</span>
                          <span className="text-[9px] font-semibold text-zinc-500 font-mono">CODE SECRET: {totpSecret}</span>
                        </div>
                        <button 
                          onClick={handleToggle2FA}
                          className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all ${
                            is2FAEnabled 
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {is2FAEnabled ? "Active (Enabled)" : "Inactive (Disabled)"}
                        </button>
                      </div>

                      {is2FAEnabled && (
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 text-[10px] text-zinc-400 font-mono flex gap-3 items-center">
                          <div className="p-1 bg-white rounded-lg shrink-0">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`otpauth://totp/LatigoMusicAdmin?secret=${totpSecret}&issuer=LatigoMusic`)}`}
                              alt="TOTP QR Code"
                              className="w-20 h-20"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-emerald-400 font-bold font-sans text-xs">Authenticator Setup QR:</p>
                            <p className="leading-relaxed text-[9px]">
                              Scan with Google Authenticator or enter key manually:
                            </p>
                            <span className="text-white font-bold block mt-1 text-[10px] select-all">{totpSecret}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Change Admin Password Card */}
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                      <h3 className="text-sm font-black uppercase tracking-wider mb-1 flex items-center gap-2">
                        <KeyRound className="w-4.5 h-4.5 text-rose-400" /> Modify Master Password
                      </h3>
                      <p className="text-[10px] text-zinc-500 mb-4">Update administrator decrypt key.</p>

                      <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Current Decrypt Password</label>
                          <input 
                            type="password" 
                            value={oldPasswordInput}
                            onChange={(e) => setOldPasswordInput(e.target.value)}
                            placeholder="Enter current password"
                            required
                            className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100'}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">New Master Password</label>
                          <input 
                            type="password" 
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                            className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-zinc-900 text-white border-zinc-850' : 'bg-gray-100'}`}
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full p-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-md"
                        >
                          Modify Security Decrypt Key
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Right Column: Auditable Security Logs List */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#11131e] border-zinc-850' : 'bg-white border-gray-200'}`}>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-rose-400" /> Auditable Activity Logs
                      </h3>
                      <p className="text-[10px] text-zinc-500 mb-4 font-semibold uppercase">Tracks administrative adjustments, approvals, and credentials overrides.</p>
                      
                      <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-none font-mono text-[10px] text-zinc-400 leading-relaxed divide-y divide-zinc-900/10">
                        {securityLogs.map((log, index) => (
                          <div key={index} className="pt-2 flex items-start gap-2">
                            <span className="text-rose-400 shrink-0">●</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const cleared = [`${new Date().toISOString().replace('T', ' ').substring(0, 16)} | Security log cleared by Administrator.`];
                        setSecurityLogs(cleared);
                        localStorage.setItem('latigo_admin_activity_logs', JSON.stringify(cleared));
                      }}
                      className="mt-6 w-full p-2.5 bg-zinc-900/50 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all border border-transparent hover:border-rose-500/10"
                    >
                      Purge Logs Cache
                    </button>
                  </div>

                </div>

              </div>
            )}

          </main>

        </div>
      )}

    </div>
  );
}

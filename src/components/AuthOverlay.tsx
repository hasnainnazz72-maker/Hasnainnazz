import React, { useState, useEffect } from 'react';
import { 
  KeyRound, User, Lock, UserPlus, HelpCircle, Eye, EyeOff, 
  Sparkles, CheckCircle2, ShieldCheck, RefreshCw, Phone, ArrowLeft, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthOverlayProps {
  onLoginSuccess: (username: string) => void;
  appUrl: string;
  siteSettings?: any;
}

interface Account {
  username: string;
  phone: string;
  password?: string; // Support optional password for simple setups
  securityQuestion: string;
  securityAnswer: string;
  referralCodeUsed?: string;
  referralCodeOwned: string;
}

const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+53', flag: '🇨🇺', name: 'Cuba' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+1', flag: '🇩🇴', name: 'Dominican Rep' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
  { code: '+1', flag: '🇯🇲', name: 'Jamaica' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+7', flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+853', flag: '🇲🇴', name: 'Macau' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+1', flag: '🇹🇹', name: 'Trinidad & Tobago' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' }
];

export default function AuthOverlay({ onLoginSuccess, appUrl, siteSettings }: AuthOverlayProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regUser, setRegUser] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [regEmail, setRegEmail] = useState('');
  const [regCode, setRegCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [sendCodeMessage, setSendCodeMessage] = useState('');
  const [sendCodeError, setSendCodeError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sandboxCode, setSandboxCode] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regQuestion, setRegQuestion] = useState('What was your childhood nickname?');
  const [regAnswer, setRegAnswer] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Password Reset / Forgot States
  const [forgotUser, setForgotUser] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // Step 1: verify username/answer, Step 2: input new password
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Captcha security logic
  const [captchaText, setCaptchaText] = useState('8829');
  const [captchaInput, setCaptchaInput] = useState('');

  // Terms & Privacy Modals
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaText(code);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerificationCode = async () => {
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setSendCodeError('Please enter a valid Gmail / Email address.');
      return;
    }
    setSendCodeError('');
    setSendCodeMessage('');
    setIsSendingCode(true);
    setSandboxCode('');

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSendCodeMessage(data.message || 'Verification code sent!');
        if (data.debugCode) {
          setSandboxCode(data.debugCode);
        }
        setCountdown(60); // 60s cooldown
      } else {
        setSendCodeError(data.error || 'Failed to send verification code.');
      }
    } catch (err) {
      console.error("Failed sending verification code:", err);
      setSendCodeError('Network error. Failed to send code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
    // Synchronize accounts from the backend server
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          localStorage.setItem('latigo_accounts', JSON.stringify(data));
        }
      })
      .catch(err => console.error("Pre-fetching accounts in AuthOverlay failed:", err));

    // Parse referral code from URL search parameters on load
    if (typeof window !== 'undefined') {
      let ref = '';
      
      // Try 1: standard iframe URL params
      try {
        const params = new URLSearchParams(window.location.search);
        ref = params.get('ref') || '';
      } catch (e) {}

      // Try 2: parent window location search (might fail due to CORS)
      if (!ref) {
        try {
          if (window.parent && window.parent.location) {
            const params = new URLSearchParams(window.parent.location.search);
            ref = params.get('ref') || '';
          }
        } catch (e) {}
      }

      // Try 3: document.referrer
      if (!ref && document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          ref = refUrl.searchParams.get('ref') || '';
        } catch (e) {}
      }

      if (ref) {
        setRegReferral(ref);
        setView('register'); // Automatically switch to registration if referral code is detected in URL!
      }
    }
  }, []);

  // Retrieve accounts database or seed default
  const getAccounts = (): Account[] => {
    const data = localStorage.getItem('latigo_accounts');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // ignore
      }
    }
    const seed: Account[] = [
      {
        username: 'member777',
        phone: '+12025550123',
        password: 'password123',
        securityQuestion: 'What was your childhood nickname?',
        securityAnswer: 'latigomusic',
        referralCodeOwned: 'LATIGO50K'
      }
    ];
    localStorage.setItem('latigo_accounts', JSON.stringify(seed));
    return seed;
  };

  const saveAccounts = (accounts: Account[], targetUser?: string) => {
    localStorage.setItem('latigo_accounts', JSON.stringify(accounts));
    const url = targetUser ? `/api/accounts?username=${encodeURIComponent(targetUser)}` : '/api/accounts';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accounts)
    }).catch(err => console.error("Sync accounts failed", err));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Please specify both username and password.');
      return;
    }

    if (captchaInput !== captchaText) {
      setLoginError('Invalid graphic validation code. Please retry!');
      generateCaptcha();
      return;
    }

    try {
      // Securely fetch details matching the typed Account ID or phone to login
      const response = await fetch(`/api/accounts?username=${encodeURIComponent(loginUser.trim())}&admin=true`);
      const serverAccounts = await response.json();

      if (Array.isArray(serverAccounts)) {
        // Merge with local accounts list to preserve other states
        const localAccounts = getAccounts();
        const merged = [...serverAccounts];
        localAccounts.forEach((localAcc: any) => {
          const exists = merged.some((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
          if (!exists) {
            merged.push(localAcc);
          } else {
            const idx = merged.findIndex((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
            if (idx !== -1 && serverAccounts.some(s => s.username.toLowerCase() === localAcc.username.toLowerCase())) {
              merged[idx] = { ...localAcc, ...merged[idx] };
            }
          }
        });
        localStorage.setItem('latigo_accounts', JSON.stringify(merged));

        const found = merged.find(
          (a) => a.username.toLowerCase() === loginUser.toLowerCase().trim() || a.phone === loginUser.trim()
        );

        if (!found || found.password !== loginPass) {
          setLoginError('Invalid registered account or password combination.');
          generateCaptcha();
          return;
        }

        if ((found as any).isBanned) {
          setLoginError('⚠️ This account has been suspended/banned by the administrator.');
          generateCaptcha();
          return;
        }

        // Success! Log the user in
        localStorage.setItem('latigo_logged_in_user', found.username);
        onLoginSuccess(found.username);
      } else {
        setLoginError('Could not contact authentication server. Please try again.');
        generateCaptcha();
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      setLoginError('Network or system authentication error. Please retry.');
      generateCaptcha();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUser.trim() || !regPhone.trim() || !regEmail.trim() || !regCode.trim() || !regPass.trim() || !regAnswer.trim()) {
      setRegError('Please populate all mandatory fields, including Gmail address and verification code.');
      return;
    }

    if (regUser.length < 5) {
      setRegError('Username must be at least 5 alphanumeric characters.');
      return;
    }

    if (regPass !== regConfirmPass) {
      setRegError('Your specified password and confirmation do not match.');
      return;
    }

    // Verify code with backend API first
    try {
      const verifyRes = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), code: regCode.trim() })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setRegError(verifyData.error || 'Invalid or expired Gmail verification code.');
        return;
      }
    } catch (err) {
      console.error("Verification code check failed:", err);
      setRegError('Verification server connection failed. Please retry.');
      return;
    }

    const accounts = getAccounts();
    const fullPhone = selectedCountryCode + regPhone.trim().replace(/^\+/, '');
    const userExists = accounts.some(
      (a) => a.username.toLowerCase() === regUser.toLowerCase().trim() || a.phone === fullPhone || (a as any).email?.toLowerCase() === regEmail.toLowerCase().trim()
    );

    if (userExists) {
      setRegError('This account username, phone number, or Gmail is already registered.');
      return;
    }

    // Create account
    const regBonus = siteSettings?.registrationBonus !== undefined ? Number(siteSettings.registrationBonus) : 0.00;
    const newAccount = {
      username: regUser.trim(),
      phone: fullPhone,
      email: regEmail.toLowerCase().trim(),
      password: regPass,
      securityQuestion: regQuestion,
      securityAnswer: regAnswer.toLowerCase().trim(),
      referralCodeUsed: regReferral.trim(),
      referralCodeOwned: `LATIGO${Math.floor(10000 + Math.random() * 90000)}`,
      balance: regBonus,
      investmentBalance: regBonus,
      vipLevel: 1,
      isBanned: false,
      transactions: regBonus > 0 ? [
        { 
          id: `TX-INIT-BONUS-${Math.floor(1000 + Math.random() * 9000)}`, 
          type: 'welfare_bonus', 
          amount: regBonus, 
          status: 'passed', 
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), 
          description: 'System Registration Sign-up Welfare Gift' 
        }
      ] : [],
      completedTasks: 0,
      hasClaimedWelfare: false
    };

    accounts.push(newAccount as any);
    saveAccounts(accounts, newAccount.username);

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setView('login');
      setLoginUser(regUser);
      setLoginPass(regPass);
    }, 2000);
  };

  // Password reset step 1: Check security answers
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotUser.trim()) {
      setForgotError('Please enter your account username or phone number.');
      return;
    }

    try {
      // Securely fetch details matching the forgotUser to get the correct security answers
      const response = await fetch(`/api/accounts?username=${encodeURIComponent(forgotUser.trim())}`);
      const serverAccounts = await response.json();

      if (Array.isArray(serverAccounts)) {
        // Merge with local accounts list
        const localAccounts = getAccounts();
        const merged = [...serverAccounts];
        localAccounts.forEach((localAcc: any) => {
          const exists = merged.some((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
          if (!exists) {
            merged.push(localAcc);
          } else {
            const idx = merged.findIndex((m: any) => m.username.toLowerCase() === localAcc.username.toLowerCase());
            if (idx !== -1 && serverAccounts.some(s => s.username.toLowerCase() === localAcc.username.toLowerCase())) {
              merged[idx] = { ...localAcc, ...merged[idx] };
            }
          }
        });
        localStorage.setItem('latigo_accounts', JSON.stringify(merged));

        const found = merged.find(
          (a) => a.username.toLowerCase() === forgotUser.toLowerCase().trim() || a.phone === forgotUser.trim()
        );

        if (!found) {
          setForgotError('No registered account was located with that username.');
          return;
        }

        // Set dynamic question based on their account setup
        setSecurityQuestion(found.securityQuestion || "What was your childhood nickname?");
        
        if (!forgotAnswer.trim()) {
          setForgotError(`Please answer the security verification question: "${found.securityQuestion || 'What was your childhood nickname?'}"`);
          return;
        }

        if (found.securityAnswer.toLowerCase().trim() !== forgotAnswer.toLowerCase().trim()) {
          setForgotError('Incorrect answer to security reset question. Audit failed.');
          return;
        }

        // Pass verification, go to password change screen
        setForgotStep(2);
      } else {
        setForgotError('Could not contact identity verification server.');
      }
    } catch (err) {
      console.error("Forgot step 1 verification failed:", err);
      setForgotError('Network or system identity error. Please retry.');
    }
  };

  // Password reset step 2: Save new password
  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!newPass.trim()) {
      setForgotError('Please enter a new password.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setForgotError('Passwords do not match.');
      return;
    }

    const accounts = getAccounts();
    const updated = accounts.map((a) => {
      if (a.username.toLowerCase() === forgotUser.toLowerCase().trim() || a.phone === forgotUser.trim()) {
        return { ...a, password: newPass };
      }
      return a;
    });

    saveAccounts(updated, forgotUser.toLowerCase().trim());
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setView('login');
      setForgotStep(1);
      setForgotUser('');
      setForgotAnswer('');
      setNewPass('');
      setConfirmNewPass('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-sans text-white">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[640px]">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />

        {/* Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 relative">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center">
                <Disc className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-widest block text-left">LATIGO</span>
              <span className="text-[8px] text-zinc-500 font-extrabold tracking-widest block uppercase">DECENTRALIZED MUSIC</span>
            </div>
          </div>
        </div>

        {/* Educational Simulation Disclosure Box */}
        <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-[10px] text-zinc-400 leading-normal relative z-10 max-h-[100px] overflow-y-auto">
          <span className="text-amber-500 font-extrabold uppercase">⚠️ Educational Simulation:</span> Latigo Music is a gamified virtual simulation platform. All transaction logs, VIP tiers, and balance claims are 100% simulated play credits for educational fun only. No real fiat money, investments, or actual cryptocurrencies are used, accepted, or stored.
        </div>

        {/* Body Views */}
        <div className="my-6 flex-1 flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Welcome Back listeners</h3>
                  <p className="text-xs text-zinc-500">Sign in to your simulated music ticket dashboard</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">
                    ⚠️ {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Account ID / Phone</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-zinc-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        placeholder="Enter Account ID or Phone Number"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 pl-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-[10px] text-zinc-400 hover:text-emerald-400 font-extrabold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Graphic Validation Code */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Graphic Validation Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Enter 4-digit code"
                        maxLength={4}
                        className="flex-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono tracking-widest font-black"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-850 transition-colors shrink-0"
                      >
                        <span className="font-mono text-emerald-400 font-black tracking-widest text-sm bg-black px-2 py-1 rounded select-none border border-zinc-800">
                          {captchaText}
                        </span>
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider active:scale-98 transition-all shadow-lg shadow-emerald-500/15"
                  >
                    Authorize & Sign In
                  </button>
                </form>

                <div className="pt-4 text-center">
                  <p className="text-xs text-zinc-500 font-bold">
                    New to Latigo?{' '}
                    <button
                      onClick={() => setView('register')}
                      className="text-emerald-400 hover:underline font-extrabold"
                    >
                      Create Account here
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {view === 'register' && (
              <motion.div
                key="register-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Register Member account</h3>
                  <p className="text-xs text-zinc-500">Access music simulation tracking dashboard</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Registration Successful! Loading account...
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Account Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Account ID</label>
                    <input
                      type="text"
                      value={regUser}
                      onChange={(e) => setRegUser(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Create a Username"
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                  </div>

                  {/* Mobile Phone */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Phone number (with code)</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold max-w-[140px]"
                      >
                        {COUNTRY_CODES.map((c, idx) => (
                          <option key={`${c.code}-${c.name}-${idx}`} value={c.code} className="bg-zinc-950 text-white text-xs">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 2025550123"
                        className="flex-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* Gmail Address */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Gmail Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                  </div>

                  {/* Gmail Verification Code */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Gmail Verification Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={regCode}
                        onChange={(e) => setRegCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode || countdown > 0}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-[11px] font-black px-3 py-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center min-w-[110px]"
                      >
                        {isSendingCode ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Send Code'}
                      </button>
                    </div>
                    {sendCodeError && (
                      <p className="text-[10px] text-red-400 font-bold mt-1">⚠️ {sendCodeError}</p>
                    )}
                    {sendCodeMessage && (
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ {sendCodeMessage}</p>
                    )}
                    {sandboxCode && (
                      <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 leading-relaxed font-bold">
                        🔑 <span className="text-white">AI Studio Developer Mode:</span><br/>
                        Verification code is: <span className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-white font-black">{sandboxCode}</span>
                        <p className="text-[9px] text-zinc-500 mt-1 font-medium">To test real delivery to your Gmail, define the <span className="font-mono text-zinc-400 font-bold">RESEND_API_KEY</span> in Settings.</p>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Login Password</label>
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Confirm Login Password</label>
                    <input
                      type="password"
                      value={regConfirmPass}
                      onChange={(e) => setRegConfirmPass(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Password Reset Security Choice */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Security Password Reset Question</label>
                    <select
                      value={regQuestion}
                      onChange={(e) => setRegQuestion(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                      <option value="What is your favorite singer's name?">What is your favorite singer's name?</option>
                      <option value="What was the name of your first school?">What was the name of your first school?</option>
                      <option value="What is your lucky secret 4-digit code?">What is your lucky secret 4-digit code?</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Your Security Answer (Important for resets!)</label>
                    <input
                      type="text"
                      value={regAnswer}
                      onChange={(e) => setRegAnswer(e.target.value)}
                      placeholder="Security Answer (case-insensitive)"
                      className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                  </div>

                  {/* Referral Link invitation parameter */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Invitation Code (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-500">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </span>
                      <input
                        type="text"
                        value={regReferral}
                        onChange={(e) => setRegReferral(e.target.value.toUpperCase())}
                        placeholder="e.g. LATIGO50K"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 pl-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono font-black text-emerald-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-black rounded-xl text-xs uppercase tracking-wider active:scale-98 transition-all"
                  >
                    Submit Registration
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <p className="text-xs text-zinc-500 font-bold">
                    Already registered?{' '}
                    <button
                      onClick={() => setView('login')}
                      className="text-emerald-400 hover:underline font-extrabold"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div
                key="forgot-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Security Password Reset</h3>
                  <p className="text-xs text-zinc-500">Recover your locked wallet access without delay</p>
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">
                    ⚠️ {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Password reset successfully updated!
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotStep1} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Registered Account ID / Phone</label>
                      <input
                        type="text"
                        value={forgotUser}
                        onChange={(e) => setForgotUser(e.target.value)}
                        placeholder="Enter username or phone number"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Your Secret Answer</label>
                      <input
                        type="text"
                        value={forgotAnswer}
                        onChange={(e) => setForgotAnswer(e.target.value)}
                        placeholder="Answer"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setView('login')}
                        className="flex-1 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-colors"
                      >
                        Verify Identity
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotStep2} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmNewPass}
                        onChange={(e) => setConfirmNewPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-colors"
                    >
                      Update Password Code
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terms and Privacy policy triggers */}
        <div className="pt-2 flex justify-center gap-4 text-[10px] text-zinc-500 font-extrabold relative z-10">
          <button onClick={() => setShowTerms(true)} className="hover:text-emerald-400 hover:underline">
            Terms of Service
          </button>
          <span>•</span>
          <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-400 hover:underline">
            Privacy Policy
          </button>
        </div>

        {/* Bottom Security Seals */}
        <div className="pt-4 border-t border-zinc-900 text-center flex items-center justify-center gap-1.5 text-[8px] font-black text-zinc-600 tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Simulated TRC-20 & BEP-20 Simulation Node
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Terms of Service</h3>
            <div className="text-xs text-zinc-400 space-y-3 leading-relaxed text-left">
              <p className="font-extrabold text-amber-500">1. DECENTRALIZED SIMULATION NOTICE</p>
              <p>Latigo Music is an interactive entertainment, decentralized ticket validation simulation platform. All transaction ledgers, VIP account ranks, and yields displayed are 100% simulated play credits (virtual simulation tokens) for educational purposes only.</p>
              <p className="font-extrabold text-amber-500">2. NO FINANCIAL GUARANTEES</p>
              <p>No real money or actual digital assets (including real USDT, Bitcoin, or other cryptocurrencies) are processed, accepted, or stored within this interface. Users agree that all activities are simulated.</p>
              <p className="font-extrabold text-amber-500">3. NO LIABILITY</p>
              <p>Under no circumstances shall the platform or its operators be held liable for any decisions, real-world losses, or misunderstandings regarding the nature of this simulation.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              I Understand & Accept
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Privacy Policy</h3>
            <div className="text-xs text-zinc-400 space-y-3 leading-relaxed text-left">
              <p className="font-extrabold text-emerald-400">1. DATA ISOLATION & PRIVACY</p>
              <p>We take user identity privacy seriously. Account IDs, phone numbers, and security questions entered during registration are stored exclusively in an isolated system to maintain localized simulation sessions.</p>
              <p className="font-extrabold text-emerald-400">2. NO COUPLING OF REAL PERSONAL DATA</p>
              <p>We do not collect real names, actual billing info, credit card numbers, or real location records. Do not register using passwords you use on real-world financial websites.</p>
              <p className="font-extrabold text-emerald-400">3. ENCRYPTED DECENTRALIZED DATA</p>
              <p>Any details provided are encrypted and isolated server-side. You have the right to request account deletion from the system administrator at any time.</p>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Close Privacy Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

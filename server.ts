import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { Firestore } from '@google-cloud/firestore';

dotenv.config();

let db: Firestore | null = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    db = new Firestore({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId
    });
    console.log(`[Firestore] Initialized securely targeting DB ${config.firestoreDatabaseId} in project ${config.projectId}`);
  } else {
    console.warn("[Firestore] No firebase-applet-config.json found. Falling back to local file storage.");
  }
} catch (e) {
  console.error("[Firestore] Failed to initialize Firestore:", e);
}

const app = express();
const PORT = 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: { maxAge: 15552000, includeSubDomains: true },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());

const SETTINGS_FILE = path.join(process.cwd(), 'data-settings.json');
const ACCOUNTS_FILE = path.join(process.cwd(), 'data-accounts.json');

// Memory cache for Gmail Verification Codes
const verificationCodes = new Map<string, { code: string; expires: number }>();

const DEFAULT_SETTINGS = {
  siteName: "Latigo Music",
  logoEmoji: "🎵",
  logoText: "LATIGO MUSIC",
  supportTelegram: "https://t.me/latigo_music_official",
  supportWhatsApp: "+1234567890",
  minWithdrawal: 15.00,
  welfareReward: 0.10,
  registrationBonus: 0.00,
  trc20Address: "TETttTRj6ZX5gAm79RgDgDm6WHeMrnDjdy",
  bep20Address: "0xbd63907b714a667f5052c432cdc4ad3dc0d73658",
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
  publicUrl: "https://h5latigo-music.ai.studio",
  vipPlans: [
    { level: 1, name: "VIP 1", minDeposit: 50, dailyRate: 0.026, dailyTasksLimit: 20, description: "Daily income 2.6%. Every day buy tickets and earn compound profit." },
    { level: 2, name: "VIP 2", minDeposit: 500, dailyRate: 0.027, dailyTasksLimit: 30, description: "Daily income 2.7%. Every day buy tickets and earn compound profit." },
    { level: 3, name: "VIP 3", minDeposit: 2000, dailyRate: 0.030, dailyTasksLimit: 40, description: "Daily income 3.0%. Every day buy music tickets and earn compound profit." },
    { level: 4, name: "VIP 4", minDeposit: 4000, dailyRate: 0.035, dailyTasksLimit: 50, description: "Daily income 3.5%. Everyday buy music tickets and earn compound profit." }
  ]
};

const DEFAULT_ACCOUNTS = [
  { 
    username: 'member777', 
    phone: '+12025550123', 
    password: 'password123', 
    securityQuestion: 'What was your childhood nickname?', 
    securityAnswer: 'latigomusic', 
    referralCodeOwned: 'LATIGO50K', 
    balance: 0.00, 
    vipLevel: 1, 
    isBanned: false, 
    transactions: [
      { id: 'R240402101328MXIgo', type: 'withdraw', amount: 39.00, status: 'passed', timestamp: '2026-04-02 10:13', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R240401074239MKbmm', type: 'withdraw', amount: 24.00, status: 'cancelled', timestamp: '2026-04-01 07:42', description: 'Incomplete TRC-20 Blockchain confirmations' },
      { id: 'R2403291103019WLxn', type: 'withdraw', amount: 28.00, status: 'passed', timestamp: '2026-03-29 12:03', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R240327133157iqGx4', type: 'withdraw', amount: 42.00, status: 'passed', timestamp: '2026-03-27 14:31', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R2403242340228tbSb', type: 'withdraw', amount: 100.00, status: 'passed', timestamp: '2026-03-25 00:40', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R240322162957EmkCT', type: 'withdraw', amount: 58.00, status: 'passed', timestamp: '2026-03-22 17:29', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R240320101313nnZOS', type: 'withdraw', amount: 29.00, status: 'passed', timestamp: '2026-03-20 11:13', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
      { id: 'R240318083424tcDoN', type: 'withdraw', amount: 16.00, status: 'passed', timestamp: '2026-03-18 09:34', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' }
    ], 
    completedTasks: 0, 
    hasClaimedWelfare: false 
  },
  { username: 'music_listener', phone: '+12025550100', password: 'user123', balance: 155.40, vipLevel: 2, registrationDate: '2026-04-01 12:00', isBanned: false, referralCodeOwned: 'MUSIC777', completedTasks: 12, transactions: [], hasClaimedWelfare: false },
  { username: 'john_doe', phone: '+14155552671', password: 'password123', balance: 45.00, vipLevel: 1, registrationDate: '2026-04-03 09:30', isBanned: false, referralCodeOwned: 'JD999', completedTasks: 5, transactions: [], hasClaimedWelfare: false },
  { username: 'kashif_officer', phone: '+13125550190', password: 'kashif999', balance: 2500.00, vipLevel: 3, registrationDate: '2026-03-29 16:15', isBanned: false, referralCodeOwned: 'KASH92', completedTasks: 42, transactions: [], hasClaimedWelfare: false },
  { username: 'spammer_account', phone: '+12125550112', password: 'spam', balance: 0.00, vipLevel: 1, registrationDate: '2026-04-05 14:10', isBanned: true, referralCodeOwned: 'SPAM1', completedTasks: 0, transactions: [], hasClaimedWelfare: false }
];

function getLocalSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (parsed.trc20Address === "TMLatigoMusicOfficialTRC20AddressXYZ777") {
        parsed.trc20Address = DEFAULT_SETTINGS.trc20Address;
        updated = true;
      }
      if (parsed.bep20Address === "0x8922LatigoMusicOfficialBEP20AddressUSDT777") {
        parsed.bep20Address = DEFAULT_SETTINGS.bep20Address;
        updated = true;
      }
      if (!parsed.vipPlans) {
        parsed.vipPlans = DEFAULT_SETTINGS.vipPlans;
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    } catch (e) {
      console.error("Error reading settings file, resetting defaults", e);
    }
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  return DEFAULT_SETTINGS;
}

async function getSettings() {
  if (!db) {
    return getLocalSettings();
  }
  try {
    const doc = await db.collection('settings').doc('global').get();
    if (!doc.exists) {
      console.log("[Firestore] Global settings not found, seeding default settings.");
      const settings = getLocalSettings();
      await db.collection('settings').doc('global').set(settings);
      return settings;
    }
    const parsed = doc.data();
    let updated = false;
    if (parsed.trc20Address === "TMLatigoMusicOfficialTRC20AddressXYZ777") {
      parsed.trc20Address = DEFAULT_SETTINGS.trc20Address;
      updated = true;
    }
    if (parsed.bep20Address === "0x8922LatigoMusicOfficialBEP20AddressUSDT777") {
      parsed.bep20Address = DEFAULT_SETTINGS.bep20Address;
      updated = true;
    }
    if (!parsed.vipPlans) {
      parsed.vipPlans = DEFAULT_SETTINGS.vipPlans;
      updated = true;
    }
    if (updated) {
      await db.collection('settings').doc('global').set(parsed);
    }
    return parsed;
  } catch (err) {
    console.error("[Firestore] Error reading settings from firestore:", err);
    return getLocalSettings();
  }
}

async function saveSettings(settings: any) {
  let current;
  try {
    current = db ? (await db.collection('settings').doc('global').get()).data() : null;
  } catch (e) {
    // ignore
  }
  if (!current) {
    current = getLocalSettings();
  }
  
  const trc = settings?.trc20Address;
  const bep = settings?.bep20Address;
  
  const finalizedSettings = {
    ...settings,
    trc20Address: (typeof trc === 'string' && trc.trim()) ? trc.trim() : (current?.trc20Address || DEFAULT_SETTINGS.trc20Address),
    bep20Address: (typeof bep === 'string' && bep.trim()) ? bep.trim() : (current?.bep20Address || DEFAULT_SETTINGS.bep20Address)
  };

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(finalizedSettings, null, 2), 'utf-8');

  if (db) {
    try {
      await db.collection('settings').doc('global').set(finalizedSettings);
      console.log("[Firestore] Successfully saved settings.");
    } catch (err) {
      console.error("[Firestore] Error saving settings to Firestore:", err);
    }
  }
}

function getLocalAccounts() {
  if (fs.existsSync(ACCOUNTS_FILE)) {
    try {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      const accounts = JSON.parse(data);
      if (Array.isArray(accounts)) {
        return accounts.map((acc: any) => {
          const v = acc.vipLevel !== undefined ? Number(acc.vipLevel) : (acc.vip !== undefined ? Number(acc.vip) : 1);
          let txs = acc.transactions || [];
          if (acc.username.toLowerCase() === 'member777' && txs.length === 0) {
            txs = [
              { id: 'R240402101328MXIgo', type: 'withdraw', amount: 39.00, status: 'passed', timestamp: '2026-04-02 10:13', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R240401074239MKbmm', type: 'withdraw', amount: 24.00, status: 'cancelled', timestamp: '2026-04-01 07:42', description: 'Incomplete TRC-20 Blockchain confirmations' },
              { id: 'R2403291103019WLxn', type: 'withdraw', amount: 28.00, status: 'passed', timestamp: '2026-03-29 12:03', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R240327133157iqGx4', type: 'withdraw', amount: 42.00, status: 'passed', timestamp: '2026-03-27 14:31', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R2403242340228tbSb', type: 'withdraw', amount: 100.00, status: 'passed', timestamp: '2026-03-25 00:40', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R240322162957EmkCT', type: 'withdraw', amount: 58.00, status: 'passed', timestamp: '2026-03-22 17:29', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R240320101313nnZOS', type: 'withdraw', amount: 29.00, status: 'passed', timestamp: '2026-03-20 11:13', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' },
              { id: 'R240318083424tcDoN', type: 'withdraw', amount: 16.00, status: 'passed', timestamp: '2026-03-18 09:34', description: 'Withdrawal to USDT-TRC20 WalletTYFpG...' }
            ];
          }
          return {
            ...acc,
            vipLevel: v,
            vip: v,
            transactions: txs,
            investmentBalance: acc.investmentBalance !== undefined ? Number(acc.investmentBalance) : Number(acc.balance || 0)
          };
        });
      }
    } catch (e) {
      console.error("Error reading accounts file, resetting defaults", e);
    }
  }
  const defaults = DEFAULT_ACCOUNTS.map((acc: any) => {
    const v = acc.vipLevel !== undefined ? Number(acc.vipLevel) : (acc.vip !== undefined ? Number(acc.vip) : 1);
    return {
      ...acc,
      vipLevel: v,
      vip: v,
      investmentBalance: Number(acc.balance || 0)
    };
  });
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
  return defaults;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean;
  }
  return obj;
}

async function runDatabaseAuditAndRestore() {
  if (!db) {
    console.log("[Audit] Firestore database is not initialized. Skipping self-repair audit.");
    return;
  }
  try {
    console.log("[Audit] Initiating comprehensive database integrity self-repair audit...");
    const snapshot = await db.collection('accounts').get();
    if (snapshot.empty) {
      console.log("[Audit] No accounts found to audit.");
      return;
    }
    
    let restoredCount = 0;
    
    for (const doc of snapshot.docs) {
      const user = doc.data() as any;
      const username = user.username;
      if (!username) continue;
      
      const transactions = user.transactions || [];
      
      // Calculate correct balance based on transactions
      let calculatedBalance = 0;
      let hasTransactions = false;
      
      for (const tx of transactions) {
        if (!tx.amount || !tx.status) continue;
        const amount = Number(tx.amount);
        if (isNaN(amount)) continue;
        
        if (tx.type === 'recharge' && tx.status === 'passed') {
          calculatedBalance += amount;
          hasTransactions = true;
        } else if (tx.type === 'withdraw' && (tx.status === 'passed' || tx.status === 'pending')) {
          calculatedBalance -= amount;
          hasTransactions = true;
        } else if (tx.type === 'vip_upgrade' && tx.status === 'passed') {
          calculatedBalance -= amount;
          hasTransactions = true;
        } else if (tx.type === 'task_commission' && tx.status === 'passed') {
          calculatedBalance += amount;
          hasTransactions = true;
        } else if (tx.type === 'referral_commission' && tx.status === 'passed') {
          calculatedBalance += amount;
          hasTransactions = true;
        } else if (tx.type === 'welfare_bonus' && tx.status === 'passed') {
          calculatedBalance += amount;
          hasTransactions = true;
        }
      }
      
      calculatedBalance = Number(calculatedBalance.toFixed(4));
      
      if (calculatedBalance > 0 && user.balance === 0) {
        console.log(`[Audit] CRITICAL: Identified zeroed account for user: "${username}". Database balance: 0. Calculated expected balance: $${calculatedBalance}. Restoring account balance...`);
        user.balance = calculatedBalance;
        user.investmentBalance = calculatedBalance;
        
        await db.collection('accounts').doc(username.toLowerCase()).set(sanitizeForFirestore(user));
        console.log(`[Audit] Success: Restored balance and investmentBalance to $${calculatedBalance} for "${username}" in Firestore.`);
        restoredCount++;
      } else {
        // Even if they are not 0, make sure investmentBalance is kept in sync with balance for compound growth
        if (user.investmentBalance !== user.balance) {
          console.log(`[Audit] Aligning investmentBalance (${user.investmentBalance}) with balance (${user.balance}) for user: "${username}"`);
          user.investmentBalance = user.balance;
          await db.collection('accounts').doc(username.toLowerCase()).set(sanitizeForFirestore(user));
        }
      }
    }
    
    console.log(`[Audit] Self-repair audit completed successfully. Total accounts restored: ${restoredCount}`);
  } catch (err) {
    console.error("[Audit] Error during self-repair database audit:", err);
  }
}

// Trigger audit asynchronously on startup
setTimeout(() => {
  runDatabaseAuditAndRestore().catch(err => {
    console.error("[Audit] Startup database audit crashed:", err);
  });
}, 2000);

async function getAccounts() {
  if (!db) {
    return getLocalAccounts();
  }
  try {
    const snapshot = await db.collection('accounts').get();
    if (snapshot.empty) {
      console.log("[Firestore] No accounts found, seeding defaults.");
      const defaults = getLocalAccounts();
      const batch = db.batch();
      for (const acc of defaults) {
        const docRef = db.collection('accounts').doc(acc.username.toLowerCase());
        batch.set(docRef, sanitizeForFirestore(acc));
      }
      await batch.commit();
      return defaults;
    }
    const accounts: any[] = [];
    snapshot.forEach((doc: any) => {
      const acc = doc.data();
      const v = acc.vipLevel !== undefined ? Number(acc.vipLevel) : (acc.vip !== undefined ? Number(acc.vip) : 1);
      const txs = acc.transactions || [];
      accounts.push({
        ...acc,
        vipLevel: v,
        vip: v,
        transactions: txs,
        investmentBalance: acc.investmentBalance !== undefined ? Number(acc.investmentBalance) : Number(acc.balance || 0)
      });
    });
    return accounts;
  } catch (err) {
    console.error("[Firestore] Error reading accounts from database:", err);
    throw err; // Stop and propagate error to prevent empty/stale default fallbacks
  }
}

async function saveAccounts(accounts: any[]) {
  // Always save locally as backup/cache
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');

  if (!db) return;

  try {
    // Save in chunks of 400 to be safely under the 500 batch limit
    const chunkSize = 400;
    for (let i = 0; i < accounts.length; i += chunkSize) {
      const chunk = accounts.slice(i, i + chunkSize);
      const batch = db.batch();
      for (const acc of chunk) {
        const docRef = db.collection('accounts').doc(acc.username.toLowerCase());
        batch.set(docRef, sanitizeForFirestore(acc));
      }
      await batch.commit();
    }
    console.log(`[Firestore] Successfully saved/merged ${accounts.length} accounts.`);
  } catch (err) {
    console.error("[Firestore] Error saving accounts:", err);
    throw err; // Rethrow to let API routes return proper 500 errors
  }
}

// API Routes
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Please enter a valid Gmail / Email address." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    verificationCodes.set(email.toLowerCase().trim(), { code, expires });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Latigo Music <onboarding@resend.dev>',
            to: email.trim(),
            subject: `${code} is your Latigo Music verification code`,
            html: `
              <div style="font-family: sans-serif; padding: 24px; background-color: #09090b; color: #ffffff; border-radius: 16px; max-width: 480px; border: 1px solid #18181b; margin: 0 auto;">
                <h2 style="color: #10b981; margin-bottom: 8px; font-weight: 900; letter-spacing: 0.05em; font-size: 20px;">LATIGO MUSIC</h2>
                <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">Welcome to Latigo Music. Your one-time registration security code is provided below.</p>
                <div style="background-color: #18181b; padding: 18px; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px; text-align: center; color: #10b981; margin: 24px 0; border: 1px solid #27272a; font-family: monospace;">
                  ${code}
                </div>
                <p style="font-size: 11px; color: #71717a; line-height: 1.4;">This security code will expire in 10 minutes. If you did not initiate this request, please secure your account immediately.</p>
              </div>
            `
          })
        });

        if (response.ok) {
          return res.json({ success: true, message: "Verification code successfully sent to your Gmail inbox!" });
        } else {
          const errText = await response.text();
          console.error("Resend API response error:", errText);
          return res.json({
            success: true,
            message: "Gmail API is not configured. Sandbox simulation active.",
            debugCode: code
          });
        }
      } catch (err) {
        console.error("Failed to fetch Resend API:", err);
        return res.json({
          success: true,
          message: "Gmail SMTP failed. Sandbox simulation active.",
          debugCode: code
        });
      }
    } else {
      // In sandbox mode without RESEND_API_KEY, return the code for testing
      return res.json({
        success: true,
        message: "Sandbox Mode: Code generated successfully.",
        debugCode: code
      });
    }
  } catch (error) {
    console.error("Failed to generate verification code:", error);
    res.status(500).json({ error: "Internal server error occurred when generating code." });
  }
});

app.post('/api/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const record = verificationCodes.get(email.toLowerCase().trim());
    if (!record) {
      return res.status(400).json({ error: "Please click 'Send Code' first to request a verification code." });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ error: "This verification code has expired. Please request a new code." });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: "Incorrect verification code. Please check your Gmail." });
    }

    // Code matches, we can clear it or let it remain valid for subsequent registration requests
    res.json({ success: true, message: "Gmail verified successfully!" });
  } catch (error) {
    console.error("Failed to verify code:", error);
    res.status(500).json({ error: "Internal error checking verification code." });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to read site settings" });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await saveSettings(settings);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to save site settings" });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await getAccounts();
    const isAdmin = req.query.admin === 'true';
    const clientUser = req.query.username ? String(req.query.username).toLowerCase() : null;

    if (isAdmin) {
      // Admin gets full, unsanitized accounts
      return res.json(accounts);
    }

    // Sanitize for client view to protect user privacy and enforce data isolation
    const sanitized = accounts.map((acc: any) => {
      const isMe = clientUser && (acc.username.toLowerCase() === clientUser || (acc.phone && acc.phone.trim() === clientUser));
      
      if (isMe) {
        // Logged-in user gets their own full details
        return acc;
      } else {
        // Other users are sanitized for privacy and security.
        // We strip passwords, security questions/answers, emails, and full transactions logs.
        // We preserve only passed recharge details so team commission totals continue to work.
        const passedRecharges = (acc.transactions || []).filter((t: any) => t.type === 'recharge' && t.status === 'passed');
        
        return {
          username: acc.username,
          phone: acc.phone ? acc.phone.substring(0, 5) + '***' + acc.phone.substring(Math.max(5, acc.phone.length - 2)) : '',
          referralCodeUsed: acc.referralCodeUsed,
          referralCodeOwned: acc.referralCodeOwned,
          registrationDate: acc.registrationDate,
          balance: acc.balance,
          vipLevel: acc.vipLevel,
          vip: acc.vip,
          completedTasks: acc.completedTasks,
          hasClaimedWelfare: acc.hasClaimedWelfare,
          transactions: passedRecharges.map((t: any) => ({
            id: t.id,
            type: 'recharge',
            amount: t.amount,
            status: 'passed'
          }))
        };
      }
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: "Failed to read accounts database" });
  }
});

async function validateAndProcessAccounts(incomingAccounts: any[], currentAccounts: any[], isAdmin: boolean, settings: any, targetUsername: string | null = null) {
  const welfareLimit = settings?.welfareReward !== undefined ? Number(settings.welfareReward) : 1.50;
  const regBonus = settings?.registrationBonus !== undefined ? Number(settings.registrationBonus) : 0.00;

  // Clone currentAccounts to preserve all users currently in the server database
  let resultAccounts = [...currentAccounts];

  if (isAdmin) {
    // Admin has full control, update existing or insert new ones.
    for (const incomingAcc of incomingAccounts) {
      // If a specific targetUsername is being edited/approved, only update that user and skip all others
      // to completely prevent stale admin-panel caches from overwriting newer server-side states.
      if (targetUsername && incomingAcc.username.toLowerCase() !== targetUsername.toLowerCase()) {
        continue;
      }
      const idx = resultAccounts.findIndex(a => a.username.toLowerCase() === incomingAcc.username.toLowerCase());
      const v = incomingAcc.vipLevel !== undefined ? Number(incomingAcc.vipLevel) : (incomingAcc.vip !== undefined ? Number(incomingAcc.vip) : 1);
      if (idx !== -1) {
        // Protect final transaction statuses (passed/cancelled) from being reverted to pending,
        // even if incoming admin data is stale due to polling/sync delays.
        const oldTxs = resultAccounts[idx].transactions || [];
        const incomingTxs = incomingAcc.transactions || [];
        const protectedTxs = incomingTxs.map((incTx: any) => {
          const oldTx = oldTxs.find((t: any) => t.id === incTx.id);
          if (oldTx && (oldTx.status === 'passed' || oldTx.status === 'cancelled')) {
            if (incTx.status === 'pending') {
              console.warn(`[Sync-Admin] Safely preserved final status of ${incTx.id} as ${oldTx.status} (prevented reversion to pending)`);
              return { ...incTx, status: oldTx.status };
            }
          }
          return incTx;
        });

        resultAccounts[idx] = {
          ...resultAccounts[idx],
          ...incomingAcc,
          password: incomingAcc.password || resultAccounts[idx].password,
          securityQuestion: incomingAcc.securityQuestion || resultAccounts[idx].securityQuestion,
          securityAnswer: incomingAcc.securityAnswer || resultAccounts[idx].securityAnswer,
          vipLevel: v,
          vip: v,
          investmentBalance: incomingAcc.investmentBalance !== undefined ? Number(incomingAcc.investmentBalance) : Number(incomingAcc.balance || 0),
          transactions: protectedTxs
        };
      } else {
        resultAccounts.push({
          ...incomingAcc,
          vipLevel: v,
          vip: v,
          investmentBalance: incomingAcc.investmentBalance !== undefined ? Number(incomingAcc.investmentBalance) : Number(incomingAcc.balance || 0)
        });
      }
    }
    return resultAccounts;
  }

  // Non-admin updates (e.g. registration, task completion, etc.)
  for (const incomingAcc of incomingAccounts) {
    // SECURITY: Non-admin can ONLY register or modify their own targetUsername.
    // If targetUsername is specified and this incoming account is not that user, discard it!
    if (targetUsername && incomingAcc.username.toLowerCase() !== targetUsername.toLowerCase()) {
      continue;
    }

    let idx = resultAccounts.findIndex(a => a.username.toLowerCase() === incomingAcc.username.toLowerCase());
    
    if (idx === -1 && db) {
      try {
        const doc = await db.collection('accounts').doc(incomingAcc.username.toLowerCase()).get();
        if (doc.exists) {
          const dbAcc = doc.data() as any;
          const v = dbAcc.vipLevel !== undefined ? Number(dbAcc.vipLevel) : (dbAcc.vip !== undefined ? Number(dbAcc.vip) : 1);
          const dbAccNormalized = {
            ...dbAcc,
            vipLevel: v,
            vip: v,
            transactions: dbAcc.transactions || [],
            investmentBalance: dbAcc.investmentBalance !== undefined ? Number(dbAcc.investmentBalance) : Number(dbAcc.balance || 0)
          };
          resultAccounts.push(dbAccNormalized);
          idx = resultAccounts.length - 1;
          console.log(`[Sync-DirectCheck] Recovered user ${incomingAcc.username} directly from Firestore. Prevented brand-new registration overwrite.`);
        }
      } catch (err) {
        console.error(`[Sync-DirectCheck] Direct document fetch failed during sync for ${incomingAcc.username}:`, err);
        throw new Error(`Database connection failed while validating account "${incomingAcc.username}". Sync aborted to protect user balance.`);
      }
    }
    
    if (idx === -1) {
      // New account registration
      const initialBal = regBonus;
      const initialVip = 1; // Default starting VIP is 1
      
      // Filter transactions to only allow registration bonus if it matches settings
      let transactions: any[] = [];
      if (initialBal > 0) {
        transactions = (incomingAcc.transactions || []).filter((t: any) => t.type === 'welfare_bonus' && t.amount <= initialBal);
        if (transactions.length === 0) {
          transactions = [
            {
              id: `TX-INIT-BONUS-${Math.floor(1000 + Math.random() * 9000)}`,
              type: 'welfare_bonus',
              amount: initialBal,
              status: 'passed',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              description: 'System Registration Sign-up Welfare Gift'
            }
          ];
        }
      }

      resultAccounts.push({
        ...incomingAcc,
        balance: initialBal,
        investmentBalance: initialBal,
        vipLevel: initialVip,
        vip: initialVip,
        isBanned: false,
        transactions,
        completedTasks: 0,
        hasClaimedWelfare: false
      });
    } else {
      // Existing account update
      const oldAcc = resultAccounts[idx];
      const isBanned = oldAcc.isBanned;
      let finalBalance = oldAcc.balance;
      let finalVipLevel = oldAcc.vipLevel;
      const todayStr = new Date().toISOString().substring(0, 10);
      let finalLastProfitPayoutDate = oldAcc.lastProfitPayoutDate || incomingAcc.lastProfitPayoutDate || todayStr;
      let finalCompletedTasks = oldAcc.completedTasks !== undefined ? oldAcc.completedTasks : (incomingAcc.completedTasks || 0);
      let finalHasClaimedWelfare = oldAcc.hasClaimedWelfare !== undefined ? oldAcc.hasClaimedWelfare : (incomingAcc.hasClaimedWelfare || false);
      if (finalLastProfitPayoutDate !== todayStr) {
        finalHasClaimedWelfare = false;
        finalLastProfitPayoutDate = todayStr;
        finalCompletedTasks = 0;
      }
      let finalInvestmentBalance = oldAcc.investmentBalance !== undefined ? Number(oldAcc.investmentBalance) : finalBalance;

      const oldTxIds = new Set((oldAcc.transactions || []).map((t: any) => t.id));
      const oldTxs = oldAcc.transactions || [];
      
      let sanitizedTxs = [...oldTxs];
      const incomingTxs = incomingAcc.transactions || [];
      const newTxs = incomingTxs.filter((t: any) => !oldTxIds.has(t.id));

      // Handle existing transactions that changed status
      sanitizedTxs = sanitizedTxs.map((oldTx: any) => {
        const incTx = incomingTxs.find((t: any) => t.id === oldTx.id);
        if (!incTx) return oldTx;

        if (oldTx.status !== incTx.status) {
          // Rule 1: Once a transaction is finalized (passed or cancelled), it can never revert or change
          if (oldTx.status === 'passed' || oldTx.status === 'cancelled') {
            console.warn(`[Security] Non-admin tried to transition finalized transaction ${oldTx.id} from ${oldTx.status} to ${incTx.status}`);
            return oldTx;
          }
          // Rule 2: Non-admin can never modify any recharge/withdrawal status
          if (oldTx.type === 'recharge' || oldTx.type === 'withdraw') {
            console.warn(`[Security] Non-admin tried to transition transaction ${oldTx.id} from ${oldTx.status} to ${incTx.status}`);
            return oldTx;
          }
        }
        return incTx;
      });

      // Process new transactions
      for (const tx of newTxs) {
        if (!tx.id || !tx.type) continue;

        if (tx.type === 'task_commission') {
          const oldInvestment = oldAcc.investmentBalance !== undefined ? Number(oldAcc.investmentBalance) : Number(oldAcc.balance || 0);
          if (oldAcc.vipLevel >= 1 && oldInvestment >= 50) {
            sanitizedTxs.unshift(tx);
            finalBalance += tx.amount;
          } else {
            console.warn(`[Security] Rejected task commission of $${tx.amount} for user ${incomingAcc.username} (VIP: ${oldAcc.vipLevel}, Investment: ${oldInvestment})`);
            const rejectedTx = { 
              ...tx, 
              status: 'cancelled', 
              description: `REJECTED: Earning requirements not met (Active VIP1 and minimum $50 active investment balance required)` 
            };
            sanitizedTxs.unshift(rejectedTx);
          }
        } else if (tx.type === 'welfare_bonus') {
          if (oldAcc.hasClaimedWelfare) {
            console.warn(`[Security] Rejected duplicate welfare sign-in for user ${incomingAcc.username}`);
            const rejectedTx = { ...tx, status: 'cancelled', description: `REJECTED: Already signed in today` };
            sanitizedTxs.unshift(rejectedTx);
            finalHasClaimedWelfare = true;
          } else if (tx.amount > welfareLimit + 0.1) {
            console.warn(`[Security] Rejected inflated welfare sign-in of $${tx.amount} (limit: ${welfareLimit})`);
            const rejectedTx = { ...tx, status: 'cancelled', description: `REJECTED: Inflated welfare bonus` };
            sanitizedTxs.unshift(rejectedTx);
          } else {
            sanitizedTxs.unshift(tx);
            finalBalance += tx.amount;
            finalHasClaimedWelfare = true;
          }
        } else if (tx.type === 'vip_upgrade') {
          const upgradeCost = tx.amount;
          if (oldAcc.balance >= upgradeCost) {
            sanitizedTxs.unshift(tx);
            finalBalance -= upgradeCost;
            
            let targetLevel = oldAcc.vipLevel;
            if (upgradeCost === 50) targetLevel = 1;
            else if (upgradeCost === 310) targetLevel = 1;
            else if (upgradeCost === 500) targetLevel = 2;
            else if (upgradeCost === 2000) targetLevel = 3;
            else if (upgradeCost === 4000) targetLevel = 4;
            
            if (incomingAcc.vipLevel > oldAcc.vipLevel) {
              finalVipLevel = incomingAcc.vipLevel;
            } else {
              finalVipLevel = Math.max(oldAcc.vipLevel, targetLevel);
            }
          } else {
            console.warn(`[Security] Rejected VIP upgrade for user ${incomingAcc.username} due to insufficient balance`);
            const rejectedTx = { ...tx, status: 'cancelled', description: `REJECTED: Insufficient balance for upgrade` };
            sanitizedTxs.unshift(rejectedTx);
          }
        } else if (tx.type === 'withdraw') {
          const withdrawAmount = tx.amount;
          if (oldAcc.balance >= withdrawAmount) {
            const pendingWithdraw = { ...tx, status: 'pending' };
            sanitizedTxs.unshift(pendingWithdraw);
            finalBalance -= withdrawAmount;
          } else {
            console.warn(`[Security] Rejected withdrawal of $${withdrawAmount} for user ${incomingAcc.username} due to insufficient balance`);
            const rejectedTx = { ...tx, status: 'cancelled', description: `REJECTED: Insufficient balance` };
            sanitizedTxs.unshift(rejectedTx);
          }
        } else if (tx.type === 'recharge') {
          const pendingRecharge = { ...tx, status: 'pending' };
          sanitizedTxs.unshift(pendingRecharge);
        } else {
          console.warn(`[Security] Rejected unauthorized transaction type ${tx.type} for user ${incomingAcc.username}`);
        }
      }

      resultAccounts[idx] = {
        ...oldAcc,
        ...incomingAcc,
        password: incomingAcc.password || oldAcc.password,
        securityQuestion: incomingAcc.securityQuestion || oldAcc.securityQuestion,
        securityAnswer: incomingAcc.securityAnswer || oldAcc.securityAnswer,
        email: incomingAcc.email || oldAcc.email,
        phone: incomingAcc.phone || oldAcc.phone,
        referralCodeOwned: incomingAcc.referralCodeOwned || oldAcc.referralCodeOwned,
        balance: Number(finalBalance.toFixed(4)),
        investmentBalance: Number(finalBalance.toFixed(4)),
        vipLevel: finalVipLevel,
        vip: finalVipLevel,
        isBanned,
        transactions: sanitizedTxs,
        completedTasks: finalCompletedTasks,
        hasClaimedWelfare: finalHasClaimedWelfare,
        lastProfitPayoutDate: finalLastProfitPayoutDate
      };
    }
  }

  return resultAccounts;
}

app.post('/api/accounts/mutate', async (req, res) => {
  try {
    const { username, action, payload } = req.body;
    if (!username || !action) {
      return res.status(400).json({ error: "Username and action are required." });
    }

    // Load current accounts and retrieve direct doc from Firestore for absolute fresher/atomic accuracy (bypassing any read-lag)
    const currentAccounts = await getAccounts();
    const userIdx = currentAccounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (userIdx === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    let user: any = null;
    if (db) {
      try {
        const doc = await db.collection('accounts').doc(username.toLowerCase()).get();
        if (doc.exists) {
          user = doc.data();
          // Keep currentAccounts cache array in sync with direct Firestore document
          currentAccounts[userIdx] = user;
          console.log(`[Firestore-Mutate] Retrieved absolute freshest state direct-doc for user: ${username}`);
        }
      } catch (err) {
        console.error("[Firestore-Mutate] Direct document fetch failed, falling back to cache list", err);
      }
    }

    if (!user) {
      user = { ...currentAccounts[userIdx] };
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account is temporarily suspended." });
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);

    // Normalize payout state first (same daily reset logic as in validateAndProcessAccounts)
    if (user.lastProfitPayoutDate !== todayStr) {
      user.hasClaimedWelfare = false;
      user.lastProfitPayoutDate = todayStr;
      user.completedTasks = 0;
    }

    if (action === 'complete_task') {
      const { earnings, songTitle } = payload || {};
      if (!songTitle || earnings === undefined) {
        return res.status(400).json({ error: "Invalid task earnings or song title." });
      }
      
      const vLevel = user.vipLevel !== undefined ? Number(user.vipLevel) : 1;
      const invest = user.investmentBalance !== undefined ? Number(user.investmentBalance) : Number(user.balance || 0);
      
      if (vLevel < 1) {
        return res.status(400).json({ error: "You must have at least VIP 1 active to receive daily earnings." });
      }
      if (invest < 50) {
        return res.status(400).json({ error: "Your active investment is below $50. Please recharge to earn daily profits." });
      }

      // Max daily task limit check loaded dynamically from settings
      const settings = await getSettings();
      const vipPlans = settings?.vipPlans || DEFAULT_SETTINGS.vipPlans;
      const currentPlan = vipPlans.find((p: any) => p.level === vLevel);
      const maxTasks = currentPlan ? currentPlan.dailyTasksLimit : 20;

      if (user.completedTasks >= maxTasks) {
        return res.status(400).json({ error: "You have already reached your daily ticket limit." });
      }

      user.completedTasks += 1;
      user.balance = Number((user.balance + earnings).toFixed(4));
      
      const newTx = {
        id: `TX-TICKET-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        type: 'task_commission',
        amount: earnings,
        status: 'passed',
        timestamp: timeStr,
        description: `Settled music ticket verification: "${songTitle}"`
      };
      user.transactions = [newTx, ...(user.transactions || [])];

      // Distribute team commissions based on daily ticket profit: Level 1 (16%), Level 2 (8%), Level 3 (4%)
      if (user.referralCodeUsed) {
        // Find Level 1 Referrer
        const refL1Idx = currentAccounts.findIndex(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === user.referralCodeUsed.toLowerCase());
        if (refL1Idx !== -1) {
          const referrerL1 = currentAccounts[refL1Idx];
          const l1Comm = Number((earnings * 0.16).toFixed(4));
          referrerL1.balance = Number((referrerL1.balance + l1Comm).toFixed(4));
          const txL1 = {
            id: `TX-REF-L1-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            type: 'referral_commission',
            amount: l1Comm,
            status: 'passed',
            timestamp: timeStr,
            description: `16% Level 1 referral commission from "${user.username}" ticket profit of $${earnings.toFixed(2)}`
          };
          referrerL1.transactions = [txL1, ...(referrerL1.transactions || [])];
          
          // Save Level 1 Referrer to Firestore
          if (db) {
            await db.collection('accounts').doc(referrerL1.username.toLowerCase()).set(sanitizeForFirestore(referrerL1));
            console.log(`[Firestore-Commission] Credited Level 1 commission of $${l1Comm} to ${referrerL1.username}`);
          }

          // Find Level 2 Referrer
          if (referrerL1.referralCodeUsed) {
            const refL2Idx = currentAccounts.findIndex(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === referrerL1.referralCodeUsed.toLowerCase());
            if (refL2Idx !== -1) {
              const referrerL2 = currentAccounts[refL2Idx];
              const l2Comm = Number((earnings * 0.08).toFixed(4));
              referrerL2.balance = Number((referrerL2.balance + l2Comm).toFixed(4));
              const txL2 = {
                id: `TX-REF-L2-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                type: 'referral_commission',
                amount: l2Comm,
                status: 'passed',
                timestamp: timeStr,
                description: `8% Level 2 referral commission from "${user.username}" ticket profit of $${earnings.toFixed(2)}`
              };
              referrerL2.transactions = [txL2, ...(referrerL2.transactions || [])];
              
              // Save Level 2 Referrer to Firestore
              if (db) {
                await db.collection('accounts').doc(referrerL2.username.toLowerCase()).set(sanitizeForFirestore(referrerL2));
                console.log(`[Firestore-Commission] Credited Level 2 commission of $${l2Comm} to ${referrerL2.username}`);
              }

              // Find Level 3 Referrer
              if (referrerL2.referralCodeUsed) {
                const refL3Idx = currentAccounts.findIndex(a => a.referralCodeOwned && a.referralCodeOwned.toLowerCase() === referrerL2.referralCodeUsed.toLowerCase());
                if (refL3Idx !== -1) {
                  const referrerL3 = currentAccounts[refL3Idx];
                  const l3Comm = Number((earnings * 0.04).toFixed(4));
                  referrerL3.balance = Number((referrerL3.balance + l3Comm).toFixed(4));
                  const txL3 = {
                    id: `TX-REF-L3-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                    type: 'referral_commission',
                    amount: l3Comm,
                    status: 'passed',
                    timestamp: timeStr,
                    description: `4% Level 3 referral commission from "${user.username}" ticket profit of $${earnings.toFixed(2)}`
                  };
                  referrerL3.transactions = [txL3, ...(referrerL3.transactions || [])];
                  
                  // Save Level 3 Referrer to Firestore
                  if (db) {
                    await db.collection('accounts').doc(referrerL3.username.toLowerCase()).set(sanitizeForFirestore(referrerL3));
                    console.log(`[Firestore-Commission] Credited Level 3 commission of $${l3Comm} to ${referrerL3.username}`);
                  }
                }
              }
            }
          }
        }
      }

    } else if (action === 'upgrade_vip') {
      const { level, cost } = payload || {};
      if (!level || !cost) {
        return res.status(400).json({ error: "Missing level or cost for VIP upgrade." });
      }

      if (user.balance < cost) {
        return res.status(400).json({ error: "Insufficient balance for VIP upgrade." });
      }

      user.balance = Number((user.balance - cost).toFixed(4));
      user.vipLevel = level;
      user.vip = level;
      user.completedTasks = 0; // Reset daily tasks count upon upgrading

      const newTx = {
        id: `TX-UPGRADE-V${level}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        type: 'vip_upgrade',
        amount: cost,
        status: 'passed',
        timestamp: timeStr,
        description: `Upgraded membership status to elite VIP ${level}`
      };
      user.transactions = [newTx, ...(user.transactions || [])];

    } else if (action === 'claim_welfare') {
      const { bonus } = payload || {};
      if (bonus === undefined) {
        return res.status(400).json({ error: "Invalid welfare bonus amount." });
      }

      if (user.hasClaimedWelfare) {
        return res.status(400).json({ error: "You have already claimed welfare today." });
      }

      user.hasClaimedWelfare = true;
      user.balance = Number((user.balance + bonus).toFixed(4));

      const newTx = {
        id: `TX-WELFARE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        type: 'welfare_bonus',
        amount: bonus,
        status: 'passed',
        timestamp: timeStr,
        description: 'Daily welfare attendance sign-in award settled'
      };
      user.transactions = [newTx, ...(user.transactions || [])];

    } else if (action === 'recharge_submit') {
      const { amount, txId, receiptName } = payload || {};
      if (!amount || !txId) {
        return res.status(400).json({ error: "Missing recharge amount or transaction hash ID." });
      }

      const txIdClean = txId.trim();
      const newTx = {
        id: `R${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        type: 'recharge',
        amount: Number(amount),
        status: 'pending',
        timestamp: timeStr,
        description: `Recharge TRC-20 USDT deposit (TXID: ${txIdClean.substring(0, 8)}...)`,
        txId: txIdClean,
        receiptName: receiptName || ''
      };
      user.transactions = [newTx, ...(user.transactions || [])];

    } else if (action === 'withdraw_submit') {
      const { amount, address, network } = payload || {};
      if (!amount || !address) {
        return res.status(400).json({ error: "Missing withdrawal amount or wallet address." });
      }

      const withdrawAmount = Number(amount);
      if (user.balance < withdrawAmount) {
        return res.status(400).json({ error: "Insufficient balance to initiate this withdrawal." });
      }

      user.balance = Number((user.balance - withdrawAmount).toFixed(4));

      const netAmount = Number((withdrawAmount * 0.9).toFixed(4));
      const networkLabel = (network || 'trc20').toUpperCase();
      const newTx = {
        id: `W${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        type: 'withdraw',
        amount: withdrawAmount,
        status: 'pending',
        timestamp: timeStr,
        description: `Withdrawal request of $${withdrawAmount.toFixed(2)} via ${networkLabel} to Address ${address.substring(0, 6)}... (Net after 10% fee: $${netAmount.toFixed(2)})`,
        withdrawalAddress: address,
        withdrawalNetwork: network || 'trc20'
      };
      user.transactions = [newTx, ...(user.transactions || [])];

    } else {
      return res.status(400).json({ error: "Unsupported mutation action." });
    }

    // Save back to the array and write to storage
    user.investmentBalance = user.balance;
    currentAccounts[userIdx] = user;

    if (db) {
      await db.collection('accounts').doc(username.toLowerCase()).set(sanitizeForFirestore(user));
      console.log(`[Firestore] Successfully mutated and saved user document for: ${username}`);
    }
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(currentAccounts, null, 2), 'utf-8');

    res.json({ success: true, user });
  } catch (err) {
    console.error("Mutation action failed:", err);
    res.status(500).json({ error: "Failed to process mutation action." });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const incomingAccounts = req.body;
    if (Array.isArray(incomingAccounts)) {
      const currentAccounts = await getAccounts();
      const settings = await getSettings();
      const isAdmin = req.query.admin === 'true';
      const targetUsername = req.query.username ? String(req.query.username) : null;

      if (!isAdmin && !targetUsername) {
        return res.status(400).json({ error: "Missing required user context for synchronization." });
      }

      const validatedAccounts = await validateAndProcessAccounts(incomingAccounts, currentAccounts, isAdmin, settings, targetUsername);
      
      if (targetUsername) {
        const updatedUser = validatedAccounts.find(a => a.username.toLowerCase() === targetUsername.toLowerCase());
        if (updatedUser) {
          // Atomically update only this user's document in Firestore
          if (db) {
            await db.collection('accounts').doc(targetUsername.toLowerCase()).set(sanitizeForFirestore(updatedUser));
            console.log(`[Firestore] Atomically saved single user doc for: ${targetUsername} (Admin/User target)`);
          }
          // Also save the local json backup array
          fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(validatedAccounts, null, 2), 'utf-8');
        }
      } else {
        // Admin update or fallback: save all accounts
        await saveAccounts(validatedAccounts);
      }
      
      res.json({ success: true, count: validatedAccounts.length });
    } else {
      res.status(400).json({ error: "Invalid accounts array" });
    }
  } catch (error) {
    console.error("Failed to process accounts saving:", error);
    res.status(500).json({ error: "Failed to save accounts database" });
  }
});

app.delete('/api/accounts/:username', async (req, res) => {
  try {
    const username = String(req.params.username).toLowerCase();
    const currentAccounts = await getAccounts();
    const remaining = currentAccounts.filter((a) => a.username.toLowerCase() !== username);
    if (remaining.length === currentAccounts.length) {
      return res.status(404).json({ error: "Account not found" });
    }
    if (db) {
      await db.collection('accounts').doc(username).delete();
      console.log(`[Firestore] Successfully deleted document for user: ${username}`);
    }
    await saveAccounts(remaining);
    res.json({ success: true, count: remaining.length });
  } catch (error) {
    console.error("Failed to delete account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// Initialize server-side Gemini client with proper telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Customer Support Proxy Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const systemInstruction = `
      You are the official AI Customer Support representative for Latigo Music, a premier decentralized music ticket micro-investment and compound yield streaming platform.
      
      Your personality: Extremely polite, helpful, clear, and reassuring. Speak in simple, non-jargon terms.
      
      LATIGO MUSIC SPECIFICATIONS:
      1. VIP Levels and returns:
         - VIP 1: Deposit $50.00. Earns 2.6% daily ROI. Completes 20 tasks/tickets daily. Compound profit applies.
         - VIP 2: Deposit $500.00. Earns 2.7% daily ROI. Completes 30 tasks/tickets daily. Compound profit applies.
         - VIP 3: Deposit $2,000.00. Earns 3.0% daily ROI. Completes 40 tasks/tickets daily. Compound profit applies.
         - VIP 4: Deposit $4,000.00. Earns 3.5% daily ROI. Completes 50 tasks/tickets daily. Compound profit applies.
      2. Daily Operations:
         - Every day, users buy music streaming tickets and validate them. This automatically compounds their available balance with daily yields.
      3. Multi-Level Referral Commissions:
         - Level A: 16% commission on the direct invitee's daily ticket purchases.
         - Level B: 8% commission on second-level invitee's ticket purchases.
         - Level C: 4% commission on third-level invitee's ticket purchases.
      4. Financial rules:
         - Withdrawal fee: 10% network auditing/gas fee.
         - Withdrawal processing time: 2 - 72 hours.
         - Assets are cleared on TRC20-USDT blockchain networks.
         
      Respond to the user with helpful support advice. Keep answers structured, neat, and highly professional. Do not refer to the fact that you are an AI model unless asked, act like a professional live agent. Keep your reply concise (under 120 words).
    `;

    // Access Gemini 3.5 Flash server-side
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini support error:", error);
    res.status(500).json({ error: "Failed to generate support reply", details: error?.message });
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", appName: "Latigo Music Platform Node" });
});

// Setup Vite Dev server or Serve static files
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Latigo Music Express Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite server initialization crashed:", err);
});

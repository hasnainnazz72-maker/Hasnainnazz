export interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'task_commission' | 'referral_commission' | 'welfare_bonus' | 'vip_upgrade';
  amount: number;
  status: 'passed' | 'pending' | 'cancelled';
  timestamp: string;
  description: string;
  txId?: string; // For recharge
  paymentMethod?: string;
  withdrawalAddress?: string;
}

export interface TeamMember {
  id: string;
  username: string;
  level: 'A' | 'B' | 'C';
  registrationDate: string;
  balance: number;
  isActive: boolean;
  commissionContributed: number;
}

export interface MusicSingle {
  id: string;
  title: string;
  artist: string;
  price: number;
  vipRequired: number;
  voucherCost: number;
  imageUrl: string;
  description: string;
}

export interface VIPLevel {
  level: number;
  name: string;
  minDeposit: number;
  dailyRate: number; // e.g. 0.026 for 2.6%
  dailyTasksLimit: number;
  description: string;
}

export interface ChatMessage {
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

import React, { useState, useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight, UploadCloud, Copy, QrCode, FileText, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface FinanceTabProps {
  userBalance: number;
  userInvestmentBalance?: number;
  transactions: Transaction[];
  onRechargeSubmit: (amount: number, txId: string, receiptName?: string) => void;
  onWithdrawSubmit: (amount: number, address: string, network: 'trc20' | 'bep20') => void;
  siteSettings?: any;
}

export default function FinanceTab({ userBalance, userInvestmentBalance, transactions, onRechargeSubmit, onWithdrawSubmit, siteSettings }: FinanceTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'recharge' | 'withdraw'>('recharge');

  // Recharge state
  const [rechargeNetwork, setRechargeNetwork] = useState<'trc20' | 'bep20'>('trc20');
  const [rechargeAmount, setRechargeAmount] = useState<string>('50');
  const [txId, setTxId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // Withdraw state
  const [withdrawNetwork, setWithdrawNetwork] = useState<'trc20' | 'bep20'>('trc20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const trc20Address = siteSettings?.trc20Address || "TETttTRj6ZX5gAm79RgDgDm6WHeMrnDjdy";
  const bep20Address = siteSettings?.bep20Address || "0xbd63907b714a667f5052c432cdc4ad3dc0d73658";

  const currentAddress = rechargeNetwork === 'trc20' ? trc20Address : bep20Address;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Drag and Drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image screenshot of the payment receipt.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(rechargeAmount);
    if (isNaN(amountVal) || amountVal < 50) {
      alert("Minimum recharge amount is $50.");
      return;
    }
    if (amountVal > 100000) {
      alert("Maximum recharge amount is $100,000.");
      return;
    }
    if (!txId.trim()) {
      alert("Please enter the blockchain Transaction ID (TXID) or Reference ID.");
      return;
    }

    onRechargeSubmit(amountVal, txId, receiptFile ? receiptFile.name : undefined);
    setRechargeSuccess(true);
    setTimeout(() => {
      setRechargeSuccess(false);
      setTxId('');
      setReceiptFile(null);
      setReceiptPreview(null);
    }, 4000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(withdrawAmount);
    if (isNaN(amountVal) || amountVal < 15) {
      alert("Minimum withdrawal is $15.");
      return;
    }
    if (amountVal > userBalance) {
      alert("Insufficient balance for withdrawal!");
      return;
    }
    if (!withdrawAddress.trim()) {
      alert(`Please enter a valid ${withdrawNetwork === 'trc20' ? 'TRC-20' : 'BEP-20 (BSC)'} USDT Wallet Address.`);
      return;
    }
    if (withdrawNetwork === 'bep20' && !withdrawAddress.trim().startsWith('0x')) {
      alert("Please enter a valid BEP-20 USDT Wallet Address starting with '0x'.");
      return;
    }
    if (withdrawNetwork === 'trc20' && !withdrawAddress.trim().startsWith('T')) {
      alert("Please enter a valid TRC-20 USDT Wallet Address starting with 'T'.");
      return;
    }

    onWithdrawSubmit(amountVal, withdrawAddress, withdrawNetwork);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
    }, 4000);
  };

  // Calculations for withdrawal fee
  const withdrawalFeeRate = 0.10; // 10%
  const requestedWithdrawVal = Number(withdrawAmount) || 0;
  const withdrawalFee = requestedWithdrawVal * withdrawalFeeRate;
  const netReceived = Math.max(0, requestedWithdrawVal - withdrawalFee);

  return (
    <div className="space-y-6 pb-24 text-white" id="finance-tab-content">
      {/* Wallet Balance Card */}
      <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Available Balance (Profit Earnings)</span>
            <h2 className="text-2xl font-black text-emerald-400 tracking-tight">${userBalance.toFixed(2)}</h2>
            <span className="text-[9px] text-zinc-500 font-medium block">Withdrawal is deducted from this balance</span>
          </div>
          <div className="h-[1px] md:h-12 w-full md:w-[1px] bg-zinc-800" />
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Investment Balance (Recharge Funds)</span>
            <h2 className="text-2xl font-black text-blue-400 tracking-tight">${(userInvestmentBalance !== undefined ? userInvestmentBalance : userBalance).toFixed(2)}</h2>
            <span className="text-[9px] text-zinc-500 font-medium block">Compounding yields are calculated on this balance</span>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('recharge')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'recharge' 
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                : 'bg-zinc-800 text-zinc-300 border border-zinc-750'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Recharge
          </button>
          <button
            onClick={() => setActiveSubTab('withdraw')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'withdraw' 
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                : 'bg-zinc-800 text-zinc-300 border border-zinc-750'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
          </button>
        </div>
      </div>

      {/* Recharge Forms Panel */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'recharge' ? (
          <motion.div
            key="recharge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 bg-zinc-900 border border-zinc-850 p-6 rounded-3xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-extrabold text-white">Virtual USDT Recharge</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold">Instant Credit</span>
            </div>

            {rechargeSuccess ? (
              <div className="py-8 text-center space-y-3" id="recharge-success-box">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Recharge Submitted Successfully!</h4>
                <p className="text-xs text-zinc-400 px-4 leading-relaxed">
                  Your deposit request has been submitted. It will be credited automatically once processed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRechargeSubmit} className="space-y-4">
                {/* Network Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Select Blockchain Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRechargeNetwork('trc20')}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                        rechargeNetwork === 'trc20'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                      }`}
                    >
                      USDT - TRC20
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargeNetwork('bep20')}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                        rechargeNetwork === 'bep20'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                      }`}
                    >
                      USDT - BEP20 (BSC)
                    </button>
                  </div>
                </div>

                {/* QR Code section */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850/60 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-xl shadow-lg relative">
                    {/* Dynamic scannable QR Code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAddress)}`}
                      alt={`${rechargeNetwork.toUpperCase()} QR Code`}
                      className="w-32 h-32"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-zinc-950 text-white font-mono text-[7px] font-bold rounded">
                      {rechargeNetwork.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 w-full px-2">
                    <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Official {rechargeNetwork.toUpperCase()} Deposit Wallet</span>
                    <div className="flex items-center bg-zinc-900 p-2 rounded-xl border border-zinc-800 text-xs justify-between">
                      <span className="font-mono text-[10px] text-zinc-300 truncate pr-2">{currentAddress}</span>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="p-1.5 hover:bg-zinc-800 text-emerald-400 rounded-lg transition-colors shrink-0"
                      >
                        {isCopied ? "Copied" : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount selection */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">Select or Input Recharge Amount ($)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['50', '310', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          rechargeAmount === amt
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    placeholder="Enter Custom Amount"
                    required
                  />
                </div>

                {/* TX ID */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Transaction ID (TXID) / Ref Code</label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. 5d9283f3d7fb8f..."
                    required
                  />
                </div>

                {/* File receipt upload */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Upload Payment Receipt Screenshot</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {receiptPreview ? (
                      <div className="space-y-2">
                        <img src={receiptPreview} alt="Receipt preview" className="h-20 object-contain rounded border border-zinc-800" />
                        <p className="text-[10px] text-zinc-400 truncate max-w-xs">{receiptFile?.name}</p>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block">Click to replace</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-zinc-600 mb-2" />
                        <p className="text-xs text-zinc-400 font-bold">Drag and drop your screenshot here</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Supports JPG, PNG, WEBP (Click to browse)</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs tracking-wider uppercase active:scale-98 transition-all shadow-lg shadow-emerald-500/10"
                >
                  Submit Recharge Verification
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 bg-zinc-900 border border-zinc-850 p-6 rounded-3xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-extrabold text-white">Withdrawal Portal</h3>
              <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] rounded-full font-bold">2 - 72 Hours</span>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3" id="withdrawal-success-box">
                <Clock className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="text-base font-bold text-white">Withdrawal Submitted Successfully!</h4>
                <p className="text-xs text-zinc-400 px-4 leading-relaxed">
                  Your withdrawal request has been submitted and is currently processing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Warning notice */}
                <div className="bg-yellow-500/5 border border-yellow-500/10 p-3.5 rounded-2xl flex gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-yellow-500 font-bold block uppercase tracking-wider">Official Policy Notice</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Withdrawal processing time takes 2 - 72 hours. A standard network gas audit fee of 10% applies to all withdrawals.
                    </p>
                  </div>
                </div>

                {/* Network Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Select Blockchain Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawNetwork('trc20')}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                        withdrawNetwork === 'trc20'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                      }`}
                    >
                      USDT - TRC20
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawNetwork('bep20')}
                      className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                        withdrawNetwork === 'bep20'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                      }`}
                    >
                      USDT - BEP20 (BSC)
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-400 font-semibold">Withdrawal Amount ($)</label>
                    <span className="text-[10px] text-zinc-500">Min. Withdrawal: $15.00</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-zinc-400 text-xs">$</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 pl-7 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Address inputs */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Receiving USDT {withdrawNetwork === 'trc20' ? 'TRC-20' : 'BEP-20 (BSC)'} Address</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder={withdrawNetwork === 'trc20' ? 'e.g. TYFpGfZ8LscF9...' : 'e.g. 0xbd63907b714a667...'}
                    required
                  />
                </div>

                {/* Calculations info */}
                <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850 space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-zinc-500 text-xs">
                    <span>Withdrawal Fee (10%):</span>
                    <span className="text-red-400">-${withdrawalFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white border-t border-zinc-800 pt-2">
                    <span>Net Amount Received:</span>
                    <span className="text-emerald-400 font-black text-base">${netReceived.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs tracking-wider uppercase active:scale-98 transition-all shadow-lg shadow-emerald-500/10"
                >
                  Submit Cash-out order
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions list */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-zinc-400 px-1 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Financial Statement Logs
        </h4>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-3xl flex justify-between items-center text-xs"
            >
              <div className="space-y-1 max-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    tx.type === 'recharge' ? 'bg-emerald-400' : tx.type === 'withdraw' ? 'bg-amber-400' : 'bg-purple-400'
                  }`} />
                  <span className="font-extrabold text-white capitalize">{tx.type.replace('_', ' ')}</span>
                </div>
                <div className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  {tx.description}
                </div>
                <div className="text-[9px] text-zinc-600 font-mono">
                  {tx.id} • {tx.timestamp}
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className={`font-black text-sm block ${
                  tx.type === 'recharge' || tx.type === 'task_commission' || tx.type === 'referral_commission' || tx.type === 'welfare_bonus'
                    ? 'text-emerald-400' 
                    : 'text-zinc-300'
                }`}>
                  {tx.type === 'recharge' || tx.type === 'task_commission' || tx.type === 'referral_commission' || tx.type === 'welfare_bonus' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                  tx.status === 'passed' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : tx.status === 'pending' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';
import { LicenseTier, LocalPaymentMethod } from '../types';

export const LocalPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setPaymentModalOpen,
    checkoutPlan,
    setActiveLicenseTier,
  } = useStore();

  const { t } = useTranslation();

  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod>('qris');
  const [copiedVa, setCopiedVa] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('0812-9876-5432');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(899); // 15 minutes timer
  const [orderId, setOrderId] = useState('');

  const targetTier: LicenseTier = checkoutPlan?.tier || 'pro';
  const amount = checkoutPlan?.amount || (targetTier === 'agency' ? 499000 : 149000);

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentSuccess(false);
      setIsProcessing(false);
      setCountdown(899);
      setOrderId(`INV/SHOWCASE/${Date.now().toString().slice(-6)}`);
    }
  }, [isPaymentModalOpen]);

  useEffect(() => {
    if (!isPaymentModalOpen || paymentSuccess) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaymentModalOpen, paymentSuccess]);

  if (!isPaymentModalOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getVaNumber = () => {
    switch (paymentMethod) {
      case 'bca_va':
        return '8077 7081 2987 6543';
      case 'mandiri_va':
        return '8950 8081 2987 6543';
      case 'bri_va':
        return '1234 5081 2987 6543';
      case 'bni_va':
        return '9880 1081 2987 6543';
      default:
        return '8077 7081 2987 6543';
    }
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(getVaNumber().replace(/\s+/g, ''));
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setActiveLicenseTier(targetTier);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs">
              IDR
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <span>{t.paymentTitle}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Instant
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400">
                {t.paymentSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {t.paymentSuccess}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {t.paymentSuccessDesc}
              </p>
            </div>

            {/* Official Digital Invoice Receipt */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Nomor Faktur:</span>
                <span className="font-mono text-zinc-300 font-medium">{orderId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Paket Lisensi:</span>
                <span className="font-semibold text-indigo-400 uppercase">
                  {targetTier === 'agency' ? 'Showcase Agency (Tim)' : 'Showcase Pro (Individu)'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Total Pembayaran:</span>
                <span className="font-bold text-emerald-400">{formatRupiah(amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Metode Pembayaran:</span>
                <span className="text-zinc-300 uppercase font-mono">{paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {t.paymentClose}
            </button>
          </div>
        ) : (
          /* Payment Selection & Checkout */
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Plan Info Card */}
            <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Paket Pilihan
                </span>
                <h4 className="text-sm font-bold text-white capitalize">
                  {targetTier === 'agency' ? 'Showcase Agency (Tim)' : 'Showcase Pro (Individu)'}
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Semua fitur Pro, tanpa watermark, 4K & batch multi-rasio
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">
                  {formatRupiah(amount)}
                </span>
                <span className="text-[10px] text-zinc-400 block">/ bulan</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                {t.paymentSelectMethod}
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-orange-400 mb-1" />
                  <span className="font-semibold text-[11px]">QRIS Instan</span>
                  <span className="text-[9px] text-zinc-500">Scan & Bayar</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('gopay')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    ['gopay', 'ovo', 'dana', 'shopeepay'].includes(paymentMethod)
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="font-semibold text-[11px]">E-Wallet</span>
                  <span className="text-[9px] text-zinc-500">GoPay / OVO / DANA</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('bca_va')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    paymentMethod.endsWith('_va')
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="font-semibold text-[11px]">Virtual Account</span>
                  <span className="text-[9px] text-zinc-500">BCA, Mandiri, BRI</span>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              {paymentMethod === 'qris' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center justify-between w-full border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      <span>Selesaikan dalam:</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-orange-400">
                      {formatTimer(countdown)}
                    </span>
                  </div>

                  {/* Dynamic QRIS Box */}
                  <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center border border-zinc-200">
                    <div className="text-[10px] font-black tracking-widest text-zinc-800 uppercase mb-1 border-b border-zinc-200 pb-0.5 w-full text-center">
                      QRIS NASIONAL
                    </div>
                    {/* Authentic QR SVG Mockup */}
                    <svg
                      className="w-40 h-40"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="100" height="100" fill="white" />
                      {/* Top-left marker */}
                      <rect x="10" y="10" width="22" height="22" fill="black" />
                      <rect x="14" y="14" width="14" height="14" fill="white" />
                      <rect x="18" y="18" width="6" height="6" fill="black" />

                      {/* Top-right marker */}
                      <rect x="68" y="10" width="22" height="22" fill="black" />
                      <rect x="72" y="14" width="14" height="14" fill="white" />
                      <rect x="76" y="18" width="6" height="6" fill="black" />

                      {/* Bottom-left marker */}
                      <rect x="10" y="68" width="22" height="22" fill="black" />
                      <rect x="14" y="72" width="14" height="14" fill="white" />
                      <rect x="18" y="76" width="6" height="6" fill="black" />

                      {/* Data dots */}
                      <rect x="36" y="12" width="4" height="4" fill="black" />
                      <rect x="44" y="12" width="4" height="4" fill="black" />
                      <rect x="52" y="12" width="4" height="4" fill="black" />
                      <rect x="36" y="20" width="4" height="4" fill="black" />
                      <rect x="48" y="20" width="4" height="4" fill="black" />
                      <rect x="56" y="20" width="4" height="4" fill="black" />
                      <rect x="36" y="28" width="4" height="4" fill="black" />
                      <rect x="44" y="28" width="4" height="4" fill="black" />
                      <rect x="52" y="28" width="4" height="4" fill="black" />

                      {/* Center cluster */}
                      <rect x="38" y="38" width="24" height="24" rx="4" fill="#f97316" />
                      <circle cx="50" cy="50" r="7" fill="white" />
                      <circle cx="50" cy="50" r="4" fill="#f97316" />

                      {/* Bottom area */}
                      <rect x="36" y="68" width="4" height="4" fill="black" />
                      <rect x="44" y="68" width="4" height="4" fill="black" />
                      <rect x="52" y="68" width="4" height="4" fill="black" />
                      <rect x="68" y="44" width="4" height="4" fill="black" />
                      <rect x="76" y="44" width="4" height="4" fill="black" />
                      <rect x="84" y="44" width="4" height="4" fill="black" />
                      <rect x="68" y="68" width="8" height="8" fill="black" />
                      <rect x="80" y="68" width="8" height="8" fill="black" />
                      <rect x="68" y="80" width="8" height="8" fill="black" />
                      <rect x="80" y="80" width="8" height="8" fill="black" />
                    </svg>

                    <div className="text-[9px] font-semibold text-zinc-500 mt-1">
                      NMID: ID1020088219012
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 max-w-sm">
                    Buka BCA Mobile, Livin' Mandiri, GoPay, OVO, DANA, ShopeePay, atau m-Banking Anda lalu scan kode di atas.
                  </p>
                </div>
              )}

              {['gopay', 'ovo', 'dana', 'shopeepay'].includes(paymentMethod) && (
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    {(['gopay', 'ovo', 'dana', 'shopeepay'] as LocalPaymentMethod[]).map(
                      (ew) => (
                        <button
                          key={ew}
                          onClick={() => setPaymentMethod(ew)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                            paymentMethod === ew
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {ew}
                        </button>
                      )
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">
                      Nomor Handphone Terdaftar di {paymentMethod.toUpperCase()}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Notifikasi pembayaran akan langsung dikirim ke aplikasi e-wallet di ponsel Anda.
                  </p>
                </div>
              )}

              {paymentMethod.endsWith('_va') && (
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    {(['bca_va', 'mandiri_va', 'bri_va', 'bni_va'] as LocalPaymentMethod[]).map(
                      (bk) => (
                        <button
                          key={bk}
                          onClick={() => setPaymentMethod(bk)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold uppercase transition-all ${
                            paymentMethod === bk
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {bk.replace('_va', '')}
                        </button>
                      )
                    )}
                  </div>

                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">
                        Nomor Virtual Account {paymentMethod.replace('_va', '').toUpperCase()}
                      </span>
                      <span className="font-mono text-sm font-bold text-white tracking-wider">
                        {getVaNumber()}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyVa}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium cursor-pointer"
                    >
                      {copiedVa ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[10px] text-zinc-500 space-y-1">
                    <p>• Masuk ke m-Banking &gt; Transfer &gt; Virtual Account.</p>
                    <p>• Masukkan nomor VA di atas dan pastikan nama penerima adalah Showcase Studio.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instant Confirmation Action Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <span>{t.paymentPayNow} ({formatRupiah(amount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Layers, TrendingUp, CheckCircle, Copy, Check, QrCode } from 'lucide-react';
import { Gam3eya, UserSettings } from '../types';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

interface StatsCardsProps {
  gam3eyat: Gam3eya[];
  settings: UserSettings;
  onOpenSettings: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  gam3eyat,
  settings,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);

  const activeCount = gam3eyat.filter((g) => g.status === 'active').length;
  const totalLiquidity = gam3eyat.reduce((sum, g) => sum + g.totalPool, 0);
  const totalCollected = gam3eyat.reduce(
    (sum, g) => sum + g.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  );

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(settings.vodafoneCashNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
      {/* 1. Active Gam3eyat */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">عدد الجمعيات النشطة</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block tabular-nums">
            {activeCount} <span className="text-xs font-normal text-slate-500">جمعية جارية</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
            متابعة يومية وشهرية
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
          <Layers className="w-5 h-5 text-emerald-700" />
        </div>
      </div>

      {/* 2. Total Liquidity / Pool */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">إجمالي سيولة الأحواض</span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block tabular-nums">
            {formatCurrency(totalLiquidity)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            مجموع مبالغ القبض
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-100 shrink-0">
          <TrendingUp className="w-5 h-5 text-teal-700" />
        </div>
      </div>

      {/* 3. Total Collected */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">إجمالي المحصل في الخزينة</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block tabular-nums">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            سداد نقدي وكاش
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
          <CheckCircle className="w-5 h-5 text-emerald-700" />
        </div>
      </div>

      {/* 4. Vodafone Cash Quick Card */}
      <div className="bg-gradient-to-br from-[#E60000] to-[#b30000] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-red-400/30 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-red-100 uppercase tracking-wider">
              فودافون كاش نشط
            </span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-[10px] text-red-200 hover:text-white underline underline-offset-2"
          >
            تغيير
          </button>
        </div>

        <div className="my-1">
          <span className="text-lg font-black font-mono tracking-wider tabular-nums block text-white dir-ltr text-right">
            {formatPhoneNumber(settings.vodafoneCashNumber)}
          </span>
          <span className="text-[11px] text-red-100 truncate block">
            {settings.collectorName}
          </span>
        </div>

        <button
          onClick={handleCopyPhone}
          className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>تم نسخ الرقم</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ رقم الكاش</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

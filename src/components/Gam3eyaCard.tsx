import React from 'react';
import { Users, FileText, CreditCard, ChevronLeft, Calendar, Sparkles } from 'lucide-react';
import { Gam3eya } from '../types';
import { formatCurrency, formatDateArabic, getGam3eyaEffectiveEndDate } from '../utils/formatters';

interface Gam3eyaCardProps {
  gam3eya: Gam3eya;
  onOpenDetails: () => void;
  onQuickPay: () => void;
  onOpenPrint: () => void;
}

export const Gam3eyaCard: React.FC<Gam3eyaCardProps> = ({
  gam3eya,
  onOpenDetails,
  onQuickPay,
  onOpenPrint,
}) => {
  const totalPaid = gam3eya.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = gam3eya.totalPool * gam3eya.shares.length;
  const progressPct = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0;

  const sharedSharesCount = gam3eya.shares.filter((s) => s.type === 'shared').length;
  const singleSharesCount = gam3eya.shares.filter((s) => s.type === 'single').length;
  const effectiveEndDate = getGam3eyaEffectiveEndDate(gam3eya);

  const isDaily = gam3eya.periodType === 'daily';

  return (
    <div
      className={`bg-white rounded-3xl border transition-all text-right flex flex-col justify-between relative group overflow-hidden ${
        isDaily
          ? 'border-amber-200/90 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/5'
          : 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5'
      }`}
    >
      {/* Top Distinct Color Accent Line */}
      <div
        className={`h-1.5 w-full ${
          isDaily
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
        }`}
      />

      <div className="p-5 sm:p-6 pb-2">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border shrink-0 transition-transform group-hover:scale-105 ${
                isDaily
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'
              }`}
            >
              <Users
                className={`w-5 h-5 ${isDaily ? 'text-amber-700' : 'text-emerald-700'}`}
              />
            </div>
            <div>
              <h3
                className={`text-base sm:text-lg font-bold text-slate-900 transition-colors ${
                  isDaily ? 'group-hover:text-amber-800' : 'group-hover:text-emerald-800'
                }`}
              >
                {gam3eya.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    isDaily ? 'text-amber-700' : 'text-emerald-800'
                  }`}
                >
                  {isDaily ? '⚡ جمعية يومية' : '🗓️ جمعية شهرية'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {gam3eya.duration} {isDaily ? 'يوم' : 'شهر'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Period Type Pill Badge */}
            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-xl border shadow-2xs ${
                isDaily
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              }`}
            >
              {isDaily ? 'يومية' : 'شهرية'}
            </span>

            {/* Status Badge */}
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-xl ${
                gam3eya.status === 'active'
                  ? isDaily
                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {gam3eya.status === 'active' ? 'جارية' : 'مكتملة'}
            </span>
          </div>
        </div>

        {/* Financial Highlights Grid */}
        <div
          className={`grid grid-cols-2 gap-3 my-4 p-3.5 rounded-2xl border ${
            isDaily
              ? 'bg-amber-50/40 border-amber-100/90'
              : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">إجمالي القبضة (الحوض)</span>
            <span
              className={`text-lg font-black tabular-nums ${
                isDaily ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              {formatCurrency(gam3eya.totalPool)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {formatCurrency(gam3eya.installmentAmount)} × {gam3eya.duration}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">المحصل من الأعضاء</span>
            <span
              className={`text-lg font-black tabular-nums ${
                isDaily ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(totalPaid)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {progressPct}% من المستهدف
            </span>
          </div>
        </div>

        {/* Start & End Dates Bar */}
        <div
          className={`flex items-center justify-between text-[11px] rounded-2xl px-3 py-2 text-slate-700 mb-3 border ${
            isDaily
              ? 'bg-amber-50/80 border-amber-200/80'
              : 'bg-emerald-50/80 border-emerald-200/80'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar
              className={`w-3.5 h-3.5 shrink-0 ${
                isDaily ? 'text-amber-700' : 'text-emerald-700'
              }`}
            />
            <span className="text-slate-500 shrink-0">البدء:</span>
            <span className="text-slate-800 font-bold truncate">
              {formatDateArabic(gam3eya.startDate)}
            </span>
          </div>
          <span
            className={`font-bold px-1 ${
              isDaily ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            ←
          </span>
          <div className="flex items-center gap-1.5 min-w-0 text-left">
            <span className="text-slate-500 shrink-0">النهاية:</span>
            <span
              className={`font-bold truncate ${
                isDaily ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              {formatDateArabic(effectiveEndDate)}
            </span>
          </div>
        </div>

        {/* Progress Bar (Visual: مدفوع 150ج / 10,000ج) */}
        <div className="space-y-1.5 my-3">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>
              سداد التحصيل:{' '}
              <strong
                className={`font-bold ${
                  isDaily ? 'text-amber-800' : 'text-emerald-800'
                }`}
              >
                {formatCurrency(totalPaid)}
              </strong>{' '}
              / {formatCurrency(totalExpected)}
            </span>
            <span className="font-bold text-slate-700">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDaily
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500'
              }`}
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Shares Composition Tag Strip */}
        <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
          <span className="text-slate-500 font-medium">الأسهم:</span>
          {singleSharesCount > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
              {singleSharesCount} أسهم فردية
            </span>
          )}
          {sharedSharesCount > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{sharedSharesCount} سهم مشترك مرن</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onQuickPay}
            className={`py-2 px-3 rounded-xl active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all ${
              isDaily
                ? 'bg-amber-700 hover:bg-amber-600 shadow-amber-900/15'
                : 'bg-emerald-800 hover:bg-emerald-700 shadow-emerald-900/15'
            }`}
            title="تسجيل دفعة سريعة"
          >
            <CreditCard
              className={`w-3.5 h-3.5 ${
                isDaily ? 'text-amber-200' : 'text-emerald-200'
              }`}
            />
            <span>تسجيل دفع</span>
          </button>

          <button
            onClick={onOpenPrint}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200/90 transition-all shadow-2xs"
            title="كشف حساب PDF"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>كشف PDF</span>
          </button>
        </div>

        <button
          onClick={onOpenDetails}
          className={`text-xs font-bold flex items-center gap-1 px-2 py-2 transition-colors ${
            isDaily
              ? 'text-amber-800 hover:text-amber-950'
              : 'text-emerald-800 hover:text-emerald-950'
          }`}
        >
          <span>عرض الأدوار</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

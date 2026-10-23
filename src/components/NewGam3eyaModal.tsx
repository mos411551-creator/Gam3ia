import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Users, DollarSign, Check, Clock, Layers } from 'lucide-react';
import { Gam3eya, PeriodType, Share, Participant } from '../types';
import { SharedShareBuilder } from './SharedShareBuilder';
import { formatCurrency, calculateGam3eyaEndDate, formatDateArabic } from '../utils/formatters';

interface NewGam3eyaModalProps {
  onClose: () => void;
  onSave: (gam3eya: Gam3eya) => void;
  defaultUserName?: string;
}

export const NewGam3eyaModal: React.FC<NewGam3eyaModalProps> = ({
  onClose,
  onSave,
  defaultUserName = 'مصطفى',
}) => {
  const [name, setName] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [installmentAmount, setInstallmentAmount] = useState<number>(100);
  const [duration, setDuration] = useState<number>(100);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  const autoCalculatedEndDate = calculateGam3eyaEndDate(startDate, duration, periodType);
  const effectiveEndDate = customEndDate || autoCalculatedEndDate;

  // Initial Shares list: start with 2 shares (1 single for user, 1 flexible shared share)
  const initialShares: Share[] = [
    {
      id: 'share_1',
      type: 'single',
      turnIndex: 1,
      member: { name: defaultUserName, phone: '' },
      installmentAmount: 100,
      targetPayout: 10000,
      payoutStatus: 'pending',
    },
    {
      id: 'share_2',
      type: 'shared',
      turnIndex: 2,
      shareLabel: 'سهم مشترك مرن',
      installmentAmount: 100,
      targetPayout: 10000,
      payoutStatus: 'pending',
      participants: [
        {
          id: 'p_1',
          name: 'أحمد',
          phone: '',
          percentage: 60,
          installmentAmount: 60,
          targetPayout: 6000,
          payoutStatus: 'pending',
        },
        {
          id: 'p_2',
          name: 'سارة',
          phone: '',
          percentage: 40,
          installmentAmount: 40,
          targetPayout: 4000,
          payoutStatus: 'pending',
        },
      ],
    },
  ];

  const [shares, setShares] = useState<Share[]>(initialShares);
  const [activeTab, setActiveTab] = useState<'info' | 'shares'>('info');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculated total pool: installmentAmount * duration
  const totalPool = (Number(installmentAmount) || 0) * (Number(duration) || 0);

  // Update target payouts when duration or installment changes
  const handleInstallmentOrDurationChange = (inst: number, dur: number) => {
    setInstallmentAmount(inst);
    setDuration(dur);
    const pool = inst * dur;

    setShares((prev) =>
      prev.map((s) => {
        if (s.type === 'single') {
          return {
            ...s,
            installmentAmount: inst,
            targetPayout: pool,
          };
        } else {
          return {
            ...s,
            installmentAmount: inst,
            targetPayout: pool,
            participants: s.participants?.map((p) => ({
              ...p,
              installmentAmount: Math.round(((p.percentage || 0) / 100) * inst),
              targetPayout: Math.round(((p.percentage || 0) / 100) * pool),
            })),
          };
        }
      })
    );
  };

  const handleAddSingleShare = () => {
    const nextTurn = shares.length + 1;
    const newShare: Share = {
      id: 'share_' + Math.random().toString(36).substring(2, 9),
      type: 'single',
      turnIndex: nextTurn,
      member: { name: `مشارك ${nextTurn}`, phone: '' },
      installmentAmount,
      targetPayout: totalPool,
      payoutStatus: 'pending',
    };
    setShares([...shares, newShare]);
  };

  const handleAddSharedShare = () => {
    const nextTurn = shares.length + 1;
    const newShare: Share = {
      id: 'share_' + Math.random().toString(36).substring(2, 9),
      type: 'shared',
      turnIndex: nextTurn,
      shareLabel: `سهم مشترك مرن (دور ${nextTurn})`,
      installmentAmount,
      targetPayout: totalPool,
      payoutStatus: 'pending',
      participants: [
        {
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          name: 'المشارك الأول',
          phone: '',
          percentage: 50,
          installmentAmount: Math.round(0.5 * installmentAmount),
          targetPayout: Math.round(0.5 * totalPool),
          payoutStatus: 'pending',
        },
        {
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          name: 'المشارك الثاني',
          phone: '',
          percentage: 50,
          installmentAmount: Math.round(0.5 * installmentAmount),
          targetPayout: Math.round(0.5 * totalPool),
          payoutStatus: 'pending',
        },
      ],
    };
    setShares([...shares, newShare]);
  };

  const handleRemoveShare = (id: string) => {
    if (shares.length <= 1) return;
    const filtered = shares.filter((s) => s.id !== id);
    // Reindex turns
    const reindexed = filtered.map((s, idx) => ({ ...s, turnIndex: idx + 1 }));
    setShares(reindexed);
  };

  const handleUpdateSingleShare = (id: string, nameVal: string, phoneVal: string) => {
    setShares((prev) =>
      prev.map((s) => (s.id === id ? { ...s, member: { name: nameVal, phone: phoneVal } } : s))
    );
  };

  const handleUpdateSharedShareParticipants = (shareId: string, participants: Participant[]) => {
    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, participants } : s))
    );
  };

  const validateAndSave = () => {
    if (!name.trim()) {
      setErrorMsg('برجاء كتابة اسم للجمعية أولاً');
      setActiveTab('info');
      return;
    }
    if (installmentAmount <= 0 || duration <= 0) {
      setErrorMsg('برجاء إدخال مبلغ ومدة صحيحين');
      setActiveTab('info');
      return;
    }

    // Check shared shares percentage sum
    for (const s of shares) {
      if (s.type === 'shared') {
        const sum = s.participants?.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0) || 0;
        if (Math.abs(sum - 100) > 0.01) {
          setErrorMsg(`خطأ في دور (${s.turnIndex}): مجموع نسب السهم المشترك يجب أن يساوي 100% بالضبط (المجموع الحالي: ${sum}%)`);
          setActiveTab('shares');
          return;
        }
      }
    }

    const newGam3eya: Gam3eya = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      periodType,
      installmentAmount,
      duration,
      totalPool,
      startDate,
      endDate: effectiveEndDate,
      status: 'active',
      shares,
      payments: [],
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSave(newGam3eya);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Plus className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إنشاء جمعية جديدة</h3>
              <p className="text-xs text-emerald-200">
                إجمالي الحوض التلقائي: {formatCurrency(totalPool)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. تفاصيل الجمعية والمبلغ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shares')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'shares'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. الأسهم والأدوار ({shares.length})</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 text-right">
            {errorMsg}
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 text-right flex-1">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Gam3eya Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم الجمعية:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="مثال: جمعية الشباب اليومية أو جمعية الشتاء"
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Period Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع الدورية:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodType('daily');
                      handleInstallmentOrDurationChange(100, 100);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      periodType === 'daily'
                        ? 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-400 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                      <span>⚡</span>
                      <span>يومية (بالأيام)</span>
                    </div>
                    <div className="text-xs text-amber-800/80 mt-0.5">تحصيل دوري يومي سريع</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPeriodType('monthly');
                      handleInstallmentOrDurationChange(1000, 10);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      periodType === 'monthly'
                        ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                      <span>🗓️</span>
                      <span>شهرية (بالشهور)</span>
                    </div>
                    <div className="text-xs text-emerald-800/80 mt-0.5">تحصيل دوري أول كل شهر</div>
                  </button>
                </div>
              </div>

              {/* Installment and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {periodType === 'daily' ? 'المبلغ اليومي للسهم الواحد:' : 'المبلغ الشهري للسهم الواحد:'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      value={installmentAmount}
                      onChange={(e) =>
                        handleInstallmentOrDurationChange(
                          parseFloat(e.target.value) || 0,
                          duration
                        )
                      }
                      className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums pr-10"
                    />
                    <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-400">
                      ج.م
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    المدة ({periodType === 'daily' ? 'بالأيام' : 'بالشهور'}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) =>
                      handleInstallmentOrDurationChange(
                        installmentAmount,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums"
                  />
                </div>
              </div>

              {/* Automatic Calculation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800">الحساب التلقائي لإجمالي الحوض (القبضة):</span>
                  <div className="text-xs text-emerald-600 mt-0.5">
                    {formatCurrency(installmentAmount)} × {duration} {periodType === 'daily' ? 'يوم' : 'شهر'}
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-900 tabular-nums">
                  {formatCurrency(totalPool)}
                </div>
              </div>

              {/* Start Date and End Date */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>تاريخ بدء الجمعية (أو الإنشاء):</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>تاريخ نهاية الجمعية:</span>
                      </span>
                      {customEndDate && (
                        <button
                          type="button"
                          onClick={() => setCustomEndDate('')}
                          className="text-[10px] text-emerald-700 hover:underline font-normal"
                        >
                          إعادة للحساب التلقائي
                        </button>
                      )}
                    </label>
                    <input
                      type="date"
                      value={customEndDate || autoCalculatedEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Date Summary / Helper Strip */}
                <div className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-400">فترة الجمعية:</span>
                    <strong className="text-slate-800">{formatDateArabic(startDate)}</strong>
                    <span className="text-emerald-500 font-bold">←</span>
                    <strong className="text-emerald-900">{formatDateArabic(effectiveEndDate)}</strong>
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({duration} {periodType === 'daily' ? 'يوم' : 'شهر'})
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات أو شروط (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: التحصيل على فودافون كاش قبل الساعة 9 مساءً"
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('shares')}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>التالي: تخصيص الأسهم والأدوار (الأسهم الفردية والمشتركة)</span>
                  <span className="font-mono">←</span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Shares Management */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">جدول الأدوار والأسهم</h4>
                  <p className="text-xs text-slate-500">
                    حدد المشاركين في كل دور سواء سهم فردي أو سهم مشترك مرن
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSingleShare}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>سهم فردي</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSharedShare}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>سهم مشترك مرن</span>
                  </button>
                </div>
              </div>

              {/* Shares List */}
              <div className="space-y-4">
                {shares.map((share, idx) => (
                  <div key={share.id} className="relative">
                    {share.type === 'single' ? (
                      /* Single Share Card */
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-black flex items-center justify-center">
                              {share.turnIndex}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                دور {share.turnIndex}: سهم فردي
                              </span>
                              <div className="text-[11px] text-slate-500">
                                يقبض الإجمالي كاملاً:{' '}
                                <strong className="text-emerald-700">
                                  {formatCurrency(totalPool)}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {shares.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveShare(share.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                              title="حذف السهم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              اسم المشارك:
                            </label>
                            <input
                              type="text"
                              value={share.member?.name || ''}
                              onChange={(e) =>
                                handleUpdateSingleShare(
                                  share.id,
                                  e.target.value,
                                  share.member?.phone || ''
                                )
                              }
                              placeholder="اسم المشارك"
                              className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              رقم الموبايل:
                            </label>
                            <input
                              type="tel"
                              value={share.member?.phone || ''}
                              onChange={(e) =>
                                handleUpdateSingleShare(
                                  share.id,
                                  share.member?.name || '',
                                  e.target.value
                                )
                              }
                              placeholder="0100 123 4567"
                              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-left dir-ltr"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Flexible Shared Share */
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1.5 px-1">
                          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <span className="w-7 h-7 rounded-xl bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                              {share.turnIndex}
                            </span>
                            <span>دور {share.turnIndex} (سهم مشترك مرن)</span>
                          </span>

                          {shares.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveShare(share.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                              title="حذف هذا السهم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <SharedShareBuilder
                          shareInstallment={installmentAmount}
                          totalPool={totalPool}
                          duration={duration}
                          participants={share.participants || []}
                          onChange={(newParticipants) =>
                            handleUpdateSharedShareParticipants(share.id, newParticipants)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={validateAndSave}
            className="py-2.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وإنشاء الجمعية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

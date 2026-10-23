import React from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Users, Calculator } from 'lucide-react';
import { Participant } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SharedShareBuilderProps {
  shareInstallment: number; // e.g. 100 EGP
  totalPool: number; // e.g. 10,000 EGP
  duration: number; // e.g. 100 days
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
}

export const PRESET_SPLITS = [
  { label: '50% / 50%', count: 2, splits: [50, 50], names: ['المشارك الأول', 'المشارك الثاني'] },
  { label: '60% / 40%', count: 2, splits: [60, 40], names: ['المشارك الأول', 'المشارك الثاني'] },
  { label: '50% / 30% / 20%', count: 3, splits: [50, 30, 20], names: ['المشارك الأول', 'المشارك الثاني', 'المشارك الثالث'] },
  { label: '40% / 30% / 20% / 10%', count: 4, splits: [40, 30, 20, 10], names: ['مشارك 1', 'مشارك 2', 'مشارك 3', 'مشارك 4'] },
  { label: '25% × 4 أشخاص', count: 4, splits: [25, 25, 25, 25], names: ['مشارك 1', 'مشارك 2', 'مشارك 3', 'مشارك 4'] },
  { label: '33.3% × 3 أشخاص', count: 3, splits: [34, 33, 33], names: ['مشارك 1', 'مشارك 2', 'مشارك 3'] },
];

export const SharedShareBuilder: React.FC<SharedShareBuilderProps> = ({
  shareInstallment,
  totalPool,
  duration,
  participants,
  onChange,
}) => {
  const totalPercentage = participants.reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);
  const isValid100 = Math.abs(totalPercentage - 100) < 0.01;
  const remainingPercentage = Math.round((100 - totalPercentage) * 10) / 10;

  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    const updated = participants.map((p) => {
      if (p.id !== id) return p;
      const nextP = { ...p, ...updates };
      // Recalculate financial breakdown
      const pct = Number(nextP.percentage) || 0;
      nextP.installmentAmount = Math.round((pct / 100) * shareInstallment);
      nextP.targetPayout = Math.round((pct / 100) * totalPool);
      return nextP;
    });
    onChange(updated);
  };

  const handleAddParticipant = () => {
    if (participants.length >= 10) return;
    const defaultPct = remainingPercentage > 0 ? remainingPercentage : 10;
    const newP: Participant = {
      id: 'part_' + Math.random().toString(36).substring(2, 9),
      name: `مشارك ${participants.length + 1}`,
      phone: '',
      percentage: defaultPct,
      installmentAmount: Math.round((defaultPct / 100) * shareInstallment),
      targetPayout: Math.round((defaultPct / 100) * totalPool),
      payoutStatus: 'pending',
    };
    onChange([...participants, newP]);
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 2) return; // Keep at least 2 for a shared share
    onChange(participants.filter((p) => p.id !== id));
  };

  const applyPreset = (preset: typeof PRESET_SPLITS[0]) => {
    const newParticipants: Participant[] = preset.splits.map((pct, idx) => ({
      id: participants[idx]?.id || 'part_' + Math.random().toString(36).substring(2, 9),
      name: participants[idx]?.name || preset.names[idx] || `مشارك ${idx + 1}`,
      phone: participants[idx]?.phone || '',
      percentage: pct,
      installmentAmount: Math.round((pct / 100) * shareInstallment),
      targetPayout: Math.round((pct / 100) * totalPool),
      payoutStatus: 'pending',
    }));
    onChange(newParticipants);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-[#FFFBEB] p-4 sm:p-5 shadow-sm space-y-4 text-right">
      {/* Header and status banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-amber-950 flex items-center gap-1.5">
              <span>السهم المشترك المرن</span>
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                {participants.length} أفراد
              </span>
            </h4>
            <p className="text-xs text-amber-800">
              قسم السهم الواحد على 2 لـ 10 أشخاص بنسب مرنة ويحسب قسط وقبض كل شخص تلقائياً.
            </p>
          </div>
        </div>

        {/* Real-time Percentage Indicator Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
            isValid100
              ? 'bg-emerald-600 text-white'
              : totalPercentage > 100
              ? 'bg-red-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {isValid100 ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>مجموع النسب: 100% مكتمل ومطابق ✅</span>
            </>
          ) : totalPercentage > 100 ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>
                المجموع: {totalPercentage}% (تجاوزت بـ {Math.abs(remainingPercentage)}%) ❌
              </span>
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>
                المجموع: {totalPercentage}% (متبقي {remainingPercentage}%) ⚠️
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <label className="block text-xs font-bold text-amber-900 mb-2">
          تقسيمات سريعة جاهزة:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SPLITS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 transition-colors shadow-2xs active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Table / List */}
      <div className="space-y-2.5">
        {participants.map((p, index) => (
          <div
            key={p.id}
            className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-2"
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Member index & name */}
              <div className="col-span-12 sm:col-span-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => handleUpdateParticipant(p.id, { name: e.target.value })}
                  placeholder={`اسم المشارك ${index + 1}`}
                  className="w-full text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Phone (optional) */}
              <div className="col-span-6 sm:col-span-3">
                <input
                  type="tel"
                  value={p.phone || ''}
                  onChange={(e) => handleUpdateParticipant(p.id, { phone: e.target.value })}
                  placeholder="رقم الموبايل (اختياري)"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left dir-ltr"
                />
              </div>

              {/* Percentage input */}
              <div className="col-span-5 sm:col-span-3 flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={p.percentage}
                  onChange={(e) =>
                    handleUpdateParticipant(p.id, { percentage: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 text-center text-xs sm:text-sm font-bold px-2 py-1.5 rounded-lg border border-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                />
                <span className="text-xs font-bold text-amber-950">%</span>
              </div>

              {/* Delete button (if > 2 participants) */}
              <div className="col-span-1 text-left">
                {participants.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="حذف هذا المشارك"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Calculated Breakdown Line */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1.5 border-t border-slate-100 text-slate-600 px-1 bg-slate-50/70 p-1.5 rounded-lg">
              <div>
                <span>قسطه الدوري: </span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(p.installmentAmount)}
                </span>
                <span className="text-[10px] text-slate-500"> ({p.percentage}% من {shareInstallment}ج)</span>
              </div>
              <div>
                <span>مبلغ قبضه عند دوره: </span>
                <span className="font-bold text-amber-900 tabular-nums">
                  {formatCurrency(p.targetPayout)}
                </span>
                <span className="text-[10px] text-slate-500"> ({p.percentage}% من {formatCurrency(totalPool)})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add participant button */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleAddParticipant}
          disabled={participants.length >= 10}
          className="px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشارك إضافي في هذا السهم (حتى 10 أفراد)</span>
        </button>

        <span className="text-xs text-amber-900 font-medium">
          إجمالي قسط السهم: <strong className="text-emerald-800">{formatCurrency(shareInstallment)}</strong>
        </span>
      </div>
    </div>
  );
};

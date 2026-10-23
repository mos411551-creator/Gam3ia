import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle, CreditCard, DollarSign, Wallet, FileText, Sparkles } from 'lucide-react';
import { Gam3eya, Payment, PaymentMethod, Share, Participant } from '../types';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

interface PaymentModalProps {
  gam3eya: Gam3eya;
  preselectedShareId?: string;
  preselectedParticipantId?: string;
  vodafoneNumber: string;
  onClose: () => void;
  onSavePayment: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  gam3eya,
  preselectedShareId,
  preselectedParticipantId,
  vodafoneNumber,
  onClose,
  onSavePayment,
}) => {
  // Flatten all payable members / participants
  const payableOptions: Array<{
    shareId: string;
    participantId?: string;
    name: string;
    type: 'single' | 'shared';
    installment: number;
    turnIndex: number;
    percentage?: number;
  }> = [];

  gam3eya.shares.forEach((share) => {
    if (share.type === 'single') {
      payableOptions.push({
        shareId: share.id,
        name: share.member?.name || 'مشارك فردي',
        type: 'single',
        installment: share.installmentAmount,
        turnIndex: share.turnIndex,
      });
    } else {
      share.participants?.forEach((p) => {
        payableOptions.push({
          shareId: share.id,
          participantId: p.id,
          name: `${p.name} (سهم مشترك ${p.percentage}%)`,
          type: 'shared',
          installment: p.installmentAmount,
          turnIndex: share.turnIndex,
          percentage: p.percentage,
        });
      });
    }
  });

  // Find initial selection
  const initialOption =
    payableOptions.find(
      (opt) =>
        opt.shareId === preselectedShareId &&
        (!preselectedParticipantId || opt.participantId === preselectedParticipantId)
    ) || payableOptions[0];

  const [selectedKey, setSelectedKey] = useState<string>(
    initialOption ? `${initialOption.shareId}_${initialOption.participantId || ''}` : ''
  );

  const currentSelection = payableOptions.find(
    (opt) => `${opt.shareId}_${opt.participantId || ''}` === selectedKey
  ) || payableOptions[0];

  const [amount, setAmount] = useState<number>(currentSelection?.installment || gam3eya.installmentAmount);
  const [method, setMethod] = useState<PaymentMethod>('vodafone_cash');
  const [refNumber, setRefNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const handleSelectionChange = (newKey: string) => {
    setSelectedKey(newKey);
    const opt = payableOptions.find((o) => `${o.shareId}_${o.participantId || ''}` === newKey);
    if (opt) {
      setAmount(opt.installment);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelection || amount <= 0) return;

    const newPayment: Payment = {
      id: 'pay_' + Math.random().toString(36).substring(2, 9),
      gam3eyaId: gam3eya.id,
      shareId: currentSelection.shareId,
      participantId: currentSelection.participantId,
      payerName: currentSelection.name,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      method,
      referenceNumber: refNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    // Celebration Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#065f46', '#E60000', '#F59E0B', '#10B981'],
      });
    } catch {
      // ignore
    }

    onSavePayment(newPayment);
    onClose();
  };

  const isDaily = gam3eya.periodType === 'daily';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isDaily
              ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900'
              : 'bg-gradient-to-r from-emerald-800 to-teal-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <CreditCard
                className={`w-5 h-5 ${isDaily ? 'text-amber-200' : 'text-emerald-200'}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">تسجيل دفعة جديدة</h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isDaily
                      ? 'bg-amber-500/80 text-white border-amber-300/40'
                      : 'bg-emerald-600/80 text-white border-emerald-400/30'
                  }`}
                >
                  {isDaily ? 'يومية' : 'شهرية'}
                </span>
              </div>
              <p
                className={`text-xs ${isDaily ? 'text-amber-100' : 'text-emerald-200'}`}
              >
                {gam3eya.name}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-right">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              المشارك / الدافع:
            </label>
            <select
              value={selectedKey}
              onChange={(e) => handleSelectionChange(e.target.value)}
              className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            >
              {payableOptions.map((opt) => (
                <option
                  key={`${opt.shareId}_${opt.participantId || ''}`}
                  value={`${opt.shareId}_${opt.participantId || ''}`}
                >
                  دور {opt.turnIndex}: {opt.name} — (المستحق: {formatCurrency(opt.installment)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المبلغ المدفوع (ج.م):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums pr-9"
                />
                <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-400">
                  ج.م
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الدفع:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm font-medium p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              طريقة الدفع:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Vodafone Cash */}
              <button
                type="button"
                onClick={() => setMethod('vodafone_cash')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  method === 'vodafone_cash'
                    ? 'border-[#E60000] bg-red-50 text-[#990000] ring-2 ring-red-400 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E60000] text-white flex items-center justify-center text-xs font-black">
                    ’
                  </div>
                  <span className="text-xs">فودافون كاش</span>
                </div>
                {method === 'vodafone_cash' && <CheckCircle className="w-4 h-4 text-[#E60000]" />}
              </button>

              {/* Cash Hand to hand */}
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs">نقدي (كاش يدوي)</span>
                </div>
                {method === 'cash' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* InstaPay */}
              <button
                type="button"
                onClick={() => setMethod('instapay')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  method === 'instapay'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                    iP
                  </div>
                  <span className="text-xs">انستاباي (InstaPay)</span>
                </div>
                {method === 'instapay' && <CheckCircle className="w-4 h-4 text-purple-600" />}
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  method === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs">تحويل بنكي</span>
                </div>
                {method === 'bank_transfer' && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </button>
            </div>
          </div>

          {/* Reference / Transaction ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم العملية أو المرجع (اختياري):
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="مثال: رسالة تأكيد فودافون كاش أو رقم المعاملة"
              className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات إضافية:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: دفعة 3 أيام مقدماً"
              className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Vodafone Cash Quick Notice if Vodafone selected */}
          {method === 'vodafone_cash' && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 flex items-center justify-between">
              <span>رقم المحفظة المعتمد:</span>
              <span className="font-mono font-bold text-red-700 dir-ltr">
                {formatPhoneNumber(vodafoneNumber)}
              </span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isDaily
                  ? 'bg-amber-700 hover:bg-amber-600 shadow-lg shadow-amber-950/20'
                  : 'bg-emerald-800 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20'
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 ${isDaily ? 'text-amber-200' : 'text-emerald-200'}`}
              />
              <span>تأكيد وتسجيل الدفعة ({formatCurrency(amount)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

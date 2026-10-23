import React, { useState } from 'react';
import {
  X,
  CreditCard,
  FileText,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Share2,
  Calendar,
  Sparkles,
  Edit2,
  UserPlus,
  Check,
  AlertTriangle,
  Layers,
  MessageCircle,
} from 'lucide-react';
import { Gam3eya, Share, Participant, Payment, UserSettings } from '../types';
import { VodafoneCashCard } from './VodafoneCashCard';
import { SharedShareBuilder } from './SharedShareBuilder';
import {
  formatCurrency,
  formatDateArabic,
  formatDateTimeArabic,
  getPaymentMethodLabel,
  generateParticipantReminderWhatsAppText,
  getWhatsAppDirectLink,
  getGam3eyaEffectiveEndDate,
  calculateGam3eyaEndDate,
} from '../utils/formatters';

interface Gam3eyaDetailModalProps {
  gam3eya: Gam3eya;
  settings: UserSettings;
  onClose: () => void;
  onOpenPaymentModal: (shareId?: string, participantId?: string) => void;
  onOpenPrintModal: () => void;
  onTogglePayoutStatus: (shareId: string, participantId?: string) => void;
  onDeleteGam3eya: (id: string) => void;
  onUpdateGam3eya?: (updated: Gam3eya) => void;
}

export const Gam3eyaDetailModal: React.FC<Gam3eyaDetailModalProps> = ({
  gam3eya,
  settings,
  onClose,
  onOpenPaymentModal,
  onOpenPrintModal,
  onTogglePayoutStatus,
  onDeleteGam3eya,
  onUpdateGam3eya,
}) => {
  const [activeTab, setActiveTab] = useState<'shares' | 'payments' | 'wallet'>('shares');

  const effectiveEndDate = getGam3eyaEffectiveEndDate(gam3eya);
  const isDaily = gam3eya.periodType === 'daily';

  // Gam3eya info editing state
  const [isEditingGam3eya, setIsEditingGam3eya] = useState(false);
  const [editName, setEditName] = useState(gam3eya.name);
  const [editNotes, setEditNotes] = useState(gam3eya.notes || '');
  const [editStatus, setEditStatus] = useState(gam3eya.status);
  const [editStartDate, setEditStartDate] = useState(gam3eya.startDate || '');
  const [editEndDate, setEditEndDate] = useState(gam3eya.endDate || effectiveEndDate);

  // Add new share / member state
  const [isAddShareOpen, setIsAddShareOpen] = useState(false);
  const [newShareType, setNewShareType] = useState<'single' | 'shared'>('single');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newShareTurn, setNewShareTurn] = useState(gam3eya.shares.length + 1);
  const [newShareLabel, setNewShareLabel] = useState('');
  const [newParticipants, setNewParticipants] = useState<Participant[]>([
    {
      id: 'p_new1',
      name: 'مشارك 1',
      phone: '',
      percentage: 50,
      installmentAmount: Math.round(0.5 * gam3eya.installmentAmount),
      targetPayout: Math.round(0.5 * gam3eya.totalPool),
      payoutStatus: 'pending',
    },
    {
      id: 'p_new2',
      name: 'مشارك 2',
      phone: '',
      percentage: 50,
      installmentAmount: Math.round(0.5 * gam3eya.installmentAmount),
      targetPayout: Math.round(0.5 * gam3eya.totalPool),
      payoutStatus: 'pending',
    },
  ]);

  // Edit existing share state
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [editShareTurn, setEditShareTurn] = useState<number>(1);
  const [editShareMemberName, setEditShareMemberName] = useState('');
  const [editShareMemberPhone, setEditShareMemberPhone] = useState('');
  const [editShareLabel, setEditShareLabel] = useState('');
  const [editShareParticipants, setEditShareParticipants] = useState<Participant[]>([]);
  const [memberErrorMsg, setMemberErrorMsg] = useState<string | null>(null);

  // Dedicated single-participant quick-edit state
  const [editingParticipantTarget, setEditingParticipantTarget] = useState<{
    shareId: string;
    participantId: string;
  } | null>(null);
  const [editPartName, setEditPartName] = useState('');
  const [editPartPhone, setEditPartPhone] = useState('');
  const [editPartPercentage, setEditPartPercentage] = useState<number>(50);
  const [partErrorMsg, setPartErrorMsg] = useState<string | null>(null);

  const handleStartEditParticipant = (shareId: string, p: Participant) => {
    setEditingParticipantTarget({ shareId, participantId: p.id });
    setEditPartName(p.name);
    setEditPartPhone(p.phone || '');
    setEditPartPercentage(p.percentage);
    setPartErrorMsg(null);
  };

  const handleSaveParticipantQuickEdit = (shareId: string, participantId: string) => {
    const share = gam3eya.shares.find((s) => s.id === shareId);
    if (!share || !share.participants) return;

    if (!editPartName.trim()) {
      setPartErrorMsg('يرجى إدخال اسم المشارك');
      return;
    }

    const pct = Number(editPartPercentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setPartErrorMsg('النسبة يجب أن تكون بين 1% و 100%');
      return;
    }

    const otherSum = share.participants
      .filter((p) => p.id !== participantId)
      .reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);
    const newTotal = Math.round((otherSum + pct) * 10) / 10;

    if (Math.abs(newTotal - 100) > 0.01) {
      const needed = Math.max(1, Math.round((100 - otherSum) * 10) / 10);
      setPartErrorMsg(
        `مجموع نسب السهم سيصبح ${newTotal}% بدلاً من 100%. لتكتمل الحصة يجب أن تكون النسبة ${needed}%`
      );
      return;
    }

    const updatedParticipants = share.participants.map((p) => {
      if (p.id !== participantId) return p;
      return {
        ...p,
        name: editPartName.trim(),
        phone: editPartPhone.trim() || undefined,
        percentage: pct,
        installmentAmount: Math.round((pct / 100) * share.installmentAmount),
        targetPayout: Math.round((pct / 100) * share.targetPayout),
      };
    });

    const updatedShares = gam3eya.shares.map((s) =>
      s.id === shareId ? { ...s, participants: updatedParticipants } : s
    );

    if (onUpdateGam3eya) {
      onUpdateGam3eya({
        ...gam3eya,
        shares: updatedShares,
      });
    }

    setEditingParticipantTarget(null);
    setPartErrorMsg(null);
  };

  const handleAutoAdjustRemainingPercentage = (shareId: string, participantId: string) => {
    const share = gam3eya.shares.find((s) => s.id === shareId);
    if (!share || !share.participants) return;
    const otherSum = share.participants
      .filter((p) => p.id !== participantId)
      .reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);
    const balance = Math.max(1, Math.round((100 - otherSum) * 10) / 10);
    setEditPartPercentage(balance);
    setPartErrorMsg(null);
  };

  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const handleSendWhatsAppReminder = (params: {
    name: string;
    phone?: string;
    installment: number;
    paid: number;
  }) => {
    const text = generateParticipantReminderWhatsAppText({
      memberName: params.name,
      gam3eyaName: gam3eya.name,
      requiredAmount: params.installment,
      paidAmount: params.paid,
      vodafoneNumber: settings.vodafoneCashNumber,
      collectorName: settings.collectorName,
      periodType: gam3eya.periodType,
    });

    const url = getWhatsAppDirectLink(params.phone, text);
    window.open(url, '_blank');

    setReminderToast(`تم فتح واتساب وتجهيز رسالة التذكير لـ "${params.name}" بنجاح! 📲`);
    setTimeout(() => {
      setReminderToast(null);
    }, 4000);
  };

  const totalPaid = gam3eya.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = gam3eya.totalPool * gam3eya.shares.length;
  const progressPct = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;

  // Save edited Gam3eya info
  const handleSaveGam3eyaEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (onUpdateGam3eya) {
      onUpdateGam3eya({
        ...gam3eya,
        name: editName.trim(),
        notes: editNotes.trim() || undefined,
        status: editStatus,
        startDate: editStartDate || gam3eya.startDate,
        endDate: editEndDate || effectiveEndDate,
      });
    }
    setIsEditingGam3eya(false);
  };

  // Delete Gam3eya
  const handleDelete = () => {
    if (window.confirm(`هل أنت متأكد من حذف ${gam3eya.name} نهائياً؟`)) {
      onDeleteGam3eya(gam3eya.id);
      onClose();
    }
  };

  // Add new share to active Gam3eya
  const handleOpenAddShare = () => {
    setNewShareTurn(gam3eya.shares.length + 1);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewShareLabel(`سهم مشترك مرن (دور ${gam3eya.shares.length + 1})`);
    setNewParticipants([
      {
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        name: 'المشارك الأول',
        phone: '',
        percentage: 50,
        installmentAmount: Math.round(0.5 * gam3eya.installmentAmount),
        targetPayout: Math.round(0.5 * gam3eya.totalPool),
        payoutStatus: 'pending',
      },
      {
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        name: 'المشارك الثاني',
        phone: '',
        percentage: 50,
        installmentAmount: Math.round(0.5 * gam3eya.installmentAmount),
        targetPayout: Math.round(0.5 * gam3eya.totalPool),
        payoutStatus: 'pending',
      },
    ]);
    setMemberErrorMsg(null);
    setIsAddShareOpen(true);
  };

  const handleSaveNewShare = () => {
    if (newShareType === 'single') {
      if (!newMemberName.trim()) {
        setMemberErrorMsg('يرجى كتابة اسم المشارك');
        return;
      }
      const newShare: Share = {
        id: 'share_' + Math.random().toString(36).substring(2, 9),
        type: 'single',
        turnIndex: Number(newShareTurn) || gam3eya.shares.length + 1,
        member: {
          name: newMemberName.trim(),
          phone: newMemberPhone.trim() || undefined,
        },
        installmentAmount: gam3eya.installmentAmount,
        targetPayout: gam3eya.totalPool,
        payoutStatus: 'pending',
      };

      const updatedShares = [...gam3eya.shares, newShare];
      // Sort by turn index
      updatedShares.sort((a, b) => a.turnIndex - b.turnIndex);

      if (onUpdateGam3eya) {
        onUpdateGam3eya({
          ...gam3eya,
          shares: updatedShares,
        });
      }
    } else {
      // Shared share: check 100%
      const sum = newParticipants.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0);
      if (Math.abs(sum - 100) > 0.01) {
        setMemberErrorMsg(`مجموع نسب المشتركين يجب أن يساوي 100% (المجموع الحالي: ${sum}%)`);
        return;
      }

      const newShare: Share = {
        id: 'share_' + Math.random().toString(36).substring(2, 9),
        type: 'shared',
        turnIndex: Number(newShareTurn) || gam3eya.shares.length + 1,
        shareLabel: newShareLabel.trim() || `سهم مشترك مرن (دور ${newShareTurn})`,
        installmentAmount: gam3eya.installmentAmount,
        targetPayout: gam3eya.totalPool,
        payoutStatus: 'pending',
        participants: newParticipants,
      };

      const updatedShares = [...gam3eya.shares, newShare];
      updatedShares.sort((a, b) => a.turnIndex - b.turnIndex);

      if (onUpdateGam3eya) {
        onUpdateGam3eya({
          ...gam3eya,
          shares: updatedShares,
        });
      }
    }

    setIsAddShareOpen(false);
    setMemberErrorMsg(null);
  };

  // Start editing a share
  const handleStartEditShare = (share: Share) => {
    setEditingShareId(share.id);
    setEditShareTurn(share.turnIndex);
    if (share.type === 'single') {
      setEditShareMemberName(share.member?.name || '');
      setEditShareMemberPhone(share.member?.phone || '');
    } else {
      setEditShareLabel(share.shareLabel || '');
      setEditShareParticipants(share.participants ? JSON.parse(JSON.stringify(share.participants)) : []);
    }
    setMemberErrorMsg(null);
  };

  // Save edited share
  const handleSaveEditShare = (shareId: string) => {
    const existing = gam3eya.shares.find((s) => s.id === shareId);
    if (!existing) return;

    if (existing.type === 'single') {
      if (!editShareMemberName.trim()) {
        setMemberErrorMsg('يرجى إدخال اسم العضو');
        return;
      }

      const updatedShares = gam3eya.shares.map((s) => {
        if (s.id !== shareId) return s;
        return {
          ...s,
          turnIndex: Number(editShareTurn) || s.turnIndex,
          member: {
            name: editShareMemberName.trim(),
            phone: editShareMemberPhone.trim() || undefined,
          },
        };
      });

      updatedShares.sort((a, b) => a.turnIndex - b.turnIndex);

      if (onUpdateGam3eya) {
        onUpdateGam3eya({ ...gam3eya, shares: updatedShares });
      }
    } else {
      // Shared share validation
      const sum = editShareParticipants.reduce((acc, p) => acc + (Number(p.percentage) || 0), 0);
      if (Math.abs(sum - 100) > 0.01) {
        setMemberErrorMsg(`مجموع نسب المشتركين يجب أن يساوي 100% (المجموع الحالي: ${sum}%)`);
        return;
      }

      const updatedShares = gam3eya.shares.map((s) => {
        if (s.id !== shareId) return s;
        return {
          ...s,
          turnIndex: Number(editShareTurn) || s.turnIndex,
          shareLabel: editShareLabel.trim() || s.shareLabel,
          participants: editShareParticipants,
        };
      });

      updatedShares.sort((a, b) => a.turnIndex - b.turnIndex);

      if (onUpdateGam3eya) {
        onUpdateGam3eya({ ...gam3eya, shares: updatedShares });
      }
    }

    setEditingShareId(null);
    setMemberErrorMsg(null);
  };

  // Delete a share
  const handleDeleteShare = (share: Share) => {
    const memberName =
      share.type === 'single' ? share.member?.name || 'مشارك' : share.shareLabel || 'سهم مشترك';

    if (window.confirm(`هل أنت متأكد من حذف دور (${share.turnIndex}) لـ "${memberName}" من الجمعية القائمة؟`)) {
      const filtered = gam3eya.shares.filter((s) => s.id !== share.id);
      // Re-index remaining turns consecutively
      const reindexed = filtered.map((s, idx) => ({ ...s, turnIndex: idx + 1 }));

      if (onUpdateGam3eya) {
        onUpdateGam3eya({
          ...gam3eya,
          shares: reindexed,
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-3 ${
            isDaily
              ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900'
              : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <Users
                className={`w-6 h-6 ${isDaily ? 'text-amber-200' : 'text-emerald-200'}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{gam3eya.name}</h3>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    isDaily
                      ? 'bg-amber-500/85 text-white border-amber-300/40'
                      : 'bg-emerald-600/80 text-white border-emerald-400/30'
                  }`}
                >
                  {isDaily ? '⚡ جمعية يومية' : '🗓️ جمعية شهرية'}
                </span>
              </div>
              <div
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1 ${
                  isDaily ? 'text-amber-100' : 'text-emerald-100'
                }`}
              >
                <span>المدة: <strong>{gam3eya.duration} {isDaily ? 'يوم' : 'شهر'}</strong></span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className={`w-3.5 h-3.5 ${isDaily ? 'text-amber-300' : 'text-emerald-300'}`} />
                  <span>البدء:</span>
                  <strong>{formatDateArabic(gam3eya.startDate)}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className={`w-3.5 h-3.5 ${isDaily ? 'text-amber-300' : 'text-emerald-300'}`} />
                  <span>النهاية:</span>
                  <strong>{formatDateArabic(effectiveEndDate)}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingGam3eya(!isEditingGam3eya)}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 font-bold text-xs flex items-center gap-1.5 text-white transition-all border border-white/20"
              title="تعديل اسم أو مواعيد أو شروط الجمعية"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingGam3eya ? 'إلغاء التعديل' : 'تعديل الجمعية'}</span>
            </button>

            <button
              onClick={() => onOpenPaymentModal()}
              className={`py-2 px-3.5 rounded-xl bg-white active:scale-95 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                isDaily ? 'text-amber-950 hover:bg-amber-50' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${isDaily ? 'text-amber-700' : 'text-emerald-700'}`} />
              <span>تسجيل دفع</span>
            </button>

            <button
              onClick={onOpenPrintModal}
              className={`py-2 px-3.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all active:scale-95 ${
                isDaily ? 'bg-amber-900/80 hover:bg-amber-900' : 'bg-emerald-900/80 hover:bg-emerald-900'
              }`}
            >
              <FileText className={`w-4 h-4 ${isDaily ? 'text-amber-300' : 'text-emerald-300'}`} />
              <span>كشف حساب PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Edit Gam3eya Info Bar */}
        {isEditingGam3eya && (
          <form
            onSubmit={handleSaveGam3eyaEdit}
            className={`p-4 border-b text-right space-y-3 animate-in fade-in ${
              isDaily
                ? 'bg-amber-50/90 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDaily ? 'text-amber-950' : 'text-emerald-950'}`}>اسم الجمعية:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full text-xs font-bold p-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    isDaily
                      ? 'border-amber-300 focus:ring-amber-500'
                      : 'border-emerald-300 focus:ring-emerald-600'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDaily ? 'text-amber-950' : 'text-emerald-950'}`}>حالة الجمعية:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'completed')}
                  className={`w-full text-xs font-bold p-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    isDaily
                      ? 'border-amber-300 focus:ring-amber-500'
                      : 'border-emerald-300 focus:ring-emerald-600'
                  }`}
                >
                  <option value="active">نشطة وجارية</option>
                  <option value="completed">مكتملة</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDaily ? 'text-amber-950' : 'text-emerald-950'}`}>تاريخ البدء / الإنشاء:</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className={`w-full text-xs font-bold p-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    isDaily
                      ? 'border-amber-300 focus:ring-amber-500'
                      : 'border-emerald-300 focus:ring-emerald-600'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDaily ? 'text-amber-950' : 'text-emerald-950'}`}>تاريخ نهاية الجمعية:</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className={`w-full text-xs font-bold p-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    isDaily
                      ? 'border-amber-300 focus:ring-amber-500'
                      : 'border-emerald-300 focus:ring-emerald-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDaily ? 'text-amber-950' : 'text-emerald-950'}`}>ملاحظات وشروط:</label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="ملاحظات أو مواعيد خاصة"
                className={`w-full text-xs font-medium p-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                  isDaily
                    ? 'border-amber-300 focus:ring-amber-500'
                    : 'border-emerald-300 focus:ring-emerald-600'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingGam3eya(false)}
                className="py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className={`py-1.5 px-4 rounded-lg text-white text-xs font-bold shadow-sm ${
                  isDaily ? 'bg-amber-700 hover:bg-amber-600' : 'bg-emerald-800 hover:bg-emerald-700'
                }`}
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}

        {/* Quick KPI Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-right">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">إجمالي الحوض (القبضة):</span>
            <span
              className={`text-base font-extrabold tabular-nums ${
                isDaily ? 'text-amber-950' : 'text-emerald-800'
              }`}
            >
              {formatCurrency(gam3eya.totalPool)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">القسط الدوري للسهم:</span>
            <span className="text-base font-bold text-slate-800 tabular-nums">
              {formatCurrency(gam3eya.installmentAmount)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">المحصل حتى الآن:</span>
            <span
              className={`text-base font-bold tabular-nums ${
                isDaily ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(totalPaid)}
            </span>
            <span className="text-[10px] text-slate-400 block">({progressPct}% من المستهدف)</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">الأسهم والأدوار:</span>
            <span className="text-base font-bold text-slate-900">
              {gam3eya.shares.length} أدوار
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 font-semibold block">سريان الجمعية:</span>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
              <span>{formatDateArabic(gam3eya.startDate)}</span>
              <span className={`font-bold ${isDaily ? 'text-amber-600' : 'text-emerald-600'}`}>←</span>
              <span className={isDaily ? 'text-amber-950' : 'text-emerald-900'}>{formatDateArabic(effectiveEndDate)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2">
          <button
            onClick={() => setActiveTab('shares')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'shares'
                ? isDaily
                  ? 'border-amber-600 text-amber-900'
                  : 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>جدول الأدوار والأسهم ({gam3eya.shares.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? isDaily
                  ? 'border-amber-600 text-amber-900'
                  : 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>سجل المدفوعات ({gam3eya.payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-red-600 text-[#990000]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#E60000]" />
            <span>محفظة فودافون كاش</span>
          </button>
        </div>

        {/* Reminder Toast Notification */}
        {reminderToast && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/60 text-[#075e29] text-xs font-bold flex items-center justify-between gap-2 shadow-2xs animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{reminderToast}</span>
            </div>
            <button
              onClick={() => setReminderToast(null)}
              className="text-[#075e29] hover:opacity-75 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-right">
          {activeTab === 'shares' && (
            <div className="space-y-4">
              {/* Member Controls Header with prominent 'Add Member' button */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border ${
                  isDaily
                    ? 'bg-amber-50/70 border-amber-200/80'
                    : 'bg-emerald-50/70 border-emerald-200/80'
                }`}
              >
                <div>
                  <h4
                    className={`text-sm font-bold flex items-center gap-1.5 ${
                      isDaily ? 'text-amber-950' : 'text-emerald-950'
                    }`}
                  >
                    <span>إدارة أعضاء الجمعية الحالية</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isDaily
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {gam3eya.shares.length} أسهم
                    </span>
                  </h4>
                  <p
                    className={`text-xs ${
                      isDaily ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    يمكنك إضافة أعضاء جدد، تعديل بياناتهم أو أدوارهم، أو حذف أي دور حتى والجمعية قائمة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddShare}
                  className={`py-2 px-3.5 rounded-xl active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                    isDaily
                      ? 'bg-amber-700 hover:bg-amber-600 shadow-amber-900/10'
                      : 'bg-emerald-800 hover:bg-emerald-700 shadow-emerald-900/10'
                  }`}
                >
                  <UserPlus
                    className={`w-4 h-4 ${isDaily ? 'text-amber-200' : 'text-emerald-200'}`}
                  />
                  <span>+ إضافة عضو / دور جديد</span>
                </button>
              </div>

              {/* Shares Listing */}
              <div className="space-y-3.5">
                {gam3eya.shares.map((share, idx) => {
                  const turnNum = share.turnIndex || idx + 1;
                  const isCurrentEditing = editingShareId === share.id;

                  // Render inline editing view if active for this share
                  if (isCurrentEditing) {
                    return (
                      <div
                        key={share.id}
                        className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 shadow-md space-y-4 animate-in fade-in text-right"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                          <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                            <Edit2 className="w-4 h-4 text-emerald-700" />
                            <span>تعديل بيانات دور ({turnNum}): {share.type === 'single' ? 'سهم فردي' : 'سهم مشترك مرن'}</span>
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-800">
                            القسط: {formatCurrency(share.installmentAmount)}
                          </span>
                        </div>

                        {memberErrorMsg && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{memberErrorMsg}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              رقم الدور:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editShareTurn}
                              onChange={(e) => setEditShareTurn(parseInt(e.target.value) || 1)}
                              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                          </div>

                          {share.type === 'single' ? (
                            <>
                              <div className="sm:col-span-5">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  اسم العضو المشارك:
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editShareMemberName}
                                  onChange={(e) => setEditShareMemberName(e.target.value)}
                                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                              </div>
                              <div className="sm:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  رقم الموبايل:
                                </label>
                                <input
                                  type="tel"
                                  value={editShareMemberPhone}
                                  onChange={(e) => setEditShareMemberPhone(e.target.value)}
                                  placeholder="0100 123 4567"
                                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-left dir-ltr"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="sm:col-span-9">
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                تسمية السهم المشترك:
                              </label>
                              <input
                                type="text"
                                value={editShareLabel}
                                onChange={(e) => setEditShareLabel(e.target.value)}
                                placeholder="مثال: سهم الشباب المشترك"
                                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                              />
                            </div>
                          )}
                        </div>

                        {/* If shared share, render flexible participant builder */}
                        {share.type === 'shared' && (
                          <div className="pt-2">
                            <SharedShareBuilder
                              shareInstallment={gam3eya.installmentAmount}
                              totalPool={gam3eya.totalPool}
                              duration={gam3eya.duration}
                              participants={editShareParticipants}
                              onChange={(updatedParts) => setEditShareParticipants(updatedParts)}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                          <button
                            type="button"
                            onClick={() => handleDeleteShare(share)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف هذا الدور</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingShareId(null);
                                setMemberErrorMsg(null);
                              }}
                              className="py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditShare(share.id)}
                              className="py-1.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>حفظ تعديلات العضو</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (share.type === 'single') {
                    const paidForShare = gam3eya.payments
                      .filter((p) => p.shareId === share.id)
                      .reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <div
                        key={share.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white text-sm font-black flex items-center justify-center shrink-0">
                              {turnNum}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-slate-900">
                                  {share.member?.name || 'مشارك'}
                                </h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  سهم فردي
                                </span>
                                {share.member?.phone && (
                                  <span className="text-[11px] text-slate-400 font-mono dir-ltr">
                                    {share.member.phone}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500">
                                القسط: {formatCurrency(share.installmentAmount)} · يقبض:{' '}
                                <strong className="text-emerald-800">
                                  {formatCurrency(share.targetPayout)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Actions for this single share */}
                          <div className="flex items-center gap-1.5">
                            {/* Payout toggle button */}
                            <button
                              type="button"
                              onClick={() => onTogglePayoutStatus(share.id)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                share.payoutStatus === 'collected'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {share.payoutStatus === 'collected'
                                  ? 'تم تسليم القبضة ✅'
                                  : 'لم يقبض بعد'}
                              </span>
                            </button>

                            {/* Pay button */}
                            <button
                              type="button"
                              onClick={() => onOpenPaymentModal(share.id)}
                              className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>دفع</span>
                            </button>

                            {/* WhatsApp Reminder button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleSendWhatsAppReminder({
                                  name: share.member?.name || 'مشارك',
                                  phone: share.member?.phone,
                                  installment: share.installmentAmount,
                                  paid: paidForShare,
                                })
                              }
                              className="py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                              title="إرسال تذكير سداد تلقائي عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>تذكير</span>
                            </button>

                            {/* Edit button */}
                            <button
                              type="button"
                              onClick={() => handleStartEditShare(share)}
                              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-800 transition-colors"
                              title="تعديل بيانات العضو أو دوره"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteShare(share)}
                              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="حذف هذا الدور من الجمعية"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar for single share */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span>
                            مدفوع حتى الآن:{' '}
                            <strong className="text-emerald-800 font-bold tabular-nums">
                              {formatCurrency(paidForShare)}
                            </strong>{' '}
                            / {formatCurrency(share.targetPayout)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {share.targetPayout > 0
                              ? Math.round((paidForShare / share.targetPayout) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    /* Flexible Shared Share Display */
                    return (
                      <div
                        key={share.id}
                        className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 bg-[#FFFBEB] shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-amber-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                              {turnNum}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-amber-950">
                                  {share.shareLabel || `سهم مشترك مرن (دور ${turnNum})`}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                                  سهم مشترك مرن ({share.participants?.length || 0} أفراد)
                                </span>
                              </div>
                              <span className="text-xs text-amber-800">
                                إجمالي السهم: {formatCurrency(share.installmentAmount)} · إجمالي
                                القبضة: {formatCurrency(share.targetPayout)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditShare(share)}
                              className="py-1 px-2.5 rounded-lg text-xs font-bold bg-white text-amber-900 hover:bg-amber-100 border border-amber-300 flex items-center gap-1 transition-colors"
                              title="تعديل السهم المشترك ونسب المشاركين"
                            >
                              <Edit2 className="w-3 h-3 text-amber-700" />
                              <span>تعديل السهم والنسب</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteShare(share)}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                              title="حذف هذا السهم المشترك كاملاً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Participant Rows */}
                        <div className="space-y-2">
                          {share.participants?.map((p) => {
                            const isEditingThisPart =
                              editingParticipantTarget?.shareId === share.id &&
                              editingParticipantTarget?.participantId === p.id;

                            const paidForPart = gam3eya.payments
                              .filter(
                                (pay) => pay.shareId === share.id && pay.participantId === p.id
                              )
                              .reduce((sum, pay) => sum + pay.amount, 0);

                            if (isEditingThisPart) {
                              const otherSum =
                                share.participants
                                  ?.filter((item) => item.id !== p.id)
                                  .reduce((sum, item) => sum + (Number(item.percentage) || 0), 0) ||
                                0;
                              const currentTotal =
                                Math.round((otherSum + Number(editPartPercentage)) * 10) / 10;
                              const is100 = Math.abs(currentTotal - 100) < 0.01;
                              const targetBalance = Math.max(
                                1,
                                Math.round((100 - otherSum) * 10) / 10
                              );

                              return (
                                <div
                                  key={p.id}
                                  className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-400 shadow-sm space-y-3 animate-in fade-in"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                      <Edit2 className="w-3.5 h-3.5 text-amber-800" />
                                      <span>تعديل اسم أو نسبة المشارك: {p.name}</span>
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                                      سهم دور {turnNum}
                                    </span>
                                  </div>

                                  {partErrorMsg && (
                                    <div className="p-2 rounded-xl bg-red-100 text-red-800 text-xs font-bold">
                                      {partErrorMsg}
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                                    <div className="sm:col-span-5">
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        اسم المشارك:
                                      </label>
                                      <input
                                        type="text"
                                        required
                                        value={editPartName}
                                        onChange={(e) => setEditPartName(e.target.value)}
                                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      />
                                    </div>

                                    <div className="sm:col-span-4">
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        رقم الموبايل:
                                      </label>
                                      <input
                                        type="tel"
                                        value={editPartPhone}
                                        onChange={(e) => setEditPartPhone(e.target.value)}
                                        placeholder="0100 123 4567"
                                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-left dir-ltr"
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        نسبة المساهمة %:
                                      </label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min="1"
                                          max="100"
                                          value={editPartPercentage}
                                          onChange={(e) =>
                                            setEditPartPercentage(parseFloat(e.target.value) || 0)
                                          }
                                          className="w-full text-xs font-bold p-2.5 text-center rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                                        />
                                        <span className="text-xs font-bold text-amber-950">%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Percentage balance indicator & Auto-balance button */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-xl border border-amber-200 text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-slate-600">
                                        مجموع نسب السهم:
                                      </span>
                                      <span
                                        className={`font-bold ${
                                          is100 ? 'text-emerald-700' : 'text-red-600'
                                        }`}
                                      >
                                        {currentTotal}% {is100 ? '✅ (مطابق 100%)' : '❌ (غير مكتمل)'}
                                      </span>
                                    </div>

                                    {!is100 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleAutoAdjustRemainingPercentage(share.id, p.id)
                                        }
                                        className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors border border-amber-300"
                                      >
                                        اضغط للضبط التلقائي لـ {targetBalance}% ليكتمل 100%
                                      </button>
                                    )}
                                  </div>

                                  {/* Recalculated values preview */}
                                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 px-1">
                                    <span>
                                      القسط الدوري المحسوب:{' '}
                                      <strong className="text-emerald-800 font-bold">
                                        {formatCurrency(
                                          Math.round(
                                            ((Number(editPartPercentage) || 0) / 100) *
                                              share.installmentAmount
                                          )
                                        )}
                                      </strong>
                                    </span>
                                    <span>
                                      مبلغ القبض المحسوب:{' '}
                                      <strong className="text-amber-900 font-bold">
                                        {formatCurrency(
                                          Math.round(
                                            ((Number(editPartPercentage) || 0) / 100) *
                                              share.targetPayout
                                          )
                                        )}
                                      </strong>
                                    </span>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingParticipantTarget(null);
                                        setPartErrorMsg(null);
                                      }}
                                      className="py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveParticipantQuickEdit(share.id, p.id)}
                                      className="py-1.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>حفظ التعديل</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={p.id}
                                className="p-3 rounded-xl bg-white border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs hover:border-amber-300 transition-all shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                                    {p.percentage}%
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <strong className="text-slate-900 text-sm block">
                                        {p.name}
                                      </strong>
                                      {/* Edit button placed right beside participant's name */}
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditParticipant(share.id, p)}
                                        className="py-0.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 border border-amber-300/80 transition-colors"
                                        title="تعديل اسم المشارك أو نسبة مساهمته"
                                      >
                                        <Edit2 className="w-3 h-3 text-amber-700" />
                                        <span>تعديل</span>
                                      </button>
                                    </div>
                                    <span className="text-slate-500 text-[11px] mt-0.5 block">
                                      قسطه: {formatCurrency(p.installmentAmount)} · قبضه:{' '}
                                      <strong className="text-amber-900">
                                        {formatCurrency(p.targetPayout)}
                                      </strong>
                                      {p.phone && (
                                        <span className="text-slate-400 font-mono mr-2">
                                          ({p.phone})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Paid so far */}
                                  <div className="text-left text-[11px] text-slate-500 pl-2">
                                    <span>مدفوع: </span>
                                    <strong className="text-emerald-700 font-bold tabular-nums">
                                      {formatCurrency(paidForPart)}
                                    </strong>
                                  </div>

                                  {/* Participant Payout Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => onTogglePayoutStatus(share.id, p.id)}
                                    className={`py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
                                      p.payoutStatus === 'collected'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {p.payoutStatus === 'collected' ? 'قبض ✅' : 'لم يقبض'}
                                  </button>

                                  {/* Dedicated Pay Button for this participant */}
                                  <button
                                    type="button"
                                    onClick={() => onOpenPaymentModal(share.id, p.id)}
                                    className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>دفع</span>
                                  </button>

                                  {/* WhatsApp Reminder Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSendWhatsAppReminder({
                                        name: p.name,
                                        phone: p.phone,
                                        installment: p.installmentAmount,
                                        paid: paidForPart,
                                      })
                                    }
                                    className="py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                                    title="إرسال تذكير سداد جاهز عبر واتساب"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>تذكير</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">سجل المدفوعات المسجلة</h4>
                  <p className="text-xs text-slate-500">
                    كل دفعة مسجلة بالاسم والتاريخ وطريقة الدفع
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPaymentModal()}
                  className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل دفعة جديدة</span>
                </button>
              </div>

              {gam3eya.payments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-bold">لا توجد مدفوعات مسجلة بعد</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    اضغط زر "تسجيل دفعة" لإضافة تحصيل جديد
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {gam3eya.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                            p.method === 'vodafone_cash'
                              ? 'bg-red-100 text-[#E60000]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.method === 'vodafone_cash' ? '’' : '✓'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 text-sm">{p.payerName}</strong>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                p.method === 'vodafone_cash'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {getPaymentMethodLabel(p.method)}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                            {formatDateTimeArabic(p.date)}
                            {p.referenceNumber && ` · م/ ${p.referenceNumber}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-base font-black text-emerald-800 tabular-nums">
                          +{formatCurrency(p.amount)}
                        </span>
                        {p.notes && (
                          <span className="block text-[11px] text-slate-500 font-normal">
                            {p.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <VodafoneCashCard
                phoneNumber={settings.vodafoneCashNumber}
                collectorName={settings.collectorName}
                defaultAmount={gam3eya.installmentAmount}
              />

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900">إرشادات التحويل للمشاركين:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>
                    يمكن للمشارك فتح لوحة الاتصال وطلب الكود المختصر مباشرة للتحويل.
                  </li>
                  <li>
                    بعد إتمام التحويل، يُرجى إرسال لقطة شاشة أو رقم المعاملة لتسجيلها في النظام.
                  </li>
                  <li>
                    تأكد دائماً من مطابقة اسم المستلم ({settings.collectorName}) قبل تأكيد كود المحفظة.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-3 rounded-xl transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف هذه الجمعية بالكامل</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Sub-Modal: Add Member / Share to Active Gam3eya */}
      {isAddShareOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] text-right">
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-200" />
                <h4 className="text-sm font-bold">إضافة عضو / دور جديد للجمعية القائمة</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddShareOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {memberErrorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {memberErrorMsg}
                </div>
              )}

              {/* Share Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع السهم:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewShareType('single')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      newShareType === 'single'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">سهم فردي (شخص واحد)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewShareType('shared')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      newShareType === 'shared'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">سهم مشترك مرن (2 لـ 10)</span>
                  </button>
                </div>
              </div>

              {/* Turn Index */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الدور في الترتيب:
                </label>
                <input
                  type="number"
                  min="1"
                  value={newShareTurn}
                  onChange={(e) => setNewShareTurn(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {newShareType === 'single' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم العضو الجديد:
                    </label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="مثال: عمر خالد"
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الموبايل (اختياري):
                    </label>
                    <input
                      type="tel"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="0100 123 4567"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-left dir-ltr"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تسمية السهم المشترك:
                    </label>
                    <input
                      type="text"
                      value={newShareLabel}
                      onChange={(e) => setNewShareLabel(e.target.value)}
                      placeholder="مثال: سهم الشباب المشترك"
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <SharedShareBuilder
                    shareInstallment={gam3eya.installmentAmount}
                    totalPool={gam3eya.totalPool}
                    duration={gam3eya.duration}
                    participants={newParticipants}
                    onChange={(updated) => setNewParticipants(updated)}
                  />
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddShareOpen(false)}
                className="py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSaveNewShare}
                className="py-2 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>إضافة العضو للجمعية فوراً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

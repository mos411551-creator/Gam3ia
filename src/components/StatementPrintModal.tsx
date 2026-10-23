import React from 'react';
import { X, Printer, Share2, Download, FileText, CheckCircle2, Phone, Calendar, FileSpreadsheet } from 'lucide-react';
import { Gam3eya, UserSettings } from '../types';
import {
  formatCurrency,
  formatDateArabic,
  formatDateTimeArabic,
  formatPhoneNumber,
  getPaymentMethodLabel,
  generateWhatsAppShareText,
  exportGam3eyaToExcel,
  exportGam3eyaToCSV,
  getGam3eyaEffectiveEndDate,
} from '../utils/formatters';

interface StatementPrintModalProps {
  gam3eya: Gam3eya;
  settings: UserSettings;
  onClose: () => void;
}

export const StatementPrintModal: React.FC<StatementPrintModalProps> = ({
  gam3eya,
  settings,
  onClose,
}) => {
  const effectiveEndDate = getGam3eyaEffectiveEndDate(gam3eya);
  const isDaily = gam3eya.periodType === 'daily';
  const totalPaid = gam3eya.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = gam3eya.totalPool * gam3eya.shares.length;
  const progressPct = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportGam3eyaToExcel(gam3eya, settings);
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppShareText(gam3eya, settings.vodafoneCashNumber);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleExportCSV = () => {
    exportGam3eyaToCSV(gam3eya);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">كشف حساب رسمي: {gam3eya.name}</h3>
              <p className="text-[11px] text-slate-400">جاهز للطباعة وتنزيل PDF وتصدير Excel والمشاركة</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40 shadow-sm transition-all active:scale-95"
              title="تنزيل كشف حساب متكامل كملف Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير كشف الحساب كـ Excel</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="py-1.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-right font-sans" id="printable-statement">
          {/* Document Header */}
          <div className="border-b-2 border-emerald-900 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-950">
                  جمعيتي - Gam3ety
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  كشف حساب معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500">
                منظومة إدارة وتحصيل الجمعيات المالية والأسهم المشتركة
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <div>
                  أمين الصندوق: <strong>{settings.collectorName}</strong>
                </div>
                <div>
                  رقم فودافون كاش المعتمد للتحصيل:{' '}
                  <strong className="font-mono text-emerald-800 dir-ltr inline-block">
                    {formatPhoneNumber(settings.vodafoneCashNumber)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="text-left text-xs text-slate-500 space-y-1">
              <div>
                تاريخ الإصدار:{' '}
                <strong className="text-slate-800">
                  {formatDateArabic(new Date().toISOString())}
                </strong>
              </div>
              <div>
                حالة الجمعية:{' '}
                <strong className="text-emerald-700">
                  {gam3eya.status === 'active' ? 'نشطة وجارية' : 'مكتملة'}
                </strong>
              </div>
              <div>
                رقم الجمعية: <span className="font-mono text-slate-700">{gam3eya.id}</span>
              </div>
            </div>
          </div>

          {/* Gam3eya Overview Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">اسم ونوع الجمعية</span>
              <strong className="text-base text-slate-900 block mt-0.5">{gam3eya.name}</strong>
              <span
                className={`inline-block text-[10px] font-black px-2 py-0.5 mt-1 rounded-md border ${
                  isDaily
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}
              >
                {isDaily ? '⚡ جمعية يومية' : '🗓️ جمعية شهرية'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold block">
                {isDaily ? 'القسط اليومي للسهم' : 'القسط الشهري للسهم'}
              </span>
              <strong
                className={`text-base block mt-0.5 tabular-nums ${
                  isDaily ? 'text-amber-950' : 'text-emerald-800'
                }`}
              >
                {formatCurrency(gam3eya.installmentAmount)}
              </strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold block">
                إجمالي الحوض (القبضة)
              </span>
              <strong
                className={`text-base block mt-0.5 tabular-nums ${
                  isDaily ? 'text-amber-950' : 'text-emerald-800'
                }`}
              >
                {formatCurrency(gam3eya.totalPool)}
              </strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold block">المدة المقررة</span>
              <strong className="text-base text-slate-900 block mt-0.5">
                {gam3eya.duration} {isDaily ? 'يوم' : 'شهر'}
              </strong>
            </div>
          </div>

          {/* Gam3eya Timeline / Dates Strip */}
          <div
            className={`rounded-2xl p-3.5 sm:p-4 border flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800 ${
              isDaily
                ? 'bg-amber-50/80 border-amber-200/90'
                : 'bg-emerald-50/80 border-emerald-200/90'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar
                className={`w-4 h-4 shrink-0 ${
                  isDaily ? 'text-amber-800' : 'text-emerald-800'
                }`}
              />
              <span>
                تاريخ بدء الجمعية / الإنشاء:{' '}
                <strong className="text-slate-900 font-bold">{formatDateArabic(gam3eya.startDate)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-bold hidden sm:inline ${
                  isDaily ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                ←
              </span>
              <span>
                تاريخ نهاية الجمعية المقررة:{' '}
                <strong
                  className={`font-black ${
                    isDaily ? 'text-amber-950' : 'text-emerald-950'
                  }`}
                >
                  {formatDateArabic(effectiveEndDate)}
                </strong>
              </span>
              <span className="text-slate-500 text-[11px]">
                ({gam3eya.duration} {isDaily ? 'يوم' : 'شهر'})
              </span>
            </div>
          </div>

          {/* Collection Progress Bar */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                إجمالي المبالغ المسددة:{' '}
                <strong className="text-emerald-900 font-bold tabular-nums">
                  {formatCurrency(totalPaid)}
                </strong>{' '}
                من المستهدف:{' '}
                <strong className="text-slate-800 tabular-nums">
                  {formatCurrency(totalExpected)}
                </strong>
              </span>
            </div>
            <div className="font-bold text-emerald-800">نسبة التحصيل: {progressPct}%</div>
          </div>

          {/* Shares Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>بيان الأدوار والأسهم (الفردية والمشتركة)</span>
              <span className="text-xs text-slate-500 font-normal">
                إجمالي الأسهم: {gam3eya.shares.length} أسهم
              </span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">رقم الدور</th>
                    <th className="py-2.5 px-3">نوع السهم</th>
                    <th className="py-2.5 px-3">اسم المشارك</th>
                    <th className="py-2.5 px-3 text-center">النسبة %</th>
                    <th className="py-2.5 px-3">القسط الدوري</th>
                    <th className="py-2.5 px-3">مبلغ القبض</th>
                    <th className="py-2.5 px-3">إجمالي المسدد</th>
                    <th className="py-2.5 px-3 text-center">حالة القبض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {gam3eya.shares.map((share, idx) => {
                    const turnNum = share.turnIndex || idx + 1;
                    if (share.type === 'single') {
                      const paid = gam3eya.payments
                        .filter((p) => p.shareId === share.id)
                        .reduce((sum, p) => sum + p.amount, 0);

                      return (
                        <tr key={share.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-emerald-900">
                            دور {turnNum}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">سهم فردي</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {share.member?.name || 'مشارك'}
                            {share.member?.phone && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {share.member.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">100%</td>
                          <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-800">
                            {formatCurrency(share.installmentAmount)}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-emerald-900">
                            {formatCurrency(share.targetPayout)}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-slate-900">
                            {formatCurrency(paid)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {share.payoutStatus === 'collected' ? (
                              <span className="text-emerald-700 font-bold">✅ تم الاستلام</span>
                            ) : (
                              <span className="text-slate-500">⏳ جاري التحصيل</span>
                            )}
                          </td>
                        </tr>
                      );
                    } else {
                      /* Shared Share breakdown rows */
                      return share.participants?.map((p, pIdx) => {
                        const paid = gam3eya.payments
                          .filter((pay) => pay.shareId === share.id && pay.participantId === p.id)
                          .reduce((sum, pay) => sum + pay.amount, 0);

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-amber-50/40 ${
                              pIdx === 0 ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-bold text-amber-900">
                              {pIdx === 0 ? `دور ${turnNum}` : ''}
                            </td>
                            <td className="py-2.5 px-3 text-amber-800 font-medium">
                              {pIdx === 0 ? 'سهم مشترك مرن' : ''}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              <span className="inline-block text-amber-700 ml-1">↳</span>
                              {p.name}
                              {p.phone && (
                                <span className="block text-[10px] text-slate-400 font-mono mr-3">
                                  {p.phone}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-900">
                              {p.percentage}%
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-800">
                              {formatCurrency(p.installmentAmount)}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-bold text-amber-900">
                              {formatCurrency(p.targetPayout)}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-bold text-slate-900">
                              {formatCurrency(paid)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {p.payoutStatus === 'collected' ? (
                                <span className="text-emerald-700 font-bold">✅ تم الاستلام</span>
                              ) : (
                                <span className="text-slate-500">⏳ جاري التحصيل</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Log Section */}
          <div className="space-y-3 page-break-inside-avoid">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>سجل الحركات والمدفوعات المسجلة ({gam3eya.payments.length})</span>
              <span className="text-xs text-slate-500 font-normal">
                التحصيل عبر فودافون كاش والنقدي
              </span>
            </h4>

            {gam3eya.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center border rounded-xl">
                لم يتم تسجيل دفعات بعد في هذه الجمعية.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="py-2 px-3">التاريخ والوقت</th>
                      <th className="py-2 px-3">اسم الدافع</th>
                      <th className="py-2 px-3">طريقة الدفع</th>
                      <th className="py-2 px-3">المبلغ</th>
                      <th className="py-2 px-3">رقم العملية / المرجع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gam3eya.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600 font-mono">
                          {formatDateTimeArabic(p.date)}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{p.payerName}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.method === 'vodafone_cash'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {getPaymentMethodLabel(p.method)}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-800 tabular-nums">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono">
                          {p.referenceNumber || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Official Signatures Footer (Visible in print) */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 page-break-inside-avoid">
            <div>
              <p className="font-semibold text-slate-700">توقيع أمين الصندوق / المسؤول:</p>
              <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mt-2" />
              <p className="mt-1 text-[11px]">{settings.collectorName}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">ختم / اعتماد الجمعية:</p>
              <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mt-2" />
              <p className="mt-1 text-[11px]">جمعيتي - Gam3ety</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

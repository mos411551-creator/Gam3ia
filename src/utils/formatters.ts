import * as XLSX from 'xlsx';
import { Gam3eya, Payment, Share, UserSettings } from '../types';

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '0 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 0,
  }).format(amount) + ' ج.م';
};

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('ar-EG').format(num);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const formatDateArabic = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Calculates the estimated completion/end date of a Gam3eya
export const calculateGam3eyaEndDate = (
  startDate: string,
  duration: number,
  periodType: 'daily' | 'monthly'
): string => {
  if (!startDate) return '';
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return '';

  if (periodType === 'daily') {
    d.setDate(d.getDate() + (Number(duration) || 0));
  } else {
    d.setMonth(d.getMonth() + (Number(duration) || 0));
  }
  return d.toISOString().slice(0, 10);
};

// Returns effective end date (either explicitly saved or calculated)
export const getGam3eyaEffectiveEndDate = (gam3eya: {
  startDate: string;
  duration: number;
  periodType: 'daily' | 'monthly';
  endDate?: string;
}): string => {
  if (gam3eya.endDate) return gam3eya.endDate;
  return calculateGam3eyaEndDate(gam3eya.startDate, gam3eya.duration, gam3eya.periodType);
};

export const formatDateTimeArabic = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'vodafone_cash':
      return 'فودافون كاش';
    case 'cash':
      return 'كاش نقدي';
    case 'instapay':
      return 'انستاباي (InstaPay)';
    case 'bank_transfer':
      return 'تحويل بنكي';
    default:
      return method;
  }
};

export const getUSSDCode = (phoneNumber: string, amount?: number): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (amount && amount > 0) {
    return `*9*7*${cleanPhone}*${amount}#`;
  }
  return `*9*7*${cleanPhone}#`;
};

// Generates a well-formatted WhatsApp message for sharing a Gam3eya statement
export const generateWhatsAppShareText = (gam3eya: Gam3eya, vodafoneNumber: string): string => {
  const totalPaid = gam3eya.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalDue = gam3eya.totalPool * gam3eya.shares.length;
  const periodLabel = gam3eya.periodType === 'daily' ? 'يومية' : 'شهرية';
  const unitLabel = gam3eya.periodType === 'daily' ? 'يوم' : 'شهر';

  const effectiveEndDate = getGam3eyaEffectiveEndDate(gam3eya);

  let msg = `💰 *كشف حساب: ${gam3eya.name}*\n`;
  msg += `▫️ نوع الجمعية: ${periodLabel} (${gam3eya.duration} ${unitLabel})\n`;
  msg += `▫️ تاريخ البدء: ${formatDateArabic(gam3eya.startDate)}\n`;
  msg += `▫️ تاريخ النهاية المقررة: ${formatDateArabic(effectiveEndDate)}\n`;
  msg += `▫️ القسط لكل سهم: ${formatCurrency(gam3eya.installmentAmount)} / ${unitLabel}\n`;
  msg += `▫️ إجمالي القبضة (الحوض): ${formatCurrency(gam3eya.totalPool)}\n`;
  msg += `▫️ إجمالي المحصل: ${formatCurrency(totalPaid)} من ${formatCurrency(totalDue)}\n`;
  msg += `▫️ رقم فودافون كاش للتحصيل: ${vodafoneNumber}\n\n`;

  msg += `📋 *جدول الأدوار والأسهم:*\n`;
  gam3eya.shares.forEach((share, index) => {
    const turnNum = share.turnIndex || index + 1;
    if (share.type === 'single') {
      const paidForShare = gam3eya.payments
        .filter((p) => p.shareId === share.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const isPayoutDone = share.payoutStatus === 'collected' ? '✅ تم القبض' : '⏳ جاري';
      msg += `• دور (${turnNum}): ${share.member?.name || 'مشارك'} | يقبض: ${formatCurrency(share.targetPayout)} [${isPayoutDone}] (مدفوع: ${formatCurrency(paidForShare)})\n`;
    } else {
      msg += `• دور (${turnNum}) - سهم مشترك مرن:\n`;
      share.participants?.forEach((p) => {
        const paidForPart = gam3eya.payments
          .filter((pay) => pay.shareId === share.id && pay.participantId === p.id)
          .reduce((sum, pay) => sum + pay.amount, 0);
        msg += `   ↳ ${p.name} (${p.percentage}%) | قسطه: ${formatCurrency(p.installmentAmount)} | قبضه: ${formatCurrency(p.targetPayout)} (مدفوع: ${formatCurrency(paidForPart)})\n`;
      });
    }
  });

  msg += `\n📲 *تم الإصدار عبر تطبيق جمعيتي - Gam3ety*`;
  return msg;
};

// Generates personalized WhatsApp reminder message for a specific member/participant who hasn't paid
export const generateParticipantReminderWhatsAppText = (params: {
  memberName: string;
  gam3eyaName: string;
  requiredAmount: number;
  paidAmount: number;
  vodafoneNumber: string;
  collectorName: string;
  periodType: 'daily' | 'monthly';
}): string => {
  const {
    memberName,
    gam3eyaName,
    requiredAmount,
    paidAmount,
    vodafoneNumber,
    collectorName,
    periodType,
  } = params;

  const unitLabel = periodType === 'daily' ? 'اليومي' : 'الشهري';

  let msg = `السلام عليكم ورحمة الله يا ${memberName} 👋\n\n`;
  msg += `تذكير ودّي بخصوص سداد القسط ${unitLabel} في:\n`;
  msg += `💰 *جمعية: ${gam3eyaName}*\n\n`;
  msg += `▫️ المبلغ المطلوب سداده: *${formatCurrency(requiredAmount)}*\n`;
  if (paidAmount > 0) {
    msg += `▫️ إجمالي المسدد سابقاً: ${formatCurrency(paidAmount)}\n`;
  }
  msg += `\n💳 *بيانات التحويل عبر فودافون كاش:*\n`;
  msg += `▫️ رقم المحفظة: *${vodafoneNumber}*\n`;
  msg += `▫️ كود التحويل السريع: *9*7*${vodafoneNumber.replace(/\D/g, '')}*${requiredAmount}#\n`;
  msg += `▫️ اسم المستلم المعتمد: ${collectorName}\n\n`;
  msg += `يرجى تأكيد التحويل أو إرسال لقطة شاشة بعد السداد لتسجيل الدفعة في كشف الحساب. شكراً لالتزامك الدائم! 🙏✨\n`;
  msg += `📲 *مرسلة عبر تطبيق جمعيتي - Gam3ety*`;

  return msg;
};

// Formats phone to international Egyptian standard and creates direct WhatsApp link
export const getWhatsAppDirectLink = (phone: string | undefined, text: string): string => {
  const encodedText = encodeURIComponent(text);
  if (!phone) {
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  // Clean non-digits
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '2' + clean; // Egyptian code 201...
  } else if (clean.startsWith('1') && clean.length === 10) {
    clean = '20' + clean;
  }

  if (clean.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${clean}&text=${encodedText}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

// Generates an Excel file (.xlsx) with detailed overview, shares breakdown, payments ledger, and totals
export const exportGam3eyaToExcel = (gam3eya: Gam3eya, settings: UserSettings): void => {
  const wb = XLSX.utils.book_new();

  // Calculate totals
  const totalPaid = gam3eya.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = gam3eya.totalPool * gam3eya.shares.length;
  const remaining = Math.max(0, totalExpected - totalPaid);
  const progressPct = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  const effectiveEndDate = getGam3eyaEffectiveEndDate(gam3eya);

  // Sheet 1: Summary and Shares Breakdown
  const overviewRows: (string | number)[][] = [
    ['جمعيتي - Gam3ety | كشف حساب تفصيلي معتمد'],
    [''],
    ['بيانات الجمعية والتواريخ:'],
    ['اسم الجمعية', gam3eya.name, 'نوع الجمعية', gam3eya.periodType === 'daily' ? 'يومية' : 'شهرية'],
    ['تاريخ بدء الجمعية', formatDateArabic(gam3eya.startDate), 'تاريخ نهاية الجمعية', formatDateArabic(effectiveEndDate)],
    ['المدة المقررة', `${gam3eya.duration} ${gam3eya.periodType === 'daily' ? 'يوم' : 'شهر'}`, 'القسط الدوري للسهم', `${gam3eya.installmentAmount} ج.م`],
    ['إجمالي الحوض (القبضة)', `${gam3eya.totalPool} ج.م`, 'حالة الجمعية', gam3eya.status === 'active' ? 'نشطة وجارية' : 'مكتملة'],
    ['أمين الصندوق / المسؤول', settings.collectorName, 'رقم فودافون كاش للتحصيل', formatPhoneNumber(settings.vodafoneCashNumber)],
    ['تاريخ إصدار التقرير', formatDateArabic(new Date().toISOString()), '', ''],
    [''],
    ['المؤشرات المالية والخزينة:'],
    ['إجمالي المبلغ المستهدف', totalExpected, 'إجمالي المحصل حتى الآن', totalPaid],
    ['المبلغ المتبقي المطلوب', remaining, 'نسبة السداد والتحصيل', `${progressPct}%`],
    [''],
    ['جدول تفاصيل الأدوار والأسهم (الفردية والمشتركة):'],
    [
      'رقم الدور',
      'نوع السهم',
      'اسم المشارك',
      'رقم الموبايل',
      'النسبة %',
      'القسط الدوري (ج.م)',
      'مبلغ القبض المستحق (ج.م)',
      'إجمالي المبلغ المسدد (ج.م)',
      'المتبقي على العضو (ج.م)',
      'حالة تسليم القبضة',
    ],
  ];

  gam3eya.shares.forEach((share, index) => {
    const turnNum = share.turnIndex || index + 1;
    if (share.type === 'single') {
      const paid = gam3eya.payments
        .filter((p) => p.shareId === share.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const rem = Math.max(0, share.targetPayout - paid);
      overviewRows.push([
        `دور ${turnNum}`,
        'سهم فردي',
        share.member?.name || 'مشارك',
        share.member?.phone || '-',
        '100%',
        share.installmentAmount,
        share.targetPayout,
        paid,
        rem,
        share.payoutStatus === 'collected' ? 'تم القبض ✅' : 'قيد التحصيل ⏳',
      ]);
    } else {
      share.participants?.forEach((p) => {
        const paid = gam3eya.payments
          .filter((pay) => pay.shareId === share.id && pay.participantId === p.id)
          .reduce((sum, pay) => sum + pay.amount, 0);
        const rem = Math.max(0, p.targetPayout - paid);
        overviewRows.push([
          `دور ${turnNum}`,
          'سهم مشترك مرن',
          p.name,
          p.phone || '-',
          `${p.percentage}%`,
          p.installmentAmount,
          p.targetPayout,
          paid,
          rem,
          p.payoutStatus === 'collected' ? 'تم القبض ✅' : 'قيد التحصيل ⏳',
        ]);
      });
    }
  });

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  // Configure Right-to-Left orientation for Arabic Excel
  wsOverview['!views'] = [{ rightToLeft: true }];
  wsOverview['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'كشف حساب الأسهم والأعضاء');

  // Sheet 2: Payments Ledger
  const paymentRows: (string | number)[][] = [
    [`سجل حركات المدفوعات والتحصيلات: ${gam3eya.name}`],
    [''],
    ['التاريخ والوقت', 'اسم الدافع', 'طريقة الدفع', 'المبلغ المدفوع (ج.م)', 'رقم العملية / المرجع', 'ملاحظات'],
  ];

  gam3eya.payments.forEach((p) => {
    paymentRows.push([
      formatDateTimeArabic(p.date),
      p.payerName,
      getPaymentMethodLabel(p.method),
      p.amount,
      p.referenceNumber || '-',
      p.notes || '-',
    ]);
  });

  paymentRows.push(['']);
  paymentRows.push(['إجمالي المبالغ المحصلة في السجل', '', '', totalPaid, '', '']);

  const wsPayments = XLSX.utils.aoa_to_sheet(paymentRows);
  wsPayments['!views'] = [{ rightToLeft: true }];
  wsPayments['!cols'] = [
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPayments, 'سجل المدفوعات');

  // Export and download
  const safeName = gam3eya.name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
  const fileName = `كشف_حساب_${safeName}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Generates a CSV file for download
export const exportGam3eyaToCSV = (gam3eya: Gam3eya): void => {
  const headers = ['رقم الدور', 'نوع السهم', 'اسم العضو', 'النسبة %', 'القسط الدوري', 'مبلغ القبض', 'إجمالي المدفوع', 'حالة القبض'];
  
  const rows: string[][] = [];

  gam3eya.shares.forEach((share, index) => {
    const turnNum = (share.turnIndex || index + 1).toString();
    if (share.type === 'single') {
      const paid = gam3eya.payments
        .filter((p) => p.shareId === share.id)
        .reduce((sum, p) => sum + p.amount, 0);
      rows.push([
        turnNum,
        'سهم فردي',
        share.member?.name || 'مشارك',
        '100%',
        share.installmentAmount.toString(),
        share.targetPayout.toString(),
        paid.toString(),
        share.payoutStatus === 'collected' ? 'تم القبض' : 'قيد الانتظار',
      ]);
    } else {
      share.participants?.forEach((p) => {
        const paid = gam3eya.payments
          .filter((pay) => pay.shareId === share.id && pay.participantId === p.id)
          .reduce((sum, pay) => sum + pay.amount, 0);
        rows.push([
          turnNum,
          'سهم مشترك مرن',
          p.name,
          `${p.percentage}%`,
          p.installmentAmount.toString(),
          p.targetPayout.toString(),
          paid.toString(),
          p.payoutStatus === 'collected' ? 'تم القبض' : 'قيد الانتظار',
        ]);
      });
    }
  });

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Arabic support in Excel
    [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `كشف_حساب_${gam3eya.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

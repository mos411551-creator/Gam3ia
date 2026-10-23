import React, { useState } from 'react';
import { Bell, X, Share2, Sparkles } from 'lucide-react';
import { Gam3eya, UserSettings } from '../types';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

interface DailyReminderBannerProps {
  settings: UserSettings;
  activeGam3eyat: Gam3eya[];
  onOpenWallet: () => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  settings,
  activeGam3eyat,
  onOpenWallet,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !settings.enableDailyReminder || activeGam3eyat.length === 0) {
    return null;
  }

  // Calculate daily dues for active daily pools
  const dailyPools = activeGam3eyat.filter((g) => g.periodType === 'daily');
  const dailyInstallmentTotal = dailyPools.reduce((sum, g) => sum + g.installmentAmount * g.shares.length, 0);

  const handleShareDailyReminder = () => {
    let msg = `🔔 *تذكير السداد اليومي - جمعيتي*\n`;
    msg += `مساء الخير يا شباب، تذكير بميعاد سداد القسط اليومي.\n`;
    if (dailyPools.length > 0) {
      msg += `الجمعيات اليومية الجارية: ${dailyPools.map((g) => g.name).join(' ، ')}\n`;
    }
    msg += `💳 *رقم فودافون كاش للتحويل:* ${settings.vodafoneCashNumber}\n`;
    msg += `اسم المستلم: ${settings.collectorName}\n`;
    msg += `شكراً لالتزامكم دائماً! 🙏`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-2.5 px-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs mb-6 border border-emerald-700/50">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-amber-300 ml-1">
            تنبيه اليوم الساعة {settings.reminderTime || '9:00 مساءً'}:
          </span>
          <span className="text-emerald-100">
            ميعاد تحصيل الأقساط اليومية عبر محفظة فودافون كاش ({formatPhoneNumber(settings.vodafoneCashNumber)})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleShareDailyReminder}
          className="py-1 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>تذكير الواتساب للجروب</span>
        </button>

        <button
          onClick={onOpenWallet}
          className="py-1 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition-colors"
        >
          فتح المحفظة
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

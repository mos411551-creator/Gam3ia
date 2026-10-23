import React, { useState } from 'react';
import { X, Check, Save, Smartphone, User, Bell, Download, Upload, RotateCcw } from 'lucide-react';
import { UserSettings } from '../types';
import { exportDataBackup, importDataBackup } from '../utils/storage';
import { formatPhoneNumber } from '../utils/formatters';

interface SettingsModalProps {
  settings: UserSettings;
  onClose: () => void;
  onSave: (updated: UserSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSave,
  onResetData,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [vodafoneNumber, setVodafoneNumber] = useState(settings.vodafoneCashNumber);
  const [collectorName, setCollectorName] = useState(settings.collectorName);
  const [enableReminder, setEnableReminder] = useState(settings.enableDailyReminder);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || '21:00');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      ...settings,
      userName: userName.trim() || 'مصطفى',
      vodafoneCashNumber: vodafoneNumber.trim().replace(/\s+/g, '') || '01001234567',
      collectorName: collectorName.trim() || 'أمين الصندوق',
      enableDailyReminder: enableReminder,
      reminderTime,
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ok = await importDataBackup(file);
      if (ok) {
        alert('تم استيراد النسخة الاحتياطية بنجاح!');
        window.location.reload();
      } else {
        alert('فشل قراءة ملف النسخة الاحتياطية. تأكد من صحة الملف.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إعدادات فودافون كاش والتطبيق</h3>
              <p className="text-xs text-emerald-200">محفوظة محلياً ودائمة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-right flex-1">
          {/* 1. Vodafone Cash Number (Highlight Feature) */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-[#E60000] text-white flex items-center justify-center text-xs">
                ’
              </span>
              <span>رقم فودافون كاش المعتمد للتحصيل</span>
            </div>
            <p className="text-xs text-red-800">
              هذا الرقم سيظهر في بطاقة فودافون كاش وكشوفات حساب PDF وكود USSD المختصر لتحويل الأموال.
            </p>
            <div>
              <input
                type="tel"
                required
                value={vodafoneNumber}
                onChange={(e) => setVodafoneNumber(e.target.value)}
                placeholder="0100 123 4567"
                className="w-full text-base font-bold font-mono p-3 rounded-xl border border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 dir-ltr text-right"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                تنسيق العرض الحالي: {formatPhoneNumber(vodafoneNumber)}
              </span>
            </div>
          </div>

          {/* 2. Collector Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم أمين الصندوق / صاحب المحفظة:
            </label>
            <input
              type="text"
              required
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder="مثال: مصطفى أحمد (أمين الصندوق)"
              className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* 3. User Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسمك في التطبيق:
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="مثال: مصطفى"
              className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              يظهر في الترحيب العلوي "أهلاً يا {userName || 'مصطفى'}"
            </span>
          </div>

          {/* 4. Daily Reminder (V4 Request) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  تنبيه التحصيل اليومي "فكر تدفع"
                </span>
                <span className="text-[11px] text-slate-500">
                  إشعار بتذكير المشاركين بالسداد اليومي الساعة 9:00 مساءً
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableReminder}
              onChange={(e) => setEnableReminder(e.target.checked)}
              className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
            />
          </div>

          {/* 5. Backup & Data Management */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              النسخ الاحتياطي وإدارة البيانات:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={exportDataBackup}
                className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>تنزيل نسخة JSON</span>
              </button>

              <label className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>استيراد نسخة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل تريد استعادة البيانات التجريبية الأولية؟')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط البيانات التجريبية الافتراضية</span>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-emerald-200" />
                  <span>تم حفظ الإعدادات بنجاح!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-emerald-200" />
                  <span>حفظ التعديلات في الذاكرة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

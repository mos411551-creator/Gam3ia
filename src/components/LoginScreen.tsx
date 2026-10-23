import React, { useState } from 'react';
import { User, ArrowLeft, Check, Sparkles, Shield, Wallet } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LoginScreenProps {
  onLogin: (name: string) => void;
  defaultName?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  defaultName = 'مصطفى',
}) => {
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(name.trim());
  };

  const nameSuggestions = ['مصطفى', 'أحمد شريف', 'كريم حسن', 'محمود عادل', 'سارة إبراهيم'];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 text-right space-y-6">
        {/* App Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <AppLogo size="lg" showText={false} />
          <h2 className="text-2xl font-black text-emerald-950 mt-2">
            مرحباً بك في جمعيتي
          </h2>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            النظام الأذكى لإدارة الجمعيات اليومية والشهرية والسهم المشترك المرن
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اكتب اسمك للمتابعة:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مصطفى"
                className="w-full text-base font-bold p-3.5 pr-11 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white transition-all text-slate-900"
              />
              <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              أو اختر اسماً سريعاً:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {nameSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setName(sug)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>دخول إلى حسابي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
            <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>دخول فوري بدون باسورد</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
            <Wallet className="w-3.5 h-3.5 text-[#E60000] shrink-0" />
            <span>تحصيل فودافون كاش</span>
          </div>
        </div>
      </div>
    </div>
  );
};

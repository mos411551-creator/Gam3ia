import React, { useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm w-full space-y-6">
        {/* Animated App Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700 p-0.5 shadow-2xl shadow-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
            <AppLogo size="xl" showText={false} />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 font-bold text-xs shadow-md">
            ✦
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>جمعيتي</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 border border-emerald-500/30">
              Gam3ety V3
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 font-medium max-w-xs mx-auto leading-relaxed">
            بديل الكشكول والواتساب.. إدارة واضحة، سهم مشترك مرن، وتحصيل فودافون كاش
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="pt-6 flex flex-col items-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-300 animate-spin" />
          <span className="text-[11px] text-emerald-300/80 font-mono tracking-wider">
            جاري فحص حالة الدخول والبيانات المحفوظة...
          </span>
        </div>

        {/* Offline & Security Badge */}
        <div className="pt-8 flex items-center gap-2 text-[11px] text-emerald-300/60 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>يعمل 100% بدون إنترنت · حفظ محلي آمن</span>
        </div>
      </div>
    </div>
  );
};

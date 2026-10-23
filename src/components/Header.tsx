import React from 'react';
import { Plus, Settings, LogOut, Wallet, FileText, User } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  userName: string;
  onOpenNewGam3eya: () => void;
  onOpenSettings: () => void;
  onOpenWalletTab: () => void;
  onLogout: () => void;
  activeNavTab: 'all' | 'daily' | 'monthly' | 'wallet';
  onNavTabChange: (tab: 'all' | 'daily' | 'monthly' | 'wallet') => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onOpenNewGam3eya,
  onOpenSettings,
  onOpenWalletTab,
  onLogout,
  activeNavTab,
  onNavTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title & logo */}
        <div className="flex items-center gap-3 shrink-0">
          <AppLogo size="md" showText={true} />
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavTabChange('all')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-800 ${
              activeNavTab === 'all' ? 'text-emerald-800 font-bold' : ''
            }`}
          >
            كل الجمعيات
          </button>
          <button
            onClick={() => onNavTabChange('daily')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-amber-800 ${
              activeNavTab === 'daily' ? 'text-amber-800 font-bold' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>الجمعيات اليومية</span>
          </button>
          <button
            onClick={() => onNavTabChange('monthly')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-emerald-800 ${
              activeNavTab === 'monthly' ? 'text-emerald-800 font-bold' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>الجمعيات الشهرية</span>
          </button>
          <button
            onClick={() => onNavTabChange('wallet')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-red-700 flex items-center gap-1.5 ${
              activeNavTab === 'wallet' ? 'text-red-700 font-bold' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#E60000]" />
            <span>محفظة فودافون كاش</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA + User Profile Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User greeting and settings toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-colors">
            <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              {userName.slice(0, 1) || 'م'}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              أهلاً يا {userName}
            </span>
            <button
              onClick={onOpenSettings}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
              title="الإعدادات ورقم فودافون كاش"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              title="تسجيل خروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewGam3eya}
            className="py-2 px-3 sm:px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm shadow-emerald-950/20 whitespace-nowrap shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء جمعية</span>
          </button>
        </div>
      </div>
    </header>
  );
};

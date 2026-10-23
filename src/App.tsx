/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Wallet,
  Layers,
  Calendar,
  Clock,
  Sparkles,
  Settings,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Gam3eya, Payment, UserSettings, Share, Participant } from './types';
import {
  loadStoredUser,
  saveStoredUser,
  clearStoredUser,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredGam3eyat,
  saveStoredGam3eyat,
  INITIAL_GAM3EYAT,
} from './utils/storage';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { Gam3eyaCard } from './components/Gam3eyaCard';
import { VodafoneCashCard } from './components/VodafoneCashCard';
import { NewGam3eyaModal } from './components/NewGam3eyaModal';
import { Gam3eyaDetailModal } from './components/Gam3eyaDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { StatementPrintModal } from './components/StatementPrintModal';
import { SettingsModal } from './components/SettingsModal';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { DailyReminderBanner } from './components/DailyReminderBanner';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(loadStoredSettings());
  const [gam3eyat, setGam3eyat] = useState<Gam3eya[]>([]);
  const [activeNavTab, setActiveNavTab] = useState<'all' | 'daily' | 'monthly' | 'wallet'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedGam3eyaId, setSelectedGam3eyaId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [printGam3eyaId, setPrintGam3eyaId] = useState<string | null>(null);

  // Payment modal state
  const [paymentTarget, setPaymentTarget] = useState<{
    gam3eyaId: string;
    shareId?: string;
    participantId?: string;
  } | null>(null);

  // Load user and data on mount
  useEffect(() => {
    const user = loadStoredUser();
    if (user) {
      setCurrentUser(user);
    }
    const storedGam3eyat = loadStoredGam3eyat();
    setGam3eyat(storedGam3eyat);
    setSettings(loadStoredSettings());
  }, []);

  const handleLogin = (name: string) => {
    saveStoredUser(name);
    setCurrentUser(name);
    // Also sync with settings user name if default
    const updatedSettings = { ...settings, userName: name };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد بالتأكيد تسجيل الخروج وتبديل المستخدم؟')) {
      clearStoredUser();
      setCurrentUser(null);
    }
  };

  const handleSaveSettings = (updated: UserSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleResetData = () => {
    setGam3eyat(INITIAL_GAM3EYAT);
    saveStoredGam3eyat(INITIAL_GAM3EYAT);
  };

  const handleAddGam3eya = (newPool: Gam3eya) => {
    const updated = [newPool, ...gam3eyat];
    setGam3eyat(updated);
    saveStoredGam3eyat(updated);
  };

  const handleDeleteGam3eya = (id: string) => {
    const updated = gam3eyat.filter((g) => g.id !== id);
    setGam3eyat(updated);
    saveStoredGam3eyat(updated);
    if (selectedGam3eyaId === id) {
      setSelectedGam3eyaId(null);
    }
  };

  const handleUpdateGam3eya = (updatedPool: Gam3eya) => {
    const updated = gam3eyat.map((g) => (g.id === updatedPool.id ? updatedPool : g));
    setGam3eyat(updated);
    saveStoredGam3eyat(updated);
  };

  const handleSavePayment = (payment: Payment) => {
    const updated = gam3eyat.map((g) => {
      if (g.id !== payment.gam3eyaId) return g;
      return {
        ...g,
        payments: [payment, ...g.payments],
      };
    });
    setGam3eyat(updated);
    saveStoredGam3eyat(updated);
  };

  const handleTogglePayoutStatus = (gam3eyaId: string, shareId: string, participantId?: string) => {
    const updated = gam3eyat.map((g) => {
      if (g.id !== gam3eyaId) return g;

      const updatedShares = g.shares.map((s) => {
        if (s.id !== shareId) return s;

        if (s.type === 'single') {
          return {
            ...s,
            payoutStatus: (s.payoutStatus === 'collected' ? 'pending' : 'collected') as 'pending' | 'collected',
          };
        } else {
          // If toggling a specific participant in shared share
          if (participantId) {
            const updatedParticipants = s.participants?.map((p) => {
              if (p.id !== participantId) return p;
              return {
                ...p,
                payoutStatus: (p.payoutStatus === 'collected' ? 'pending' : 'collected') as 'pending' | 'collected',
              };
            });
            return {
              ...s,
              participants: updatedParticipants,
            };
          } else {
            // Toggle whole share
            const nextStatus = s.payoutStatus === 'collected' ? 'pending' : 'collected';
            return {
              ...s,
              payoutStatus: nextStatus as 'pending' | 'collected',
              participants: s.participants?.map((p) => ({ ...p, payoutStatus: nextStatus as 'pending' | 'collected' })),
            };
          }
        }
      });

      return {
        ...g,
        shares: updatedShares,
      };
    });

    setGam3eyat(updated);
    saveStoredGam3eyat(updated);
  };

  // Filtered Gam3eyat list
  const filteredGam3eyat = gam3eyat.filter((g) => {
    // Navigation tab filter
    if (activeNavTab === 'daily' && g.periodType !== 'daily') return false;
    if (activeNavTab === 'monthly' && g.periodType !== 'monthly') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inName = g.name.toLowerCase().includes(q);
    const inShares = g.shares.some((s) => {
      if (s.type === 'single') {
        return s.member?.name.toLowerCase().includes(q);
      }
      return s.participants?.some((p) => p.name.toLowerCase().includes(q));
    });
    return inName || inShares;
  });

  const selectedGam3eya = gam3eyat.find((g) => g.id === selectedGam3eyaId);
  const printGam3eya = gam3eyat.find((g) => g.id === printGam3eyaId);
  const paymentTargetGam3eya = gam3eyat.find((g) => g.id === paymentTarget?.gam3eyaId);

  // Splash screen gate
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Login screen gate
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} defaultName={settings.userName} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      {/* Top Bar Header */}
      <Header
        userName={currentUser}
        onOpenNewGam3eya={() => setIsNewModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWalletTab={() => setActiveNavTab('wallet')}
        onLogout={handleLogout}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => setActiveNavTab(tab)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Daily Reminder Banner */}
        <DailyReminderBanner
          settings={settings}
          activeGam3eyat={gam3eyat}
          onOpenWallet={() => setActiveNavTab('wallet')}
        />

        {/* Top Summary Statistics Cards */}
        <StatsCards
          gam3eyat={gam3eyat}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* If Wallet Tab is explicitly selected */}
        {activeNavTab === 'wallet' ? (
          <div className="mt-8 space-y-6 max-w-2xl mx-auto text-right">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">محفظة فودافون كاش المعتمدة</h2>
                <p className="text-xs text-slate-500">
                  تفاصيل التحصيل، كود USSD السريع، ورمز الاستجابة السريعة QR
                </p>
              </div>
              <button
                onClick={() => setActiveNavTab('all')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
              >
                العودة للجمعيات
              </button>
            </div>

            <VodafoneCashCard
              phoneNumber={settings.vodafoneCashNumber}
              collectorName={settings.collectorName}
              onEditClick={() => setIsSettingsOpen(true)}
            />

            {/* Quick Payment Instructions Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900">كيف يقوم الأعضاء بالتحويل؟</h4>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>
                  يضغط العضو على زر <strong>"نسخ رقم الكاش"</strong> لنسخ الرقم أو يطلب كود USSD المباشر.
                </li>
                <li>
                  من تطبيق أنا فودافون أو بطلب <strong>*9*7*الرقم*المبلغ#</strong> يتم تحويل القسط المحدد.
                </li>
                <li>
                  بمجرد وصول رسالة التأكيد، يضغط أمين الصندوق زر <strong>"تسجيل دفع"</strong> لتحديث كشف الحساب فورياً.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          /* Main Gam3eyat Directory */
          <div className="mt-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              {/* Category Segmented Control */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveNavTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeNavTab === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({gam3eyat.length})
                </button>
                <button
                  onClick={() => setActiveNavTab('daily')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeNavTab === 'daily'
                      ? 'bg-white text-amber-950 border border-amber-300 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-amber-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>يومية ({gam3eyat.filter((g) => g.periodType === 'daily').length})</span>
                </button>
                <button
                  onClick={() => setActiveNavTab('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeNavTab === 'monthly'
                      ? 'bg-white text-emerald-950 border border-emerald-300 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-emerald-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>شهرية ({gam3eyat.filter((g) => g.periodType === 'monthly').length})</span>
                </button>
              </div>

              {/* Search input */}
              <div className="flex-1 min-w-[220px] max-w-sm relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم الجمعية أو المشارك..."
                  className="w-full text-xs font-medium py-2 pr-9 pl-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Gam3eyat Cards Grid */}
            {filteredGam3eyat.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7 text-emerald-700" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {searchQuery ? 'لا توجد جمعيات تطابق بحثك' : 'لا توجد جمعيات مضافة حالياً'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ابدأ بإنشاء أول جمعية لك الآن وحدد مدتها وأسهمها الفردية والمشتركة بسهولة.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-2 py-2 px-4 rounded-xl bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء جمعية جديدة</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGam3eyat.map((gam3eya) => (
                  <Gam3eyaCard
                    key={gam3eya.id}
                    gam3eya={gam3eya}
                    onOpenDetails={() => setSelectedGam3eyaId(gam3eya.id)}
                    onQuickPay={() => setPaymentTarget({ gam3eyaId: gam3eya.id })}
                    onOpenPrint={() => setPrintGam3eyaId(gam3eya.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from mobile touch reference) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveNavTab('all')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeNavTab === 'all' || activeNavTab === 'daily' || activeNavTab === 'monthly'
              ? 'text-emerald-800 font-bold'
              : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">الجمعيات</span>
        </button>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-emerald-800 text-white shadow-lg shadow-emerald-950/30 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveNavTab('wallet')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeNavTab === 'wallet' ? 'text-[#E60000] font-bold' : 'text-slate-500'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">فودافون كاش</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">الإعدادات</span>
        </button>
      </div>

      {/* Modal: New Gam3eya Wizard */}
      {isNewModalOpen && (
        <NewGam3eyaModal
          defaultUserName={currentUser}
          onClose={() => setIsNewModalOpen(false)}
          onSave={handleAddGam3eya}
        />
      )}

      {/* Modal: Gam3eya Details */}
      {selectedGam3eya && (
        <Gam3eyaDetailModal
          gam3eya={selectedGam3eya}
          settings={settings}
          onClose={() => setSelectedGam3eyaId(null)}
          onOpenPaymentModal={(shareId, participantId) =>
            setPaymentTarget({ gam3eyaId: selectedGam3eya.id, shareId, participantId })
          }
          onOpenPrintModal={() => setPrintGam3eyaId(selectedGam3eya.id)}
          onTogglePayoutStatus={(shareId, participantId) =>
            handleTogglePayoutStatus(selectedGam3eya.id, shareId, participantId)
          }
          onDeleteGam3eya={handleDeleteGam3eya}
          onUpdateGam3eya={handleUpdateGam3eya}
        />
      )}

      {/* Modal: Record Payment */}
      {paymentTarget && paymentTargetGam3eya && (
        <PaymentModal
          gam3eya={paymentTargetGam3eya}
          preselectedShareId={paymentTarget.shareId}
          preselectedParticipantId={paymentTarget.participantId}
          vodafoneNumber={settings.vodafoneCashNumber}
          onClose={() => setPaymentTarget(null)}
          onSavePayment={handleSavePayment}
        />
      )}

      {/* Modal: Print / PDF Statement */}
      {printGam3eya && (
        <StatementPrintModal
          gam3eya={printGam3eya}
          settings={settings}
          onClose={() => setPrintGam3eyaId(null)}
        />
      )}

      {/* Modal: Settings */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          onResetData={handleResetData}
        />
      )}
    </div>
  );
}

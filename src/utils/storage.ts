import { Gam3eya, UserSettings } from '../types';

const STORAGE_KEYS = {
  USER: 'gam3ety_user_v3',
  SETTINGS: 'gam3ety_settings_v3',
  GAM3EYAT: 'gam3ety_data_v3',
  INITIALIZED: 'gam3ety_initialized_v3',
};

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'مصطفى',
  userPhone: '01001234567',
  vodafoneCashNumber: '01001234567',
  collectorName: 'مصطفى أحمد (أمين الصندوق)',
  enableDailyReminder: true,
  reminderTime: '21:00',
};

export const INITIAL_GAM3EYAT: Gam3eya[] = [
  {
    id: 'g-101',
    name: 'جمعية الشباب السريعة (100 يوم)',
    periodType: 'daily',
    installmentAmount: 100, // 100 EGP daily per share
    duration: 100, // 100 days
    totalPool: 10000, // 100 * 100 = 10,000 EGP
    startDate: '2026-10-01',
    endDate: '2027-01-09',
    status: 'active',
    notes: 'تحصيل يومي مباشر أو عبر فودافون كاش قبل الساعة 9 مساءً',
    createdAt: new Date().toISOString(),
    shares: [
      {
        id: 's-1',
        type: 'single',
        turnIndex: 1,
        turnDate: '2026-10-10',
        member: {
          name: 'مصطفى أحمد',
          phone: '01001234567',
        },
        installmentAmount: 100,
        targetPayout: 10000,
        payoutStatus: 'collected', // Already paid out
      },
      {
        id: 's-2',
        type: 'shared',
        turnIndex: 2,
        turnDate: '2026-10-25',
        shareLabel: 'سهم مشترك مرن (أحمد وسارة ومحمود)',
        installmentAmount: 100,
        targetPayout: 10000,
        payoutStatus: 'pending',
        participants: [
          {
            id: 'p-1',
            name: 'أحمد شريف',
            phone: '01098765432',
            percentage: 50,
            installmentAmount: 50, // 50 EGP / day
            targetPayout: 5000,
            payoutStatus: 'pending',
          },
          {
            id: 'p-2',
            name: 'سارة إبراهيم',
            phone: '01123456789',
            percentage: 30,
            installmentAmount: 30, // 30 EGP / day
            targetPayout: 3000,
            payoutStatus: 'pending',
          },
          {
            id: 'p-3',
            name: 'محمود عادل',
            phone: '01234567890',
            percentage: 20,
            installmentAmount: 20, // 20 EGP / day
            targetPayout: 2000,
            payoutStatus: 'pending',
          },
        ],
      },
      {
        id: 's-3',
        type: 'single',
        turnIndex: 3,
        turnDate: '2026-11-15',
        member: {
          name: 'كريم حسن',
          phone: '01555555555',
        },
        installmentAmount: 100,
        targetPayout: 10000,
        payoutStatus: 'pending',
      },
      {
        id: 's-4',
        type: 'single',
        turnIndex: 4,
        turnDate: '2026-12-05',
        member: {
          name: 'طارق صلاح',
          phone: '01022223333',
        },
        installmentAmount: 100,
        targetPayout: 10000,
        payoutStatus: 'pending',
      },
    ],
    payments: [
      {
        id: 'pay-1',
        gam3eyaId: 'g-101',
        shareId: 's-1',
        payerName: 'مصطفى أحمد',
        amount: 500,
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        method: 'vodafone_cash',
        referenceNumber: 'VF-948271',
        notes: 'دفعة أول 5 أيام',
      },
      {
        id: 'pay-2',
        gam3eyaId: 'g-101',
        shareId: 's-2',
        participantId: 'p-1',
        payerName: 'أحمد شريف (50%)',
        amount: 250,
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        method: 'vodafone_cash',
        referenceNumber: 'VF-382910',
        notes: 'سداد سهم مشترك',
      },
      {
        id: 'pay-3',
        gam3eyaId: 'g-101',
        shareId: 's-2',
        participantId: 'p-2',
        payerName: 'سارة إبراهيم (30%)',
        amount: 150,
        date: new Date().toISOString(),
        method: 'vodafone_cash',
        referenceNumber: 'VF-551928',
        notes: 'تحويل محفظة فودافون كاش',
      },
    ],
  },
  {
    id: 'g-102',
    name: 'جمعية الأسرة الشهرية',
    periodType: 'monthly',
    installmentAmount: 1500, // 1500 EGP per month
    duration: 10, // 10 months
    totalPool: 15000, // 1,500 * 10 = 15,000 EGP
    startDate: '2026-10-01',
    endDate: '2027-08-01',
    status: 'active',
    notes: 'قبض أول كل شهر عربي',
    createdAt: new Date().toISOString(),
    shares: [
      {
        id: 's-201',
        type: 'single',
        turnIndex: 1,
        turnDate: '2026-10-01',
        member: { name: 'الحاجة أم مصطفى', phone: '01011112222' },
        installmentAmount: 1500,
        targetPayout: 15000,
        payoutStatus: 'collected',
      },
      {
        id: 's-202',
        type: 'shared',
        turnIndex: 2,
        turnDate: '2026-11-01',
        shareLabel: 'سهم مشترك (ياسمين ومروة 50% / 50%)',
        installmentAmount: 1500,
        targetPayout: 15000,
        payoutStatus: 'pending',
        participants: [
          {
            id: 'p-201',
            name: 'ياسمين خليل',
            phone: '01199998888',
            percentage: 50,
            installmentAmount: 750,
            targetPayout: 7500,
            payoutStatus: 'pending',
          },
          {
            id: 'p-202',
            name: 'مروة خليل',
            phone: '01288887777',
            percentage: 50,
            installmentAmount: 750,
            targetPayout: 7500,
            payoutStatus: 'pending',
          },
        ],
      },
      {
        id: 's-203',
        type: 'single',
        turnIndex: 3,
        turnDate: '2026-12-01',
        member: { name: 'هشام توفيق', phone: '01512341234' },
        installmentAmount: 1500,
        targetPayout: 15000,
        payoutStatus: 'pending',
      },
    ],
    payments: [
      {
        id: 'pay-201',
        gam3eyaId: 'g-102',
        shareId: 's-201',
        payerName: 'الحاجة أم مصطفى',
        amount: 1500,
        date: new Date().toISOString(),
        method: 'cash',
        notes: 'كاش يدوي',
      },
    ],
  },
];

export const loadStoredUser = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER);
  } catch {
    return null;
  }
};

export const saveStoredUser = (name: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, name);
  } catch (err) {
    console.error('Error saving user name:', err);
  }
};

export const clearStoredUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (err) {
    console.error('Error clearing user:', err);
  }
};

export const loadStoredSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  return DEFAULT_SETTINGS;
};

export const saveStoredSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

export const loadStoredGam3eyat = (): Gam3eya[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAM3EYAT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading gam3eyat from storage:', err);
  }
  // Initialize with sample data if first run
  saveStoredGam3eyat(INITIAL_GAM3EYAT);
  return INITIAL_GAM3EYAT;
};

export const saveStoredGam3eyat = (list: Gam3eya[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAM3EYAT, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving gam3eyat:', err);
  }
};

export const exportDataBackup = (): void => {
  const payload = {
    appName: 'جمعيتي - Gam3ety',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    settings: loadStoredSettings(),
    gam3eyat: loadStoredGam3eyat(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gam3ety_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const importDataBackup = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed.gam3eyat && Array.isArray(parsed.gam3eyat)) {
      saveStoredGam3eyat(parsed.gam3eyat);
      if (parsed.settings) {
        saveStoredSettings(parsed.settings);
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to parse backup JSON:', e);
    return false;
  }
};

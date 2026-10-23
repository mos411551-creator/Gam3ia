export type PeriodType = 'daily' | 'monthly';

export type ShareType = 'single' | 'shared';

export type PaymentMethod = 'vodafone_cash' | 'cash' | 'instapay' | 'bank_transfer';

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  percentage: number; // e.g. 50, 30, 20
  installmentAmount: number; // daily/monthly installment for this person
  targetPayout: number; // payout amount when turn arrives
  payoutStatus: 'pending' | 'collected';
}

export interface Share {
  id: string;
  type: ShareType;
  turnIndex: number; // 1, 2, 3 ...
  turnDate?: string; // Estimated payout date YYYY-MM-DD
  // For single share:
  member?: {
    name: string;
    phone?: string;
  };
  targetPayout: number;
  installmentAmount: number;
  payoutStatus: 'pending' | 'collected';
  // For shared share:
  participants?: Participant[];
  shareLabel?: string; // e.g., "سهم الشباب المشترك"
}

export interface Payment {
  id: string;
  gam3eyaId: string;
  shareId: string;
  participantId?: string;
  payerName: string;
  amount: number;
  date: string; // ISO string
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface Gam3eya {
  id: string;
  name: string;
  periodType: PeriodType;
  installmentAmount: number; // e.g., 100 EGP per day or 1000 EGP per month
  duration: number; // number of days or months
  totalPool: number; // installmentAmount * duration
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (calculated or specified)
  status: 'active' | 'completed';
  shares: Share[];
  payments: Payment[];
  notes?: string;
  createdAt: string;
}

export interface UserSettings {
  userName: string;
  userPhone?: string;
  vodafoneCashNumber: string;
  collectorName: string;
  enableDailyReminder: boolean;
  reminderTime: string; // e.g. "21:00"
}

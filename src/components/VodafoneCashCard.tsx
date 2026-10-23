import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode, PhoneCall, Sparkles } from 'lucide-react';
import { formatPhoneNumber, getUSSDCode } from '../utils/formatters';

interface VodafoneCashCardProps {
  phoneNumber: string;
  collectorName?: string;
  defaultAmount?: number;
  compact?: boolean;
  onEditClick?: () => void;
}

export const VodafoneCashCard: React.FC<VodafoneCashCardProps> = ({
  phoneNumber,
  collectorName = 'أمين الصندوق',
  defaultAmount,
  compact = false,
  onEditClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [ussdCopied, setUssdCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const ussdCode = getUSSDCode(phoneNumber, defaultAmount);

  useEffect(() => {
    if (showQR) {
      QRCode.toDataURL(`tel:${phoneNumber}`, {
        width: 200,
        margin: 2,
        color: {
          dark: '#990000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [showQR, phoneNumber]);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUSSD = () => {
    navigator.clipboard.writeText(ussdCode);
    setUssdCopied(true);
    setTimeout(() => setUssdCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E60000] via-[#c40000] to-[#8a0000] text-white p-5 shadow-lg shadow-red-950/20 border border-red-500/30">
      {/* Background Decorative Waves */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
      <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-black/10 pointer-events-none blur-xl" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {/* Vodafone Speechmark Icon */}
          <div className="w-8 h-8 rounded-full bg-white text-[#E60000] font-black text-lg flex items-center justify-center shadow-inner">
            ’
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-red-100 uppercase">
              Vodafone Cash
            </span>
            <h4 className="text-sm font-bold text-white">محفظة فودافون كاش</h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowQR(!showQR)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-xs flex items-center gap-1"
            title="عرض كود QR"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">QR كود</span>
          </button>
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="text-xs text-red-100 hover:text-white underline underline-offset-4 px-2 py-1"
            >
              تعديل
            </button>
          )}
        </div>
      </div>

      {/* Middle: Phone Number & Microchip */}
      <div className="relative z-10 my-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-red-200 font-medium">رقم المحفظة المعتمد للتحويل:</div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-wider font-mono tabular-nums text-white dir-ltr text-right mt-0.5">
              {formatPhoneNumber(phoneNumber)}
            </div>
          </div>
          {/* Smart Chip graphic */}
          <div className="w-10 h-7 rounded bg-amber-300/80 border border-amber-200/50 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-[1px] bg-amber-600/40 absolute top-2" />
            <div className="w-full h-[1px] bg-amber-600/40 absolute bottom-2" />
            <div className="h-full w-[1px] bg-amber-600/40 absolute left-3" />
            <div className="h-full w-[1px] bg-amber-600/40 absolute right-3" />
          </div>
        </div>

        <div className="text-xs text-red-100 font-medium mt-1">
          المستلم: <span className="font-semibold text-white">{collectorName}</span>
        </div>
      </div>

      {/* QR Code expansion modal/view */}
      {showQR && qrDataUrl && (
        <div className="relative z-10 my-3 p-3 bg-white rounded-xl text-slate-900 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
          <img src={qrDataUrl} alt="Vodafone Cash QR" className="w-36 h-36" />
          <p className="text-xs text-slate-600 mt-1 font-medium">امسح الكود بكاميرا الموبايل للاتصال أو التحويل</p>
          <span className="text-xs font-mono font-bold text-[#E60000]">{phoneNumber}</span>
        </div>
      )}

      {/* Actions Strip */}
      <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <button
          onClick={handleCopyPhone}
          className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-white text-[#c40000] hover:bg-red-50 active:scale-[0.98] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>تم نسخ الرقم!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>نسخ رقم الكاش</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyUSSD}
          className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-black/25 hover:bg-black/40 text-white active:scale-[0.98] font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-white/20"
          title="كود التحويل السريع من فودافون كاش"
        >
          {ussdCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>تم نسخ كود USSD</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="dir-ltr font-mono text-[11px]">{ussdCode}</span>
            </>
          )}
        </button>

        <a
          href={`tel:${phoneNumber}`}
          className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-medium text-xs flex items-center justify-center gap-1 transition-all"
          title="اتصال مباشر"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="text-[11px]">اتصال</span>
        </a>
      </div>
    </div>
  );
};

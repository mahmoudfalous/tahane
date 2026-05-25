"use client";
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  label?: string;
}

function getShareUrl(url: string) {
  if (typeof window === 'undefined') return url;
  if (!url) return window.location.href;

  return new URL(url, window.location.origin).toString();
}

export default function ShareButton({ url, label = 'نسخ الرابط' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = getShareUrl(url);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'عيد أضحى مبارك',
            text: 'شاهد بطاقة تهنئتي بعيد الأضحى',
            url: shareUrl,
          });
        } catch (shareError) {
          console.error('تعذرت مشاركة الرابط', shareError);
        }
      } else {
        console.error('تعذر نسخ الرابط', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 bg-[#151A22] hover:bg-gray-800 border border-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
    >
      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-[#D4AF37]" />}
      <span>{copied ? 'تم نسخ رابط المشاهدة' : label}</span>
    </button>
  );
}

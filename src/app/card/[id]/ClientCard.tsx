"use client";

import { useRef } from 'react';
import { CardData, Template } from '@/types';
import CardPreview from '@/components/CardPreview';
import DownloadButton from '@/components/DownloadButton';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ClientCardProps {
  cardData: CardData;
  template: Template;
}

export default function ClientCard({ cardData, template }: ClientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>إنشاء بطاقة جديدة</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Card */}
        <div className="order-2 lg:order-1">
          <CardPreview 
            ref={cardRef}
            template={template}
            name={cardData.name}
            imagePreviewUrl={cardData.image_url}
          />
        </div>

        {/* Actions */}
        <div className="order-1 lg:order-2 space-y-8 bg-[#151A22]/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div className="text-center lg:text-right">
            <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">
              بطاقتك جاهزة
            </h1>
            <p className="text-gray-400">
              حمّل بطاقة التهنئة أو انسخ رابط المشاهدة لمشاركتها مع الأهل والأصدقاء.
            </p>
          </div>

          <div className="space-y-4">
            <DownloadButton
              targetRef={cardRef}
              fileName={`بطاقة-عيد-الأضحى-${cardData.name || 'تهنئة'}.png`}
              template={template}
              name={cardData.name}
              imagePreviewUrl={cardData.image_url}
            />
            <ShareButton url={`/view/${cardData.id}`} label="نسخ رابط المشاهدة" />
          </div>
        </div>
      </div>
    </div>
  );
}

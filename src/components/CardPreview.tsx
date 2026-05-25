"use client";
import { Template } from '@/types';
import Image from 'next/image';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardPreviewProps {
  template: Template;
  name: string;
  imagePreviewUrl: string | null;
  className?: string;
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ template, name, imagePreviewUrl, className }, ref) => {
    const bgImage = imagePreviewUrl ? template.imageAndTextImage : template.textOnlyImage;
    const currentConfig = imagePreviewUrl ? template.imageAndTextConfig : template.textOnlyConfig;

    return (
      <div 
        ref={ref}
        className={cn("relative w-full bg-[#151A22] rounded-xl overflow-hidden shadow-2xl mx-auto max-w-md", className)}
        style={{ aspectRatio: template.aspectRatio || 4/5 }}
      >
        {/* Template Background Image */}
        <div className="absolute inset-0">
          <Image 
            src={bgImage} 
            alt="تصميم البطاقة" 
            fill 
            className="object-cover"
            priority
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Optional User Image */}
        {imagePreviewUrl && currentConfig.imagePosition && (
          <div 
            className="absolute overflow-hidden"
            style={{
              top: currentConfig.imagePosition.top,
              left: currentConfig.imagePosition.left,
              width: currentConfig.imagePosition.width,
              height: currentConfig.imagePosition.height,
              transform: 'translate(-50%, -50%)',
              borderRadius: template.imageShape === 'circle' ? '50%' : 
                          template.imageShape === 'rounded' ? '1rem' : '0'
            }}
          >
            <Image 
              src={imagePreviewUrl} 
              alt="الصورة المرفوعة" 
              fill 
              className="object-cover" 
            />
          </div>
        )}

        {/* User Name */}
        {name && currentConfig.namePosition && (
          <div 
            className="absolute flex items-center justify-center"
            style={{
              top: currentConfig.namePosition.top,
              left: currentConfig.namePosition.left,
              width: currentConfig.namePosition.width,
              transform: 'translate(-50%, -50%)',
              textAlign: currentConfig.namePosition.textAlign as 'left' | 'center' | 'right',
              color: '#000',
            }}
          >
            <span className="text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis px-4 font-serif w-full">
              {name}
            </span>
          </div>
        )}
      </div>
    );
  }
);

CardPreview.displayName = 'CardPreview';

export default CardPreview;

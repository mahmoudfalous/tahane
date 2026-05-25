"use client";
import { Download } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import html2canvas from 'html2canvas';
import type { Template } from '@/types';

interface DownloadButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
  template?: Template;
  name?: string;
  imagePreviewUrl?: string | null;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function percentToPixels(value: string, total: number) {
  return (Number.parseFloat(value) / 100) * total;
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

async function renderTemplateToCanvas(template: Template, name: string, imagePreviewUrl: string | null) {
  const backgroundUrl = imagePreviewUrl ? template.imageAndTextImage : template.textOnlyImage;
  const config = imagePreviewUrl ? template.imageAndTextConfig : template.textOnlyConfig;
  const background = await loadImage(backgroundUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('المتصفح لا يدعم إنشاء الصورة.');
  }

  canvas.width = background.naturalWidth;
  canvas.height = background.naturalHeight;
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  if (imagePreviewUrl && config.imagePosition) {
    const userImage = await loadImage(imagePreviewUrl);
    const width = percentToPixels(config.imagePosition.width, canvas.width);
    const height = percentToPixels(config.imagePosition.height, canvas.height);
    const centerX = percentToPixels(config.imagePosition.left, canvas.width);
    const centerY = percentToPixels(config.imagePosition.top, canvas.height);
    const x = centerX - width / 2;
    const y = centerY - height / 2;

    context.save();
    context.beginPath();
    if (template.imageShape === 'circle') {
      context.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    } else if (template.imageShape === 'rounded') {
      context.roundRect(x, y, width, height, Math.min(width, height) * 0.08);
    } else {
      context.rect(x, y, width, height);
    }
    context.clip();
    drawImageCover(context, userImage, x, y, width, height);
    context.restore();
  }

  if (name && config.namePosition) {
    const centerX = percentToPixels(config.namePosition.left, canvas.width);
    const centerY = percentToPixels(config.namePosition.top, canvas.height);
    const maxWidth = percentToPixels(config.namePosition.width, canvas.width) * 0.9;
    const fontSize = Math.max(24, Math.round(canvas.width * 0.045));

    context.fillStyle = '#000';
    context.textAlign = config.namePosition.textAlign as CanvasTextAlign;
    context.textBaseline = 'middle';
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.fillText(name, centerX, centerY, maxWidth);
  }

  return canvas;
}

export default function DownloadButton({
  targetRef,
  fileName = 'eid-mubarak.png',
  template,
  name = '',
  imagePreviewUrl = null,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!targetRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = template
        ? await renderTemplateToCanvas(template, name, imagePreviewUrl)
        : await html2canvas(targetRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#151A22',
          });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('خطأ إنشاء الصورة', error);
      alert('تعذر تحميل الصورة. حاول مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isDownloading ? <LoadingSpinner className="text-black" /> : <Download className="w-5 h-5" />}
      <span>{isDownloading ? 'جار تجهيز الصورة...' : 'تحميل البطاقة'}</span>
    </button>
  );
}

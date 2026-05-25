"use client";
import { Upload, X } from 'lucide-react';
import { useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  previewUrl: string | null;
}

export default function ImageUpload({ onImageSelect, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">الصورة (اختياري)</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          previewUrl ? 'border-[#D4AF37] bg-[#151A22]' : 'border-gray-600 hover:border-[#D4AF37] hover:bg-[#151A22]'
        }`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="relative w-full h-full p-2 group">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image src={previewUrl} alt="معاينة الصورة" fill className="object-contain" />
            </div>
            <button 
              onClick={handleRemove}
              className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">اضغط لرفع صورة</span>
            <span className="text-xs text-gray-500 mt-1">PNG أو JPG حتى 5 ميجابايت</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import NameInput from '@/components/NameInput';
import TemplateSelector from '@/components/TemplateSelector';
import CardPreview from '@/components/CardPreview';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/services/supabase';
import type { Template } from '@/types';

export default function Home() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) throw new Error('تعذر تحميل التصاميم');
        const data: Template[] = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
        setIsLoadingTemplates(false);
      } catch (err) {
        console.error(err);
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      alert("اكتب الاسم لإنشاء البطاقة.");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      let uploadedImageUrl = null;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('card-images')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          console.error("تفاصيل خطأ رفع الصورة:", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('card-images')
          .getPublicUrl(fileName);
          
        uploadedImageUrl = publicUrl;
      }
      
      const { data, error } = await supabase
        .from('cards')
        .insert([
          {
            name: name,
            image_url: uploadedImageUrl,
            template: selectedTemplateId,
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error("خطأ حفظ البطاقة:", error);
        throw error;
      }
      
      router.push(`/card/${data.id}`);
      
    } catch (error) {
      console.error("خطأ إنشاء البطاقة:", error);
      alert("حدث خطأ أثناء إنشاء البطاقة. حاول مرة أخرى.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-4 font-serif">
          عيد أضحى مبارك
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          أنشئ بطاقة تهنئة أنيقة باسمك وصورتك وشاركها مع الأهل والأصدقاء.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-[#151A22]/50 p-6 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} previewUrl={imagePreviewUrl} />
          <NameInput value={name} onChange={setName} />
          <TemplateSelector 
            templates={templates} 
            selectedId={selectedTemplateId} 
            onSelect={setSelectedTemplateId} 
          />
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] text-lg"
          >
            {isGenerating ? <LoadingSpinner className="text-black" /> : null}
            <span>{isGenerating ? 'جار إنشاء البطاقة...' : 'إنشاء البطاقة'}</span>
          </button>
        </div>

        <div className="sticky top-24">
          <h2 className="text-xl font-medium text-gray-300 mb-6 text-center">معاينة البطاقة</h2>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center aspect-[4/5] border border-gray-800 rounded-xl bg-[#151A22]/50 text-gray-400">
              جار تحميل التصاميم...
            </div>
          ) : selectedTemplate ? (
            <CardPreview 
              ref={cardRef}
              template={selectedTemplate}
              name={name}
              imagePreviewUrl={imagePreviewUrl}
            />
          ) : (
            <div className="flex items-center justify-center aspect-[4/5] border border-gray-800 rounded-xl bg-[#151A22]/50 text-gray-400">
              جار تحميل المعاينة...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

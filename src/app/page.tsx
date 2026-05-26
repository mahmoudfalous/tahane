"use client";

import { useState, useRef, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NameInput from '@/components/NameInput';
import TemplateSelector from '@/components/TemplateSelector';
import CardPreview from '@/components/CardPreview';
import DownloadButton from '@/components/DownloadButton';
import type { Template } from '@/types';

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) {
          console.error('تعذر تحميل التصاميم');
          setIsLoadingTemplates(false);
          return;
        }
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
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4 font-serif">
          عيد أضحى مبارك
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          أنشئ بطاقة تهنئة أنيقة باسمك وصورتك وحمّلها مباشرة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-card-bg/50 p-6 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} previewUrl={imagePreviewUrl} />
          <NameInput value={name} onChange={setName} />
          <TemplateSelector 
            templates={templates} 
            selectedId={selectedTemplateId} 
            onSelect={setSelectedTemplateId} 
          />
          <DownloadButton
            targetRef={cardRef}
            fileName={`بطاقة-عيد-الأضحى-${name || 'تهنئة'}.png`}
            template={selectedTemplate}
            name={name}
            imagePreviewUrl={imagePreviewUrl}
            label="إنشاء وتحميل البطاقة"
            loadingLabel="جار إنشاء البطاقة..."
            disabled={!name.trim() || isLoadingTemplates || !selectedTemplate}
          />
        </div>

        <div className="sticky top-24">
          <h2 className="text-xl font-medium text-gray-300 mb-6 text-center">معاينة البطاقة</h2>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center aspect-4/5 border border-gray-800 rounded-xl bg-card-bg/50 text-gray-400">
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
            <div className="flex items-center justify-center aspect-4/5 border border-gray-800 rounded-xl bg-card-bg/50 text-gray-400">
              جار تحميل المعاينة...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

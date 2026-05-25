import Image from 'next/image';
import type { Template } from '@/types';

interface TemplateSelectorProps {
  templates: Template[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ templates, selectedId, onSelect }: TemplateSelectorProps) {
  if (!templates || templates.length === 0) {
    return <div className="text-center text-gray-400">جار تحميل التصاميم...</div>;
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">اختر التصميم</label>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedId === template.id
                ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="relative aspect-[4/5] w-full">
              <div className="absolute inset-0 bg-[#151A22] flex items-center justify-center">
                <span className="text-xs text-gray-500 text-center px-1">{template.name}</span>
              </div>
              <Image
                src={template.textOnlyImage || template.imageAndTextImage}
                alt={template.name}
                fill
                className="object-cover z-10 opacity-80 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

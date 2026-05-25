import { notFound } from 'next/navigation';
import Link from 'next/link';
import CardPreview from '@/components/CardPreview';
import { supabase } from '@/services/supabase';
import { templates } from '@/data/templates';
import type { CardData } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from('cards').select('name').eq('id', id).single();

  return {
    title: data?.name ? `بطاقة تهنئة من ${data.name}` : 'بطاقة تهنئة بعيد الأضحى',
    description: 'شاهد بطاقة تهنئة شخصية بمناسبة عيد الأضحى.',
  };
}

export default async function ViewCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const cardData = data as CardData;
  const template = templates.find((t) => t.id === cardData.template) || templates[0];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#0B0E14]">
      <div className="border-b border-gray-800/80 bg-[#151A22]/35">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[#D4AF37]">تهنئة خاصة بعيد الأضحى</p>
          <h1 className="mt-3 text-3xl font-bold text-white font-serif sm:text-4xl">
            عيد أضحى مبارك
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-300">
            تقبل الله منا ومنكم صالح الأعمال، وكل عام وأنتم بخير.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <CardPreview
            template={template}
            name={cardData.name}
            imagePreviewUrl={cardData.image_url}
            className="max-w-2xl rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          />
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#AA8C2C]"
        >
          أنشئ بطاقة تهنئة
        </Link>
      </div>
    </div>
  );
}

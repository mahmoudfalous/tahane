import { supabase } from '@/services/supabase';
import { templates } from '@/data/templates';
import { notFound } from 'next/navigation';
import { CardData } from '@/types';
import ClientCard from './ClientCard';

export async function generateMetadata() {
  return {
    title: 'بطاقة تهنئة بعيد الأضحى',
    description: 'بطاقة تهنئة شخصية لعيد الأضحى.',
  };
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
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
  const template = templates.find(t => t.id === cardData.template) || templates[0];

  return <ClientCard cardData={cardData} template={template} />;
}

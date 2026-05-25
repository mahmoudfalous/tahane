"use client";
import dynamic from 'next/dynamic';

const BuilderEditor = dynamic(() => import('@/components/builder/BuilderEditor'), {
  ssr: false,
});

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white p-8">
      <h1 className="text-3xl font-bold text-[#D4AF37] mb-8">محرر التصاميم</h1>
      <BuilderEditor />
    </div>
  );
}

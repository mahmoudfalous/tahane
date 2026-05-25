import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'تهاني - بطاقات عيد الأضحى',
  description: 'أنشئ وشارك بطاقات تهنئة أنيقة لعيد الأضحى باسمك وصورتك.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0B0E14] text-gray-100 antialiased selection:bg-[#D4AF37] selection:text-[#0B0E14]">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

import Link from 'next/link';
import { Moon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#151A22]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-xl font-bold text-white">تهاني</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

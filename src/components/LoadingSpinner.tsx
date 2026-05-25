import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("w-6 h-6 animate-spin text-[#D4AF37]", className)} />
  );
}

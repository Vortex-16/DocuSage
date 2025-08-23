import { BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-bold text-primary", className)}>
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <BookMarked className="h-5 w-5" />
        </div>
        {!iconOnly && <span className="font-headline text-foreground">DocuSage</span>}
    </div>
  );
}

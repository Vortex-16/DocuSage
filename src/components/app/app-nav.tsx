'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ShieldCheck, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/policy-check', icon: ShieldCheck, label: 'Policy Check' },
    { href: '/data-sources', icon: Database, label: 'Data Sources' },
];

export function AppNav({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname();

    return (
        <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4 gap-2 mt-4", isMobile && "px-4")}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'bg-muted text-primary'
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

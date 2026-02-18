'use client';

import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@/lib/types';

interface StatusBadgeProps {
    status: BookingStatus;
}

const statusConfig = {
    pending: { label: 'Beklemede', variant: 'outline' as const, className: 'border-amber-200 bg-amber-50 text-amber-800' },
    approved: { label: 'Onaylandı', variant: 'outline' as const, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
    rejected: { label: 'Reddedildi', variant: 'outline' as const, className: 'border-red-200 bg-red-50 text-red-800' },
    cancelled: { label: 'İptal Edildi', variant: 'outline' as const, className: 'border-stone-200 bg-stone-100 text-stone-500' },
    completed: { label: 'Tamamlandı', variant: 'outline' as const, className: 'border-stone-200 bg-stone-50 text-stone-700' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={`text-[10px] font-semibold px-2 py-0.5 ${config.className}`}>
            {config.label}
        </Badge>
    );
}

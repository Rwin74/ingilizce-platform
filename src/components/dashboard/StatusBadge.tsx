'use client';

import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@/lib/types';

interface StatusBadgeProps {
    status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getConfig = (s: BookingStatus) => {
        switch (s) {
            case 'pending':
                return { label: 'Beklemede', variant: 'outline' as const, className: 'border-amber-200 bg-amber-50 text-amber-800' };
            case 'approved':
                return { label: 'Onaylandı', variant: 'outline' as const, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
            case 'rejected':
                return { label: 'Reddedildi', variant: 'outline' as const, className: 'border-red-200 bg-red-50 text-red-800' };
            case 'completed':
                return { label: 'Tamamlandı', variant: 'outline' as const, className: 'border-stone-200 bg-stone-50 text-stone-700' };
            case 'cancelled':
                return { label: 'İptal Edildi', variant: 'outline' as const, className: 'border-stone-200 bg-stone-100 text-stone-500' };
            default:
                return { label: s, variant: 'outline' as const, className: 'border-gray-200 bg-gray-50 text-gray-800' };
        }
    };

    const config = getConfig(status);

    return (
        <Badge variant={config.variant} className={`text-[10px] font-semibold px-2 py-0.5 ${config.className}`}>
            {config.label}
        </Badge>
    );
}

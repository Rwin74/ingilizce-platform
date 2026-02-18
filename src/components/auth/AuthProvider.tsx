'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/supabase/service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, user } = useAppStore();

    useEffect(() => {
        // Only check Supabase if no user is currently set (e.g., page reload)
        if (!user) {
            getCurrentUser().then((profile) => {
                if (profile) {
                    setUser(profile);
                }
            });
        }
    }, []);

    return <>{children}</>;
}

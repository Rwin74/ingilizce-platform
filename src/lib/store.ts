'use client';

import { create } from 'zustand';
import type { Profile } from './types';

interface AppState {
    user: Profile | null;
    setUser: (user: Profile | null) => void;
    authModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    authModalTab: 'login' | 'register';
    setAuthModalTab: (tab: 'login' | 'register') => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    authModalOpen: false,
    setAuthModalOpen: (open) => set({ authModalOpen: open }),
    authModalTab: 'login',
    setAuthModalTab: (tab) => set({ authModalTab: tab }),
}));

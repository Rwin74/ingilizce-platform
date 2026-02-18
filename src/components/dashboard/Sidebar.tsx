'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { signOut } from '@/lib/supabase/service';
import { NotificationBell } from './NotificationBell';
import {
    BookOpen, User, Calendar, ClipboardList, History, Search, CalendarDays, LogOut, Menu, X, MessageSquare, ShieldCheck, GraduationCap, TrendingUp,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface SidebarProps { role: UserRole; }

const tutorLinks = [
    { href: '/dashboard/tutor/profile', label: 'Profil', icon: User },
    { href: '/dashboard/tutor/availability', label: 'Müsaitlik', icon: Calendar },
    { href: '/dashboard/tutor/appointments', label: 'Randevular', icon: ClipboardList },
    { href: '/dashboard/tutor/students', label: 'Öğrencilerim', icon: GraduationCap },
    { href: '/dashboard/tutor/messages', label: 'Mesajlar', icon: MessageSquare },
    { href: '/dashboard/tutor/history', label: 'Geçmiş', icon: History },
];

const studentLinks = [
    { href: '/dashboard/student', label: 'Eğitmenleri Ara', icon: Search },
    { href: '/dashboard/student/schedule', label: 'Takvimim', icon: CalendarDays },
    { href: '/dashboard/student/progress', label: 'Gelişimim', icon: TrendingUp },
    { href: '/dashboard/student/messages', label: 'Mesajlar', icon: MessageSquare },
];

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const { user, setUser } = useAppStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = role === 'tutor' ? tutorLinks : studentLinks;
    const roleLabel = role === 'tutor' ? 'Eğitmen Paneli' : 'Öğrenci Paneli';

    // Add Admin link if user is admin
    const { user: appUser } = useAppStore(); // Renamed to avoid conflict with 'user' from useAppStore() above
    const finalLinks = appUser?.is_admin
        ? [...links, { href: '/dashboard/admin', label: 'Admin Paneli', icon: ShieldCheck }]
        : links;

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        window.location.href = '/';
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="px-5 py-6 border-b border-stone-100">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-playfair text-lg font-bold text-stone-900">LinguaElite</span>
                        <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase">{roleLabel}</p>
                    </div>
                </Link>
                <div className="mt-3"><NotificationBell /></div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {finalLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href === '/dashboard/student' && pathname.startsWith('/dashboard/student/tutor'));
                    return (
                        <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200/60 shadow-sm' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}>
                            <link.icon className={`w-4.5 h-4.5 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pb-4 mt-auto border-t border-stone-100 pt-4">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 text-xs font-bold overflow-hidden">
                            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : (user.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U')}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{user.full_name}</p>
                            <p className="text-xs text-stone-400 capitalize">{role === 'tutor' ? 'Eğitmen' : 'Öğrenci'}</p>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                    <LogOut className="w-4.5 h-4.5" />Çıkış Yap
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-lg border-b border-stone-200/60 z-50 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div>
                    <span className="font-playfair text-base font-bold text-stone-900">LinguaElite</span>
                </Link>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-stone-600">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            </div>

            {mobileOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed top-14 left-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-xl"><SidebarContent /></div>
                </>
            )}

            <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-stone-200/60 z-40"><SidebarContent /></aside>
        </>
    );
}

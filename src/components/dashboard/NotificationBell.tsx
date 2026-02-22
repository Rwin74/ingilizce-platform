'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/supabase/service';
import type { Notification } from '@/lib/types';
import { Bell, CheckCheck, BookOpen, CalendarCheck, CalendarX, Link as LinkIcon } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
    booking_request: { icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    booking_approved: { icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    booking_rejected: { icon: CalendarX, color: 'text-red-600', bg: 'bg-red-50' },
    meeting_link: { icon: LinkIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export function NotificationBell() {
    const { user } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const isDemo = !user?.id || user.id.startsWith('tutor-') || user.id.startsWith('student-');

    useEffect(() => {
        if (isDemo || !user) return;
        loadNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(loadNotifications, 30_000);
        return () => clearInterval(interval);
    }, [isDemo, user]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function loadNotifications() {
        if (!user) return;
        const data = await getNotifications(user.id);
        setNotifications(data);
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const isInitialLoad = useRef(true);
    const prevUnreadRef = useRef(0);

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            prevUnreadRef.current = unreadCount;
            if (unreadCount > 0) document.title = `(${unreadCount}) LinguaElite`;
            else document.title = 'LinguaElite';
            return;
        }

        if (unreadCount > prevUnreadRef.current) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(console.error);
        }
        prevUnreadRef.current = unreadCount;

        if (unreadCount > 0) {
            document.title = `(${unreadCount}) LinguaElite`;
        } else {
            document.title = 'LinguaElite';
        }
    }, [unreadCount]);

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.id);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const handleClickNotification = async (notif: Notification) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
            setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Az önce';
        if (mins < 60) return `${mins} dk önce`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} sa önce`;
        const days = Math.floor(hours / 24);
        return `${days} gün önce`;
    };

    if (isDemo) return null;

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200/60 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                        <h3 className="text-sm font-semibold text-stone-900">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium">
                                <CheckCheck className="w-3.5 h-3.5" />Tümünü oku
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <Bell className="w-10 h-10 mx-auto text-stone-200 mb-3" />
                                <p className="text-sm text-stone-400">Henüz bildiriminiz yok</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.booking_request;
                                const Icon = config.icon;
                                return (
                                    <button key={notif.id} onClick={() => handleClickNotification(notif)}
                                        className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-stone-50/80 transition-colors ${!notif.is_read ? 'bg-amber-50/40' : ''}`}>
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notif.is_read ? 'font-semibold text-stone-900' : 'font-medium text-stone-600'}`}>{notif.title}</p>
                                                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />}
                                                </div>
                                                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-stone-300 mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

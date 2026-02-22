'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { getConversationList, getUnreadMessageCount, getBookingsForStudent } from '@/lib/supabase/service';
import { ChatBox } from '@/components/dashboard/ChatBox';
import type { Message, Profile } from '@/lib/types';
import { MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';

export default function StudentMessagesPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('student-');

    const [conversations, setConversations] = useState<Message[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const data = await getConversationList(user.id);
                setConversations(data);
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    const getPartner = (msg: Message): Profile => {
        const isSender = msg.sender_id === user?.id;
        return isSender ? (msg as any).receiver : (msg as any).sender;
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Az önce';
        if (mins < 60) return `${mins}dk`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}sa`;
        return `${Math.floor(hours / 24)}g`;
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    // Chat view
    if (selectedPartner && user) {
        return (
            <div className="space-y-4">
                <button onClick={() => setSelectedPartner(null)} className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                    <ArrowLeft className="w-4 h-4" />Mesajlara Dön
                </button>
                <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 overflow-hidden">
                    <ChatBox currentUserId={user.id} otherUser={selectedPartner} />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">Mesajlar</h1>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Eğitmenlerinizle iletişim kurun.</p>
            </div>

            <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50">
                <CardContent className="p-0">
                    {conversations.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                            <p className="text-stone-400 dark:text-stone-500">Henüz mesajınız yok.</p>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Bir eğitmenle ders almaya başladığınızda mesajlaşabilirsiniz.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
                            {conversations.map((msg) => {
                                const partner = getPartner(msg);
                                if (!partner) return null;
                                const initials = partner.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'E';
                                const isUnread = !msg.is_read && msg.sender_id !== user?.id;

                                return (
                                    <button
                                        key={msg.id}
                                        onClick={() => setSelectedPartner(partner)}
                                        className={`w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors ${isUnread ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                                    >
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center text-stone-600 dark:text-stone-400 text-sm font-bold shrink-0 overflow-hidden">
                                            {partner.avatar_url ? <img src={partner.avatar_url} alt={partner.full_name} className="w-full h-full object-cover" /> : initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${isUnread ? 'font-bold text-stone-900 dark:text-stone-100' : 'font-medium text-stone-700 dark:text-stone-300'}`}>{partner.full_name}</span>
                                                <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">{timeAgo(msg.created_at)}</span>
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-stone-700 dark:text-stone-300 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                                                {msg.sender_id === user?.id && <span className="text-stone-400 dark:text-stone-500">Siz: </span>}
                                                {msg.content}
                                            </p>
                                        </div>
                                        {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendMessage, getConversation, markMessagesAsRead, subscribeToMessages } from '@/lib/supabase/service';
import type { Message, Profile } from '@/lib/types';

interface ChatBoxProps {
    currentUserId: string;
    otherUser: Profile;
}

export function ChatBox({ currentUserId, otherUser }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load messages
    useEffect(() => {
        async function load() {
            const data = await getConversation(currentUserId, otherUser.id);
            setMessages(data);
            setLoading(false);
            await markMessagesAsRead(currentUserId, otherUser.id);
        }
        load();
    }, [currentUserId, otherUser.id]);

    // Subscribe to realtime
    useEffect(() => {
        const channel = subscribeToMessages(currentUserId, (msg) => {
            if (msg.sender_id === otherUser.id) {
                setMessages((prev) => [...prev, msg]);
                markMessagesAsRead(currentUserId, otherUser.id);
            }
        });

        return () => {
            channel?.unsubscribe();
        };
    }, [currentUserId, otherUser.id]);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || sending) return;

        const content = newMsg.trim();
        setNewMsg('');
        setSending(true);

        try {
            const msg = await sendMessage(currentUserId, otherUser.id, content);
            setMessages((prev) => [...prev, msg]);
        } catch {
            setNewMsg(content); // Restore on error
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Bugün';
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Dün';
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
        const dateKey = new Date(msg.created_at).toDateString();
        const last = groupedMessages[groupedMessages.length - 1];
        if (last && new Date(last.messages[0].created_at).toDateString() === dateKey) {
            last.messages.push(msg);
        } else {
            groupedMessages.push({ date: msg.created_at, messages: [msg] });
        }
    });

    const otherInitials = otherUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-stone-100 bg-white/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 font-bold text-sm shrink-0 overflow-hidden">
                    {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
                    ) : otherInitials}
                </div>
                <div>
                    <p className="font-semibold text-stone-900 text-sm">{otherUser.full_name}</p>
                    <p className="text-xs text-stone-400">{otherUser.role === 'tutor' ? 'İngilizce Eğitmeni' : 'Öğrenci'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-stone-400 text-sm">Henüz mesaj yok. İlk mesajı gönderin!</p>
                    </div>
                ) : (
                    groupedMessages.map((group, gi) => (
                        <div key={gi}>
                            {/* Date separator */}
                            <div className="flex items-center justify-center my-3">
                                <span className="text-[10px] text-stone-400 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                                    {formatDate(group.date)}
                                </span>
                            </div>
                            {group.messages.map((msg) => {
                                const isMine = msg.sender_id === currentUserId;
                                return (
                                    <div key={msg.id} className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isMine
                                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-md'
                                                : 'bg-white text-stone-800 border border-stone-100 rounded-bl-md'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isMine ? 'text-amber-200' : 'text-stone-400'} text-right`}>
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-stone-100 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 border-stone-200 focus:border-amber-400"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={!newMsg.trim() || sending}
                        size="sm"
                        className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 px-4"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TIME_SLOTS } from '@/lib/types';
import { MOCK_AVAILABILITY } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { getAvailability, saveAvailability } from '@/lib/supabase/service';
import { Calendar, Save, Trash2, CheckCircle2, Clock, Loader2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TR_DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function TutorAvailabilityPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('tutor-');

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const avail = await getAvailability(user.id);
                const set = new Set<string>();
                avail.forEach((a) => {
                    const start = a.start_time.slice(0, 5); // 'HH:MM:SS' → 'HH:MM'
                    const end = a.end_time.slice(0, 5);
                    TIME_SLOTS.forEach((time) => {
                        if (time >= start && time < end) {
                            set.add(`${a.day_of_week}-${time}`);
                        }
                    });
                });
                setSelected(set);
            } else {
                // Demo mode
                const set = new Set<string>();
                MOCK_AVAILABILITY.forEach((a) => {
                    TIME_SLOTS.forEach((time) => {
                        if (time >= a.start_time && time < a.end_time) {
                            set.add(`${a.day_of_week}-${time}`);
                        }
                    });
                });
                setSelected(set);
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    // RESTRICTION FOR UNAPPROVED TUTORS
    if (!loading && user && !isDemo && user.status !== 'approved') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto p-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${user.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {user.status === 'rejected' ? <XCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-3">
                    {user.status === 'rejected' ? 'Başvurunuz Reddedildi' : 'Müsaitlik Ayarı Kapalı'}
                </h2>
                <p className="text-stone-600 mb-8">
                    {user.status === 'rejected'
                        ? 'Maalesef başvurunuz kriterlerimize uymadığı için reddedildi.'
                        : 'Eğitmen hesabınız onaylanana kadar müsaitlik durumunuzu güncelleyemezsiniz. Lütfen profilinizdeki eksik bilgileri tamamlayın ve yöneticinin onayını bekleyin.'}
                </p>

                {user.status === 'pending' && (
                    <Link href="/dashboard/tutor/profile">
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                            Profil ve CV Bilgileri <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>
        );
    }

    const toggleSlot = useCallback((day: number, time: string) => {
        const key = `${day}-${time}`;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!isDemo && user) {
                // Convert selected slots to availability ranges
                const slotsByDay: Record<number, string[]> = {};
                selected.forEach((key) => {
                    const [day, time] = key.split('-');
                    const d = parseInt(day);
                    if (!slotsByDay[d]) slotsByDay[d] = [];
                    slotsByDay[d].push(time);
                });

                const slots: { day_of_week: number; start_time: string; end_time: string }[] = [];
                Object.entries(slotsByDay).forEach(([day, times]) => {
                    times.sort();
                    let start = times[0];
                    let prev = times[0];
                    for (let i = 1; i <= times.length; i++) {
                        const curr = times[i];
                        if (curr) {
                            const [ph, pm] = prev.split(':').map(Number);
                            const [ch, cm] = curr.split(':').map(Number);
                            if (ch * 60 + cm - (ph * 60 + pm) <= 30) {
                                prev = curr;
                                continue;
                            }
                        }
                        const [eh, em] = prev.split(':').map(Number);
                        const endMinutes = eh * 60 + em + 30;
                        const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
                        slots.push({ day_of_week: parseInt(day), start_time: start, end_time: endTime });
                        if (curr) {
                            start = curr;
                            prev = curr;
                        }
                    }
                });

                await saveAvailability(user.id, slots);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            alert('Kayıt sırasında hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    const hourSlots = TIME_SLOTS.filter((_, i) => i % 2 === 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900">Müsaitlik Takvimi</h1>
                    <p className="text-stone-500 mt-1">Ders verebileceğiniz saatleri seçin.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(new Set())} className="border-stone-200 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />Temizle
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900">
                        {saved ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Kaydedildi!</> : saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Kaydediliyor...</> : <><Save className="w-3.5 h-3.5 mr-1.5" />Kaydet</>}
                    </Button>
                </div>
            </div>

            <Card className="border-stone-200/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900">
                        <Calendar className="w-5 h-5 text-stone-400" />Haftalık Program
                    </CardTitle>
                    <p className="text-sm text-stone-400">Müsait olduğunuz saatlere tıklayın (yeşil = aktif).</p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-stone-100 mb-1">
                                <div className="p-2 text-center"><Clock className="w-4 h-4 mx-auto text-stone-400" /></div>
                                {orderedDays.map((day) => (
                                    <div key={day} className="p-2 text-center">
                                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{TR_DAY_NAMES[day].slice(0, 3)}</span>
                                    </div>
                                ))}
                            </div>
                            {hourSlots.map((time) => (
                                <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)]">
                                    <div className="p-1.5 text-center flex items-center justify-center">
                                        <span className="text-[10px] text-stone-400 font-medium">{time}</span>
                                    </div>
                                    {orderedDays.map((day) => {
                                        const key = `${day}-${time}`;
                                        const isActive = selected.has(key);
                                        return (
                                            <button key={key} onClick={() => toggleSlot(day, time)} className={`h-10 m-0.5 rounded-md text-xs font-medium transition-all ${isActive ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' : 'bg-stone-50 text-stone-300 hover:bg-stone-100 hover:text-stone-500'}`}>
                                                {isActive ? '✓' : '–'}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-stone-500">Müsait</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-stone-100 border border-stone-200" /><span className="text-xs text-stone-500">Kapalı</span></div>
                        <div className="ml-auto text-xs text-stone-400">{selected.size} slot seçili</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

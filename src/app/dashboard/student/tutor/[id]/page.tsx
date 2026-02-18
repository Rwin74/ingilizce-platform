'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfile, getAvailability, createBooking, createNotification, getReviewsForTutor, getAverageRating } from '@/lib/supabase/service';
import { triggerEmailNotification } from '@/lib/email-client';
import { useAppStore } from '@/lib/store';
import { MOCK_TUTORS, MOCK_AVAILABILITY } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TIME_SLOTS } from '@/lib/types';
import type { Profile, Availability as AvailType, Review } from '@/lib/types';
import {
    ArrowLeft, Calendar, CheckCircle2, Clock, GraduationCap, Video, User, Loader2, Star,
} from 'lucide-react';
import Link from 'next/link';

const TR_DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function TutorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppStore();
    const tutorId = params.id as string;

    const [tutor, setTutor] = useState<Profile | null>(null);
    const [availability, setAvailability] = useState<AvailType[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSlot, setSelectedSlot] = useState<{ day: number; time: string } | null>(null);
    const [bookingConfirm, setBookingConfirm] = useState(false);
    const [bookingDone, setBookingDone] = useState(false);
    const [booking, setBooking] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

    useEffect(() => {
        async function load() {
            // Try real Supabase first
            const realTutor = await getProfile(tutorId);
            if (realTutor) {
                setTutor(realTutor);
                const avail = await getAvailability(tutorId);
                setAvailability(avail);
                const [revs, rating] = await Promise.all([
                    getReviewsForTutor(tutorId),
                    getAverageRating(tutorId),
                ]);
                setReviews(revs);
                setAvgRating(rating);
            } else {
                // Fall back to mock
                const mock = MOCK_TUTORS.find((t) => t.id === tutorId);
                setTutor(mock || null);
                setAvailability(MOCK_AVAILABILITY.filter((a) => a.tutor_id === tutorId));
            }
            setLoading(false);
        }
        load();
    }, [tutorId]);

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    if (!tutor) {
        return (
            <div className="text-center py-20">
                <GraduationCap className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                <p className="text-stone-400">Eğitmen bulunamadı.</p>
                <Link href="/dashboard/student"><Button variant="outline" className="mt-4">Geri Dön</Button></Link>
            </div>
        );
    }

    const initials = tutor.full_name.split(' ').map((n) => n[0]).join('').toUpperCase();

    // Supabase returns TIME as 'HH:MM:SS', but TIME_SLOTS use 'HH:MM' — normalize
    const normalizeTime = (t: string) => t.slice(0, 5); // '09:00:00' → '09:00'

    const isAvailable = (day: number, time: string): boolean => {
        return availability.some((a) => {
            if (a.day_of_week !== day) return false;
            const start = normalizeTime(a.start_time);
            const end = normalizeTime(a.end_time);
            return time >= start && time < end;
        });
    };

    const getNextDate = (dayOfWeek: number): string => {
        const today = new Date();
        const todayDay = today.getDay();
        let diff = dayOfWeek - todayDay;
        if (diff <= 0) diff += 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + diff);
        return nextDate.toISOString().split('T')[0];
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        try {
            const isDemo = !user?.id || user.id.startsWith('student-');
            if (!isDemo && user) {
                const [h, m] = selectedSlot.time.split(':').map(Number);
                const endTime = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const booking = await createBooking(user.id, tutor.id, getNextDate(selectedSlot.day), selectedSlot.time, endTime);
                // Notify tutor
                await createNotification(
                    tutor.id,
                    'booking_request',
                    'Yeni Ders Talebi',
                    `${user.full_name} ${TR_DAY_NAMES[selectedSlot.day]} ${selectedSlot.time} için ders talep etti.`,
                    booking?.id
                );
                // Email tutor
                if (tutor.email) {
                    triggerEmailNotification('booking_request', tutor.email, {
                        studentName: user.full_name,
                        date: getNextDate(selectedSlot.day),
                        time: `${selectedSlot.time} – ${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
                    });
                }
            }
            setBookingDone(true);
            setTimeout(() => {
                setBookingConfirm(false);
                setBookingDone(false);
                setSelectedSlot(null);
                router.push('/dashboard/student/schedule');
            }, 1500);
        } catch (err: any) {
            alert(err.message || 'Randevu oluşturulurken hata oluştu.');
        } finally {
            setBooking(false);
        }
    };

    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    const hourSlots = TIME_SLOTS.filter((_, i) => i % 2 === 0);

    return (
        <div className="space-y-6">
            <Link href="/dashboard/student" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />Eğitmenlere Dön
            </Link>

            <Card className="border-stone-200/60">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 text-2xl font-semibold shrink-0">
                            {tutor.avatar_url ? <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full rounded-2xl object-cover" /> : initials}
                        </div>
                        <div className="flex-1">
                            <h1 className="font-playfair text-2xl font-bold text-stone-900">{tutor.full_name}</h1>
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-amber-700 font-medium text-sm">İngilizce Eğitmeni</p>
                                {avgRating.count > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-stone-600">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        {avgRating.avg.toFixed(1)} <span className="text-stone-400">({avgRating.count})</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-stone-500 text-sm leading-relaxed">{tutor.bio || 'Deneyimli İngilizce eğitmeni.'}</p>
                            {tutor.video_intro_url && (
                                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                                    <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                                        <Video className="w-4 h-4 text-stone-400" /><span className="font-medium">Tanıtım Videosu</span>
                                    </div>
                                    <a href={tutor.video_intro_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Videoyu İzle →</a>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-stone-200/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900"><Calendar className="w-5 h-5 text-stone-400" />Müsait Saatler</CardTitle>
                    <p className="text-sm text-stone-400">Müsait bir saate tıklayarak ders talep edebilirsiniz.</p>
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
                                        const available = isAvailable(day, time);
                                        const isSelected = selectedSlot?.day === day && selectedSlot?.time === time;
                                        return (
                                            <button key={`${day}-${time}`} disabled={!available} onClick={() => { if (available) { setSelectedSlot({ day, time }); setBookingConfirm(true); } }}
                                                className={`h-10 m-0.5 rounded-md text-xs font-medium transition-all ${isSelected ? 'bg-amber-700 text-white ring-2 ring-amber-700/20' : available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer' : 'bg-stone-50 text-stone-300 cursor-not-allowed'}`}>
                                                {available ? time : '–'}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /><span className="text-xs text-stone-500">Müsait</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-stone-50 border border-stone-200" /><span className="text-xs text-stone-500">Kapalı</span></div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Section */}
            {reviews.length > 0 && (
                <Card className="border-stone-200/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-stone-900">
                            <Star className="w-5 h-5 text-amber-500" />
                            Değerlendirmeler
                            <span className="text-sm font-normal text-stone-400">({reviews.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const studentName = (review as any).student?.full_name || 'Öğrenci';
                                const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                                const timeAgo = (() => {
                                    const diff = Date.now() - new Date(review.created_at).getTime();
                                    const days = Math.floor(diff / 86400000);
                                    if (days > 30) return `${Math.floor(days / 30)} ay önce`;
                                    if (days > 0) return `${days} gün önce`;
                                    const hours = Math.floor(diff / 3600000);
                                    if (hours > 0) return `${hours} saat önce`;
                                    return 'Az önce';
                                })();

                                return (
                                    <div key={review.id} className="flex gap-3 p-3 bg-stone-50/80 rounded-xl border border-stone-100">
                                        <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">
                                            {studentInitials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-semibold text-stone-800">{studentName}</span>
                                                <span className="text-xs text-stone-400 shrink-0">{timeAgo}</span>
                                            </div>
                                            <div className="flex gap-0.5 my-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} />
                                                ))}
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={bookingConfirm} onOpenChange={setBookingConfirm}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="font-playfair text-stone-900">{bookingDone ? 'Talep Gönderildi!' : 'Randevuyu Onayla'}</DialogTitle>
                    </DialogHeader>
                    {bookingDone ? (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                            <p className="text-stone-600">Ders talebiniz <strong>{tutor.full_name}</strong> eğitmenine gönderildi.</p>
                            <p className="text-sm text-stone-400 mt-2">Eğitmen onayladığında bilgilendirileceksiniz.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 py-2">
                                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                                    <User className="w-5 h-5 text-stone-400" />
                                    <div><p className="text-sm font-medium text-stone-800">{tutor.full_name}</p><p className="text-xs text-stone-400">İngilizce Eğitmeni</p></div>
                                </div>
                                {selectedSlot && (
                                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-stone-400" />
                                        <div>
                                            <p className="text-sm font-medium text-stone-800">{TR_DAY_NAMES[selectedSlot.day]}</p>
                                            <p className="text-xs text-stone-400">{getNextDate(selectedSlot.day)} · {selectedSlot.time} – {(() => { const [h, m] = selectedSlot.time.split(':').map(Number); return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`; })()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setBookingConfirm(false)}>İptal</Button>
                                <Button onClick={handleConfirmBooking} disabled={booking} className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900">
                                    {booking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gönderiliyor...</> : 'Randevu Talep Et'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

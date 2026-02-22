'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useAppStore } from '@/lib/store';
import { getBookingsForTutor, updateBookingStatus, updateMeetingLink, createNotification } from '@/lib/supabase/service';
import { triggerEmailNotification } from '@/lib/email-client';
import { MOCK_BOOKINGS } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';
import {
    ClipboardList, CheckCircle2, XCircle, Video, ExternalLink, Save, Clock, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function TutorAppointmentsPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('tutor-');

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const data = await getBookingsForTutor(user.id);
                setBookings(data);
            } else {
                setBookings(MOCK_BOOKINGS);
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    // RESTRICTION FOR UNAPPROVED TUTORS
    if (!loading && user && !isDemo && user.status !== 'approved') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto p-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${user.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                    {user.status === 'rejected' ? <XCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                    {user.status === 'rejected' ? 'Başvurunuz Reddedildi' : 'Hesabınız Onay Bekliyor'}
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8">
                    {user.status === 'rejected'
                        ? 'Maalesef başvurunuz kriterlerimize uymadığı için reddedildi. Detaylı bilgi için bizimle iletişime geçebilirsiniz.'
                        : 'Eğitmen hesabınız şu an yönetici onay sürecindedir. Bu süreçte randevu taleplerini görüntüleyemezsiniz. Lütfen profilinizdeki eksik bilgileri tamamladığınızdan ve CV yüklediğinizden emin olun.'}
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

    const pending = bookings.filter((b) => b.status === 'pending');
    const approved = bookings.filter((b) => b.status === 'approved');

    const handleApprove = async (id: string) => {
        const booking = bookings.find((b) => b.id === id);
        if (!isDemo) {
            await updateBookingStatus(id, 'approved');
            if (booking) {
                await createNotification(
                    booking.student_id,
                    'booking_approved',
                    'Ders Onaylandı ✓',
                    `${booking.booking_date} tarihli ${booking.start_time} dersini eğitmeniniz onayladı.`,
                    id
                );
                // Email student
                if (booking.student?.email) {
                    triggerEmailNotification('booking_approved', booking.student.email, {
                        tutorName: user?.full_name || 'Eğitmen',
                        date: booking.booking_date,
                        time: `${booking.start_time} – ${booking.end_time}`,
                    });
                }
            }
        }
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'approved' } : b)));
    };

    const handleReject = async (id: string) => {
        const booking = bookings.find((b) => b.id === id);
        if (!isDemo) {
            await updateBookingStatus(id, 'rejected');
            if (booking) {
                await createNotification(
                    booking.student_id,
                    'booking_rejected',
                    'Ders Reddedildi',
                    `${booking.booking_date} tarihli ${booking.start_time} ders talebiniz reddedildi.`,
                    id
                );
                // Email student
                if (booking.student?.email) {
                    triggerEmailNotification('booking_rejected', booking.student.email, {
                        tutorName: user?.full_name || 'Eğitmen',
                        date: booking.booking_date,
                        time: `${booking.start_time} – ${booking.end_time}`,
                    });
                }
            }
        }
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b)));
    };

    const saveMLink = async (id: string) => {
        const link = meetingLinks[id];
        if (!link) return;
        if (!isDemo) await updateMeetingLink(id, link);
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, meeting_link: link } : b)));
    };

    const getStudentName = (booking: Booking) => {
        if (booking.student?.full_name) return booking.student.full_name;
        return `Öğrenci #${booking.student_id.slice(0, 6)}`;
    };

    const getStudentInitials = (booking: Booking) => {
        if (booking.student?.full_name) {
            return booking.student.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return 'ÖĞ';
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">Randevu Yönetimi</h1>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Gelen ders taleplerini onaylayın veya reddedin.</p>
            </div>

            <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <ClipboardList className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                        Gelen Talepler
                        {pending.length > 0 && <span className="ml-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pending.length === 0 ? (
                        <div className="text-center py-10">
                            <ClipboardList className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                            <p className="text-stone-400 dark:text-stone-500">Şu an bekleyen talep yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map((booking) => (
                                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold text-sm flex items-center justify-center shrink-0">{getStudentInitials(booking)}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{getStudentName(booking)}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Clock className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                                                <span className="text-xs text-stone-500 dark:text-stone-400">{booking.booking_date} · {booking.start_time} – {booking.end_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => handleApprove(booking.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Onayla
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleReject(booking.id)} className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                            <XCircle className="w-3.5 h-3.5 mr-1" />Reddet
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <Video className="w-5 h-5 text-stone-400 dark:text-stone-500" />Aktif Oturumlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {approved.length === 0 ? (
                        <div className="text-center py-10">
                            <Video className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                            <p className="text-stone-400 dark:text-stone-500">Henüz onaylanmış ders yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {approved.map((booking) => (
                                <div key={booking.id} className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-sm flex items-center justify-center shrink-0">{getStudentInitials(booking)}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{getStudentName(booking)}</p>
                                                <span className="text-xs text-stone-500 dark:text-stone-400">{booking.booking_date} · {booking.start_time} – {booking.end_time}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Google Meet veya Zoom linki..."
                                            value={meetingLinks[booking.id] || booking.meeting_link || ''}
                                            onChange={(e) => setMeetingLinks((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                                            className="flex-1 text-sm border-emerald-200 dark:border-emerald-900/50 focus:border-emerald-400 dark:focus:border-emerald-600 dark:bg-stone-900 dark:text-stone-100"
                                        />
                                        <Button size="sm" onClick={() => saveMLink(booking.id)} className="bg-emerald-600 hover:bg-emerald-700">
                                            <Save className="w-3.5 h-3.5 mr-1" />Kaydet
                                        </Button>
                                        {booking.meeting_link && (
                                            <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700"><ExternalLink className="w-3.5 h-3.5" /></Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

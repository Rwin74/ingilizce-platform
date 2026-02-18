'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useAppStore } from '@/lib/store';
import { getBookingsForStudent } from '@/lib/supabase/service';
import { MOCK_BOOKINGS, MOCK_TUTORS } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';
import { CalendarDays, ExternalLink, Video, Clock, Loader2, Star, FileText } from 'lucide-react';
import { ReviewModal } from '@/components/dashboard/ReviewModal';
import { LessonNoteModal } from '@/components/dashboard/LessonNoteModal';
import { getLessonNote } from '@/lib/supabase/service';
import type { LessonNote } from '@/lib/types';

export default function StudentSchedulePage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('student-');

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

    // Note Modal State
    const [viewNoteBooking, setViewNoteBooking] = useState<Booking | null>(null);
    const [currentNote, setCurrentNote] = useState<LessonNote | null>(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const data = await getBookingsForStudent(user.id);
                setBookings(data);
            } else {
                setBookings(
                    MOCK_BOOKINGS.map((b) => ({
                        ...b,
                        tutor: MOCK_TUTORS.find((t) => t.id === b.tutor_id),
                    }))
                );
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'approved');
    const past = bookings.filter((b) => b.status === 'completed' || b.status === 'rejected');

    const getTutorName = (booking: Booking) => booking.tutor?.full_name || 'Eğitmen';
    const getTutorInitials = (booking: Booking) => {
        const name = booking.tutor?.full_name;
        if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
        return 'E';
    };

    const handleViewNote = async (booking: Booking) => {
        setViewNoteBooking(booking);
        // Fetch existing note if any
        if (!isDemo) {
            const note = await getLessonNote(booking.id);
            setCurrentNote(note);
        } else {
            setCurrentNote(null);
        }
        setIsNoteModalOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900">Takvimim</h1>
                <p className="text-stone-500 mt-1">Yaklaşan ve geçmiş derslerinizi takip edin.</p>
            </div>

            <Card className="border-stone-200/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900"><CalendarDays className="w-5 h-5 text-stone-400" />Yaklaşan Dersler</CardTitle>
                </CardHeader>
                <CardContent>
                    {upcoming.length === 0 ? (
                        <div className="text-center py-10">
                            <CalendarDays className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                            <p className="text-stone-400 mb-4">Yaklaşan dersiniz bulunmuyor.</p>
                            <a href="/dashboard/student"><Button variant="outline" className="border-stone-200">Eğitmenlere Göz At</Button></a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((booking) => {
                                const isApproved = booking.status === 'approved';
                                return (
                                    <div key={booking.id} className={`p-4 rounded-xl border transition-all ${isApproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${isApproved ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{getTutorInitials(booking)}</div>
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-900">{getTutorName(booking)}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Clock className="w-3 h-3 text-stone-400" />
                                                        <span className="text-xs text-stone-500">{booking.booking_date} · {booking.start_time} – {booking.end_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={booking.status} />
                                                {isApproved && booking.meeting_link && (
                                                    <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                            <Video className="w-3.5 h-3.5 mr-1.5" />Derse Katıl<ExternalLink className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {past.length > 0 && (
                <Card className="border-stone-200/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-stone-900 text-base"><Clock className="w-4 h-4 text-stone-400" />Geçmiş Dersler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {past.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-semibold">{getTutorInitials(booking)}</div>
                                        <div>
                                            <p className="text-sm font-medium text-stone-700">{getTutorName(booking)}</p>
                                            <p className="text-xs text-stone-400">{booking.booking_date} · {booking.start_time} – {booking.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {booking.status === 'completed' && (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={() => handleViewNote(booking)} className="text-stone-500 hover:text-stone-700 hover:bg-stone-200">
                                                    <FileText className="w-3.5 h-3.5 mr-1" />Notlar
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setReviewBooking(booking)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                                    <Star className="w-3.5 h-3.5 mr-1" />Değerlendir
                                                </Button>
                                            </>
                                        )}
                                        <StatusBadge status={booking.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Review Modal */}
            {reviewBooking && user && (
                <ReviewModal
                    booking={reviewBooking}
                    userId={user.id}
                    onClose={() => setReviewBooking(null)}
                    onSubmitted={() => {
                        setReviewBooking(null);
                        alert('Değerlendirmeniz başarıyla gönderildi! ⭐');
                    }}
                />
            )}

            <LessonNoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                booking={viewNoteBooking}
                existingNote={currentNote}
                onSave={async () => { }} // Read-only for student
                mode="view"
            />
        </div>
    );
}

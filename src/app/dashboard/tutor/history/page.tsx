'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useAppStore } from '@/lib/store';
import { getBookingsForTutor } from '@/lib/supabase/service';
import { MOCK_BOOKINGS } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';
import { History, Clock, Loader2, FileText, PlusCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonNoteModal } from '@/components/dashboard/LessonNoteModal';
import { getLessonNote, addLessonNote, uploadLessonMaterial } from '@/lib/supabase/service';
import type { LessonNote } from '@/lib/types';

export default function TutorHistoryPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('tutor-');

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Note Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [currentNote, setCurrentNote] = useState<LessonNote | null>(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const all = await getBookingsForTutor(user.id);
                setBookings(all.filter((b) => b.status === 'completed' || b.status === 'rejected'));
            } else {
                setBookings(MOCK_BOOKINGS.filter((b) => b.status === 'completed' || b.status === 'rejected'));
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    const handleOpenNoteModal = async (booking: Booking) => {
        setSelectedBooking(booking);
        // Fetch existing note if any
        if (!isDemo) {
            const note = await getLessonNote(booking.id);
            setCurrentNote(note);
        } else {
            setCurrentNote(null);
        }
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = async (content: string, file: File | null) => {
        if (!selectedBooking || !user) return;

        // Upload file if exists
        let fileUrl = currentNote?.file_url;
        let fileName = currentNote?.file_name;

        if (file) {
            const url = await uploadLessonMaterial(user.id, file);
            if (url) {
                fileUrl = url;
                fileName = file.name;
            }
        }

        // Save note
        const note = await addLessonNote(
            selectedBooking.id,
            user.id,
            selectedBooking.student_id,
            content,
            fileUrl || undefined,
            fileName || undefined
        );

        if (note) {
            setCurrentNote(note);
            alert('Ders notu kaydedildi.');
        }
    };

    const getStudentName = (booking: Booking) => {
        if (booking.student?.full_name) return booking.student.full_name;
        return `Öğrenci #${booking.student_id.slice(0, 6)}`;
    };

    const getStudentInitials = (booking: Booking) => {
        if (booking.student?.full_name) return booking.student.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        return 'ÖĞ';
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">Ders Geçmişi</h1>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Tamamlanan ve iptal edilen derslerinizin kaydı.</p>
            </div>

            <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <History className="w-5 h-5 text-stone-400 dark:text-stone-500" />Geçmiş Dersler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length === 0 ? (
                        <div className="text-center py-10">
                            <History className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                            <p className="text-stone-400 dark:text-stone-500">Henüz tamamlanmış ders bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 dark:border-stone-800/60">
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Öğrenci</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Tarih</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Saat</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Durum</th>
                                        <th className="text-right py-3 px-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-stone-50 dark:border-stone-800/40 hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-bold flex items-center justify-center">{getStudentInitials(booking)}</div>
                                                    <span className="text-stone-700 dark:text-stone-300 font-medium">{getStudentName(booking)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-stone-600 dark:text-stone-400">{booking.booking_date}</td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                                                    <Clock className="w-3 h-3 text-stone-400 dark:text-stone-500" />{booking.start_time} – {booking.end_time}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3"><StatusBadge status={booking.status} /></td>
                                            <td className="py-3 px-3 text-right">
                                                {booking.status === 'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenNoteModal(booking)}
                                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                    >
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        Not Ekle/Düzenle
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <LessonNoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                booking={selectedBooking}
                existingNote={currentNote}
                onSave={handleSaveNote}
                mode="edit"
            />
        </div>
    );
}

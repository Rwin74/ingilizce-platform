'use client';

import { useState } from 'react';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createReview, createNotification } from '@/lib/supabase/service';
import type { Booking } from '@/lib/types';

interface ReviewModalProps {
    booking: Booking;
    userId: string;
    onClose: () => void;
    onSubmitted: () => void;
}

export function ReviewModal({ booking, userId, onClose, onSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const tutorName = booking.tutor?.full_name || 'Eğitmen';

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Lütfen bir puan seçin.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await createReview(userId, booking.tutor_id, booking.id, rating, comment);
            // Notify tutor about the review
            await createNotification(
                booking.tutor_id,
                'booking_approved',
                'Yeni Değerlendirme ⭐',
                `Bir öğrenciniz size ${rating} yıldız verdi.`,
                booking.id
            );
            onSubmitted();
        } catch (err: any) {
            if (err?.code === '23505') {
                setError('Bu ders için zaten değerlendirme yapmışsınız.');
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}>
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors z-10">
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div className="text-center">
                        <h2 className="font-playfair text-xl font-bold text-stone-900">Dersi Değerlendir</h2>
                        <p className="text-sm text-stone-500 mt-1">
                            <span className="font-semibold text-stone-700">{tutorName}</span> ile olan dersinizi puanlayın
                        </p>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-9 h-9 transition-colors ${(hover || rating) >= star
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-stone-200'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-center text-sm font-medium text-amber-700">
                            {rating === 1 && 'Kötü'}
                            {rating === 2 && 'Fena Değil'}
                            {rating === 3 && 'İyi'}
                            {rating === 4 && 'Çok İyi'}
                            {rating === 5 && 'Mükemmel!'}
                        </p>
                    )}

                    {/* Comment */}
                    <div>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="Yorumunuzu yazın... (isteğe bağlı)"
                            className="border-stone-200 focus:border-amber-400 resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600 text-center bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-md"
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gönderiliyor...</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" />Değerlendirmeyi Gönder</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

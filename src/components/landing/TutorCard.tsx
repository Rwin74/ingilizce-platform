'use client';

import { useState } from 'react';
import { ArrowRight, X, Video, User, Info, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

interface TutorCardProps {
    tutor: Profile;
    rating?: { avg: number; count: number };
}

export function TutorCard({ tutor, rating }: TutorCardProps) {
    const { setAuthModalOpen, setAuthModalTab, user } = useAppStore();
    const [detailOpen, setDetailOpen] = useState(false);

    const initials = tutor.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const handleBook = () => {
        if (user) {
            window.location.href = `/dashboard/student/tutor/${tutor.id}`;
        } else {
            setAuthModalTab('register');
            setAuthModalOpen(true);
        }
    };

    // Extract YouTube embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
        return url;
    };

    return (
        <>
            <Card className="group bg-white dark:bg-stone-950/50 border-stone-200/60 dark:border-stone-800/60 hover:border-amber-300/60 dark:hover:border-amber-900/60 hover:shadow-xl hover:shadow-amber-100/40 dark:hover:shadow-amber-900/20 transition-all duration-500 overflow-hidden cursor-pointer"
                onClick={() => setDetailOpen(true)}>
                <CardContent className="p-6">
                    {/* Avatar */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 font-semibold text-lg shrink-0 group-hover:from-amber-600 group-hover:to-amber-800 group-hover:text-white transition-all duration-500 shadow-md overflow-hidden">
                            {tutor.avatar_url ? (
                                <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-playfair text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                                {tutor.full_name}
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-500 font-medium">İngilizce Eğitmeni</p>
                            {rating && rating.count > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating.avg) ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} />
                                    ))}
                                    <span className="text-xs text-stone-500 ml-1">{rating.avg.toFixed(1)} ({rating.count})</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3 mb-4">
                        {tutor.bio || 'Deneyimli İngilizce eğitmeni, hedeflerinize ulaşmanıza yardımcı olmaya hazır.'}
                    </p>

                    {/* Detail Info */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 font-medium mb-4 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                        <Info className="w-3.5 h-3.5" />
                        <span>Detaylı bilgi için tıklayınız</span>
                    </div>

                    {/* Book Button */}
                    <Button
                        onClick={(e) => { e.stopPropagation(); handleBook(); }}
                        variant="outline"
                        className="w-full border-stone-200 dark:border-stone-800 dark:text-stone-300 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-800 hover:text-white hover:border-amber-600 dark:hover:border-amber-600 transition-all group/btn shadow-sm"
                    >
                        Ders Planla
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {detailOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDetailOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-stone-950 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors z-10">
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header with photo */}
                        <div className="p-6 pb-4 text-center border-b border-stone-100 dark:border-stone-800/60">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 text-3xl font-bold overflow-hidden ring-4 ring-amber-100 shadow-lg mb-4">
                                {tutor.avatar_url ? (
                                    <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <h2 className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100">{tutor.full_name}</h2>
                            <p className="text-amber-700 dark:text-amber-500 font-medium text-sm mt-1">İngilizce Eğitmeni</p>
                        </div>

                        {/* Bio Section */}
                        <div className="p-6 space-y-5">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                                    <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Hakkında</h3>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {tutor.bio || 'Deneyimli İngilizce eğitmeni, hedeflerinize ulaşmanıza yardımcı olmaya hazır.'}
                                </p>
                            </div>

                            {/* Video Section */}
                            {tutor.video_intro_url && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Video className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                                        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">Tanıtım Videosu</h3>
                                    </div>
                                    <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-inner">
                                        {getEmbedUrl(tutor.video_intro_url)?.includes('youtube.com/embed') ? (
                                            <iframe
                                                src={getEmbedUrl(tutor.video_intro_url)!}
                                                title={`${tutor.full_name} Tanıtım Videosu`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <a href={tutor.video_intro_url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-center h-full text-white hover:text-amber-300 transition-colors">
                                                <div className="text-center">
                                                    <Video className="w-12 h-12 mx-auto mb-2 opacity-60" />
                                                    <span className="text-sm font-medium">Videoyu İzle →</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Book Button */}
                            <Button
                                onClick={handleBook}
                                className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-md"
                                size="lg"
                            >
                                Ders Planla
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

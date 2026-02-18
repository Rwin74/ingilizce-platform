'use client';

import { useState, useEffect } from 'react';
import { getTutors } from '@/lib/supabase/service';
import { MOCK_TUTORS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, GraduationCap, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/types';

export default function StudentDashboard() {
    const [search, setSearch] = useState('');
    const [allTutors, setAllTutors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const real = await getTutors();
            // Always show mock tutors + real tutors (deduplicate by ID)
            const realIds = new Set(real.map((t) => t.id));
            const mockNotDuplicated = MOCK_TUTORS.filter((m) => !realIds.has(m.id));
            setAllTutors([...real, ...mockNotDuplicated]);
            setLoading(false);
        }
        load();
    }, []);

    const tutors = allTutors.filter(
        (t) =>
            t.full_name.toLowerCase().includes(search.toLowerCase()) ||
            t.bio?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900">Eğitmenleri Keşfet</h1>
                <p className="text-stone-500 mt-1">Sana uygun eğitmeni bul ve hemen ders planla.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input placeholder="İsme veya uzmanlık alanına göre ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-stone-200 bg-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {tutors.map((tutor) => (
                    <TutorBrowseCard key={tutor.id} tutor={tutor} />
                ))}
            </div>

            {tutors.length === 0 && (
                <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-400">Aramanıza uygun eğitmen bulunamadı.</p>
                </div>
            )}
        </div>
    );
}

function TutorBrowseCard({ tutor }: { tutor: Profile }) {
    const initials = tutor.full_name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
        <Card className="group border-stone-200/60 hover:border-amber-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 font-semibold text-lg shrink-0 group-hover:from-amber-600 group-hover:to-amber-800 group-hover:text-white transition-all duration-300">
                        {tutor.avatar_url ? <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full rounded-xl object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-stone-900">{tutor.full_name}</h3>
                                <p className="text-xs text-amber-700 font-medium">İngilizce Eğitmeni</p>
                            </div>
                            {tutor.video_intro_url && (
                                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-md">
                                    <Video className="w-3 h-3" />Video
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-2">{tutor.bio || 'Deneyimli İngilizce eğitmeni.'}</p>
                        <Link href={`/dashboard/student/tutor/${tutor.id}`} className="block mt-3">
                            <Button variant="outline" size="sm" className="w-full border-stone-200 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-800 hover:text-white hover:border-amber-600 transition-all group/btn">
                                Profili Gör & Ders Planla
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { getTutors } from '@/lib/supabase/service';
import { TutorCard } from './TutorCard';
import type { Profile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function TutorRoster() {
    const [tutors, setTutors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const real = await getTutors();
            setTutors(real);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <section id="egitmenler" className="py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-14">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-3">
                        Uzman Kadro
                    </p>
                    <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                        Eğitmenlerimizle Tanışın
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 max-w-xl mx-auto text-lg">
                        Her eğitmen uzmanlığı, öğretim tarzı ve öğrenme tutku ile özenle seçilmiştir.
                    </p>
                </div>

                {/* Tutor Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
                    </div>
                ) : tutors.length === 0 ? (
                    <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/50 rounded-lg">
                        <p className="text-stone-500 dark:text-stone-400">Henüz listelenecek eğitmen bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {tutors.map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

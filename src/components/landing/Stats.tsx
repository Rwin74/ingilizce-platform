'use client';

import { GraduationCap, Globe, Award, Users } from 'lucide-react';

const stats = [
    { icon: GraduationCap, value: '6+', label: 'Uzman Eğitmen', color: 'from-amber-500 to-amber-700' },
    { icon: Users, value: '500+', label: 'Aktif Öğrenci', color: 'from-blue-500 to-blue-700' },
    { icon: Globe, value: '1.200+', label: 'Tamamlanan Ders', color: 'from-emerald-500 to-emerald-700' },
    { icon: Award, value: '%98', label: 'Memnuniyet Oranı', color: 'from-violet-500 to-violet-700' },
];

export function Stats() {
    return (
        <section className="py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                                Rakamlarla LinguaElite
                            </h2>
                            <p className="text-stone-400 text-sm">Büyüyen topluluğumuzun gücüne katılın</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center group">
                                    <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold text-white font-playfair mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-stone-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

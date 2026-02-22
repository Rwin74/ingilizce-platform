'use client';

import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function Hero() {
    const { setAuthModalOpen, setAuthModalTab } = useAppStore();

    return (
        <section className="relative pt-28 pb-12 lg:pt-36 lg:pb-20 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-40 right-10 w-64 h-64 bg-stone-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                {/* Grid Dots Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — Text Content */}
                    <div className="text-center lg:text-left">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 text-sm font-medium mb-8 border border-amber-200/60 shadow-sm">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            500+ öğrenci güveniyor
                        </div>

                        {/* Headline */}
                        <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.08] mb-6">
                            İngilizceni{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                                    Uzman Eğitmenlerle
                                </span>
                                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 8C50 2 100 4 150 6C200 8 250 4 298 7" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
                                    <defs><linearGradient id="grad"><stop stopColor="#b45309" /><stop offset="1" stopColor="#ea580c" /></linearGradient></defs>
                                </svg>
                            </span>{' '}
                            Geliştir
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                            Sertifikalı eğitmenlerle <strong className="text-stone-700 dark:text-stone-300">birebir online dersler</strong> al.
                            IELTS hazırlık, iş İngilizcesi, konuşma pratiği — hedefine göre özelleştirilmiş programlar.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10">
                            <Button
                                size="lg"
                                onClick={() => {
                                    setAuthModalTab('register');
                                    setAuthModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-amber-700/25 hover:shadow-xl hover:shadow-amber-700/30 transition-all group"
                            >
                                Hemen Başla
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    document.getElementById('egitmenler')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-6 text-base rounded-xl border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Eğitmenleri Gör
                            </Button>
                        </div>

                        {/* Social Proof Avatars */}
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                            <div className="flex -space-x-2">
                                {['bg-amber-300', 'bg-stone-300', 'bg-orange-300', 'bg-amber-400', 'bg-stone-400'].map((bg, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}>
                                        {['A', 'B', 'C', 'D', 'E'][i]}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5"><strong className="text-stone-600 dark:text-stone-300">4.9/5</strong> ortalama puan</p>
                            </div>
                        </div>
                    </div>

                    {/* Right — Visual */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-md">
                            {/* Main Card */}
                            <div className="relative bg-white dark:bg-stone-950 rounded-3xl shadow-2xl shadow-stone-300/30 dark:shadow-black/60 border border-stone-200/60 dark:border-stone-800/60 p-6 z-10">
                                {/* Video Call Preview */}
                                <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl h-48 sm:h-56 flex items-center justify-center relative overflow-hidden mb-4">
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(245,158,11,0.4), transparent 70%)'
                                    }} />
                                    {/* Tutor silhouette */}
                                    <div className="text-center z-10">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                        <p className="text-white font-semibold text-sm">Sarah Mitchell</p>
                                        <p className="text-amber-400 text-xs">İngilizce Eğitmeni</p>
                                    </div>
                                    {/* Live badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur px-2.5 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-white text-[10px] font-bold">CANLI DERS</span>
                                    </div>
                                    {/* Duration */}
                                    <div className="absolute top-3 right-3 bg-white/10 backdrop-blur px-2 py-1 rounded-md">
                                        <span className="text-white text-[10px] font-medium">45:22</span>
                                    </div>
                                </div>

                                {/* Upcoming Lesson Card */}
                                <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-900/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Sıradaki Ders</span>
                                        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full font-medium">Bugün</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-200 font-bold text-sm">JH</div>
                                        <div>
                                            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">James Harrington</p>
                                            <p className="text-xs text-stone-500 dark:text-stone-400">14:00 – 15:00 · İş İngilizcesi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-4 -left-4 bg-white dark:bg-stone-900 rounded-xl shadow-lg shadow-stone-200/40 dark:shadow-black/60 border border-stone-100 dark:border-stone-800 px-4 py-3 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Randevu Onaylandı</p>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500">2 dakika önce</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-3 -right-3 bg-white dark:bg-stone-900 rounded-xl shadow-lg shadow-stone-200/40 dark:shadow-black/60 border border-stone-100 dark:border-stone-800 px-4 py-3 z-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/80 flex items-center justify-center text-sm">🎓</div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">1.200+ ders tamamlandı</p>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500">bu ay</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

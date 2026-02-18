'use client';

import { Calendar, Video, Shield, MessageCircle, Clock, Zap } from 'lucide-react';

const features = [
    {
        icon: Calendar,
        title: 'Akıllı Randevu Sistemi',
        description: 'Eğitmenin müsait olduğu saatleri görüntüle, tek tıkla ders talep et. Onay geldiğinde hemen dersine katıl.',
        gradient: 'from-blue-500 to-blue-700',
        bgGlow: 'bg-blue-100',
        visual: (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-stone-100 p-3">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">Şubat 2026</span>
                    <div className="flex gap-1">
                        <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[10px] text-stone-400">‹</div>
                        <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[10px] text-stone-400">›</div>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-1">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map(d => (
                        <div key={d} className="text-[9px] text-center text-stone-400 font-medium py-1">{d}</div>
                    ))}
                    {[17, 18, 19, 20, 21].map((d, i) => (
                        <div key={d} className={`text-center py-1.5 rounded-md text-[10px] font-medium ${i === 2 ? 'bg-amber-500 text-white shadow-sm' : i === 1 || i === 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-stone-400'
                            }`}>{d}</div>
                    ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-stone-500">Müsait saatler mevcut</span>
                </div>
            </div>
        ),
    },
    {
        icon: Video,
        title: 'Canlı Video Dersler',
        description: 'Google Meet veya Zoom üzerinden birebir canlı dersler. Eğitmenin belirlediği link ile tek tıkla katıl.',
        gradient: 'from-violet-500 to-violet-700',
        bgGlow: 'bg-violet-100',
        visual: (
            <div className="mt-4 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.5), transparent 70%)'
                }} />
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-white/80 font-medium">Canlı</span>
                    </div>
                    <span className="text-[10px] text-white/60">32:15</span>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-[8px] text-white font-bold">SM</div>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-600/30 border border-amber-500/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-white font-bold">SN</div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 relative z-10">
                    {['🎤', '📹', '💬'].map((emoji, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">{emoji}</div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center text-xs">📞</div>
                </div>
            </div>
        ),
    },
    {
        icon: Shield,
        title: 'Onay & Güvenlik',
        description: 'Her randevu eğitmen onayından geçer. Durum takibi ile "Beklemede", "Onaylandı" veya "Reddedildi" bilgisi anlık.',
        gradient: 'from-emerald-500 to-emerald-700',
        bgGlow: 'bg-emerald-100',
        visual: (
            <div className="mt-4 space-y-2">
                {[
                    { status: 'Onaylandı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', name: 'Sarah M.' },
                    { status: 'Beklemede', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', name: 'James H.' },
                    { status: 'Tamamlandı', color: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400', name: 'Emma C.' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-stone-100 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[8px] font-bold text-stone-600">{item.name.split(' ').map(n => n[0]).join('')}</div>
                            <span className="text-[10px] text-stone-700 font-medium">{item.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border ${item.color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                            {item.status}
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: MessageCircle,
        title: 'Eğitmen Tanıtım Videoları',
        description: 'Her eğitmenin kısa tanıtım videosunu ders almadan önce izleyin. Eğitim tarzını ve kişiliğini önceden tanıyın.',
        gradient: 'from-rose-500 to-rose-700',
        bgGlow: 'bg-rose-100',
        visual: (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-stone-100 p-3">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-200 to-rose-300 flex items-center justify-center shrink-0 relative">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-rose-600 border-b-[5px] border-b-transparent ml-0.5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-stone-800">Emma Clarke</p>
                        <p className="text-[9px] text-stone-400">2 dk tanıtım videosu</p>
                        <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-2.5 h-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        icon: Clock,
        title: 'Esnek Programlama',
        description: 'Eğitmenler haftalık müsaitlik takvimlerini kendileri belirler. Sabahtan akşama, istediğin saati seç.',
        gradient: 'from-amber-500 to-amber-700',
        bgGlow: 'bg-amber-100',
        visual: (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-stone-100 p-3">
                <div className="grid grid-cols-4 gap-1.5">
                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((t, i) => (
                        <div key={t} className={`text-center py-1.5 rounded-md text-[10px] font-medium transition-all ${i === 1 ? 'bg-amber-500 text-white shadow-sm' : i === 3 || i === 5 ? 'bg-stone-200 text-stone-400 line-through' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>{t}</div>
                    ))}
                </div>
                <p className="text-[9px] text-stone-400 mt-2 text-center">✓ Seçilen saat: 10:00 – 11:00</p>
            </div>
        ),
    },
    {
        icon: Zap,
        title: 'Anlık Bildirimler',
        description: 'Randevu onayı, ders hatırlatması, meeting link paylaşımı — tüm bilgiler anında panelinde.',
        gradient: 'from-orange-500 to-orange-700',
        bgGlow: 'bg-orange-100',
        visual: (
            <div className="mt-4 space-y-2">
                {[
                    { emoji: '✅', text: 'Randevunuz onaylandı!', time: '2 dk önce', highlight: true },
                    { emoji: '🔗', text: 'Meeting linki eklendi', time: '5 dk önce', highlight: false },
                    { emoji: '⏰', text: 'Dersinize 30 dk kaldı', time: '28 dk önce', highlight: false },
                ].map((n, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[10px] ${n.highlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-100'
                        }`}>
                        <span className="text-sm">{n.emoji}</span>
                        <div className="flex-1">
                            <p className={`font-medium ${n.highlight ? 'text-orange-800' : 'text-stone-700'}`}>{n.text}</p>
                            <p className="text-stone-400 text-[9px]">{n.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
];

export function Features() {
    return (
        <section id="ozellikler" className="py-20 lg:py-28 bg-gradient-to-b from-stone-50/80 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200/60">
                        <Zap className="w-3 h-3" />
                        Platform Özellikleri
                    </div>
                    <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
                        Her Şey{' '}
                        <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                            Tek Platformda
                        </span>
                    </h2>
                    <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Randevu almaktan canlı derse katılmaya kadar tüm süreç dijital ve sorunsuz. İşte size sunduğumuz özellikler:
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl border border-stone-200/60 p-6 hover:shadow-xl hover:shadow-stone-200/40 hover:border-stone-300 transition-all duration-500 overflow-hidden"
                        >
                            {/* Glow Effect */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`} />

                            {/* Icon */}
                            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg mb-4`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Text */}
                            <h3 className="font-playfair text-lg font-bold text-stone-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>

                            {/* Interactive Visual */}
                            {feature.visual}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

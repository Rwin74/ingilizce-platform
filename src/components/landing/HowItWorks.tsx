'use client';

import { UserPlus, CalendarCheck, Video } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: 'Hesap Oluştur',
        description: 'Saniyeler içinde kayıt ol. Öğrenci veya eğitmen olarak rolünü seç ve profilini oluştur.',
        step: '01',
    },
    {
        icon: CalendarCheck,
        title: 'Ders Talep Et',
        description: 'Eğitmenleri incele, müsaitlik takvimini gör ve sana uygun saatte ders randevusu talep et.',
        step: '02',
    },
    {
        icon: Video,
        title: 'Dersine Katıl',
        description: 'Eğitmen onayladıktan sonra meeting linkine tıkla ve dersin başlasın. Dünyanın her yerinden katıl.',
        step: '03',
    },
];

export function HowItWorks() {
    return (
        <section id="nasil-calisir" className="py-20 lg:py-28 bg-gradient-to-b from-white to-stone-50/80 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
                        Kolay Süreç
                    </p>
                    <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
                        Nasıl Çalışır?
                    </h2>
                    <p className="text-stone-500 max-w-xl mx-auto text-lg">
                        İlk dersine başlamak çok kolay. Sadece üç adım yeterli.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative text-center group">
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px]">
                                    <div className="h-full bg-gradient-to-r from-amber-300 to-amber-100 rounded-full" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className="relative inline-flex mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-stone-200/60 flex items-center justify-center shadow-lg shadow-stone-200/30 group-hover:shadow-xl group-hover:shadow-amber-200/30 group-hover:border-amber-200 transition-all duration-500">
                                    <step.icon className="w-10 h-10 text-stone-400 group-hover:text-amber-600 transition-colors duration-500" />
                                </div>
                                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white text-sm font-bold flex items-center justify-center border-2 border-white shadow-md">
                                    {step.step}
                                </span>
                            </div>

                            {/* Text */}
                            <h3 className="font-playfair text-xl font-bold text-stone-900 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

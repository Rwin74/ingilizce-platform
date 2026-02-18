'use client';

import { BookOpen } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function Footer() {
    const { setAuthModalOpen, setAuthModalTab } = useAppStore();

    return (
        <footer className="bg-stone-900 text-stone-300">
            {/* CTA Banner */}
            <div className="border-b border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
                    <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                        İngilizce Öğrenmeye Bugün Başla
                    </h2>
                    <p className="text-stone-400 max-w-lg mx-auto mb-6">
                        Uzman eğitmenlerimizle tanış, müsait saatleri incele ve ilk dersini hemen planla. Ücretsiz kayıt ol.
                    </p>
                    <Button
                        onClick={() => {
                            setAuthModalTab('register');
                            setAuthModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white px-8 py-5 text-base rounded-xl shadow-lg shadow-amber-700/20"
                    >
                        Ücretsiz Kayıt Ol
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-playfair text-lg font-bold text-white">LinguaElite</span>
                        </div>
                        <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
                            Profesyonel İngilizce eğitim platformu. Alanında uzman eğitmenlerle birebir özel ders deneyimi.
                        </p>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hızlı Linkler</h4>
                        <ul className="space-y-2.5">
                            <li><a href="#ozellikler" className="text-sm text-stone-400 hover:text-white transition-colors">Özellikler</a></li>
                            <li><a href="#egitmenler" className="text-sm text-stone-400 hover:text-white transition-colors">Eğitmenler</a></li>
                            <li><a href="#nasil-calisir" className="text-sm text-stone-400 hover:text-white transition-colors">Nasıl Çalışır</a></li>
                            <li><a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">Gizlilik Politikası</a></li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">İletişim</h4>
                        <ul className="space-y-2.5">
                            <li className="text-sm text-stone-400">destek@linguaelite.com</li>
                            <li className="text-sm text-stone-400">Pzt - Cum, 09:00 - 18:00</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-stone-500">&copy; {new Date().getFullYear()} LinguaElite. Tüm hakları saklıdır.</p>
                    <p className="text-xs text-stone-500">Öğrenme tutkusuyla inşa edildi.</p>
                </div>
            </div>
        </footer>
    );
}

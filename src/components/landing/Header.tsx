'use client';

import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import Link from 'next/link';

export function Header() {
    const { setAuthModalOpen, setAuthModalTab, user } = useAppStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogin = () => {
        setAuthModalTab('login');
        setAuthModalOpen(true);
        setMobileOpen(false);
    };

    const handleRegister = () => {
        setAuthModalTab('register');
        setAuthModalOpen(true);
        setMobileOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-lg border-b border-stone-200/60 dark:border-stone-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center group-hover:from-amber-700 group-hover:to-amber-900 transition-all shadow-md shadow-amber-600/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-playfair text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                            LinguaElite
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#ozellikler" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                            Özellikler
                        </a>
                        <a href="#egitmenler" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                            Eğitmenler
                        </a>
                        <a href="#nasil-calisir" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                            Nasıl Çalışır
                        </a>
                        {user ? (
                            <Link href={`/dashboard/${user.role}`}>
                                <Button variant="default" className="bg-amber-700 hover:bg-amber-800">
                                    Panelim
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" onClick={handleLogin} className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100">
                                    Giriş Yap
                                </Button>
                                <Button onClick={handleRegister} className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-md shadow-amber-600/20">
                                    Ücretsiz Başla
                                </Button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden pb-6 pt-2 border-t border-stone-100 dark:border-stone-800/60 animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-3">
                            <a href="#ozellikler" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-stone-600 dark:text-stone-300 py-2">
                                Özellikler
                            </a>
                            <a href="#egitmenler" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-stone-600 dark:text-stone-300 py-2">
                                Eğitmenler
                            </a>
                            <a href="#nasil-calisir" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-stone-600 dark:text-stone-300 py-2">
                                Nasıl Çalışır
                            </a>
                            <div className="flex flex-col gap-2 pt-3 border-t border-stone-100 dark:border-stone-800/60">
                                <Button variant="outline" onClick={handleLogin} className="w-full">Giriş Yap</Button>
                                <Button onClick={handleRegister} className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white">
                                    Ücretsiz Başla
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

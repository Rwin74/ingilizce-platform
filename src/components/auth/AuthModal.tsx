'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { signIn, signUp, getCurrentUser } from '@/lib/supabase/service';
import { MOCK_TUTORS, MOCK_STUDENT } from '@/lib/mock-data';
import { Users, GraduationCap, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export function AuthModal() {
    const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, setUser } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [registerRole, setRegisterRole] = useState<UserRole>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signIn(email, password);
            const profile = await getCurrentUser();
            if (profile) {
                setUser(profile);
                setAuthModalOpen(false);
                resetForm();
                window.location.href = `/dashboard/${profile.role}`;
            }
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials'
                ? 'E-posta veya şifre hatalı.'
                : err.message || 'Giriş yapılamadı.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        setIsLoading(true);
        try {
            await signUp(email, password, fullName, registerRole);
            // Auto login after signup
            await signIn(email, password);
            const profile = await getCurrentUser();
            if (profile) {
                setUser(profile);
                setAuthModalOpen(false);
                resetForm();
                window.location.href = `/dashboard/${profile.role}`;
            }
        } catch (err: any) {
            if (err.message?.includes('already registered')) {
                setError('Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.');
            } else {
                setError(err.message || 'Kayıt oluşturulamadı.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = (role: UserRole) => {
        setIsLoading(true);
        setTimeout(() => {
            if (role === 'student') {
                setUser({ ...MOCK_STUDENT, role: 'student' });
            } else {
                setUser({ ...MOCK_TUTORS[0], role: 'tutor' });
            }
            setIsLoading(false);
            setAuthModalOpen(false);
            resetForm();
            window.location.href = `/dashboard/${role}`;
        }, 600);
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setError('');
    };

    return (
        <Dialog open={authModalOpen} onOpenChange={(open) => { setAuthModalOpen(open); if (!open) resetForm(); }}>
            <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-stone-200 dark:border-stone-800 dark:bg-stone-950">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="font-playfair text-xl text-stone-900 dark:text-stone-100">
                        {authModalTab === 'login' ? 'Tekrar Hoşgeldin' : 'Aramıza Katıl'}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={authModalTab} onValueChange={(v) => { setAuthModalTab(v as 'login' | 'register'); setError(''); }} className="w-full">
                    <div className="px-6 pt-4">
                        <TabsList className="w-full grid grid-cols-2 bg-stone-100 dark:bg-stone-900">
                            <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 dark:data-[state=active]:text-stone-100 dark:text-stone-400">Giriş Yap</TabsTrigger>
                            <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-800 dark:data-[state=active]:text-stone-100 dark:text-stone-400">Kayıt Ol</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Giriş */}
                    <TabsContent value="login" className="p-6 pt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="text-stone-700 dark:text-stone-300">E-posta</Label>
                                <Input id="login-email" type="email" placeholder="isim@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-amber-400" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-stone-700 dark:text-stone-300">Şifre</Label>
                                <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-amber-400" required />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white" disabled={isLoading}>
                                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </Button>
                        </form>

                        <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-xs text-stone-400 dark:text-stone-500 text-center mb-3">Hızlı Demo Erişimi</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('student')} className="border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50">
                                    <Users className="w-3.5 h-3.5 mr-1.5" />
                                    Öğrenci
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('tutor')} className="border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50">
                                    <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                                    Eğitmen
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Kayıt */}
                    <TabsContent value="register" className="p-6 pt-4">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-stone-700 dark:text-stone-300">Ben bir...</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setRegisterRole('student')} className={`p-3 rounded-lg border text-sm font-medium transition-all ${registerRole === 'student' ? 'border-amber-700 bg-gradient-to-r from-amber-600 to-amber-800 text-white' : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50'}`}>
                                        <Users className="w-5 h-5 mx-auto mb-1.5" />
                                        Öğrenci
                                    </button>
                                    <button type="button" onClick={() => setRegisterRole('tutor')} className={`p-3 rounded-lg border text-sm font-medium transition-all ${registerRole === 'tutor' ? 'border-amber-700 bg-gradient-to-r from-amber-600 to-amber-800 text-white' : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50'}`}>
                                        <GraduationCap className="w-5 h-5 mx-auto mb-1.5" />
                                        Eğitmen
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-name" className="text-stone-700 dark:text-stone-300">Ad Soyad</Label>
                                <Input id="reg-name" placeholder="Ahmet Yılmaz" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-amber-400" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email" className="text-stone-700 dark:text-stone-300">E-posta</Label>
                                <Input id="reg-email" type="email" placeholder="isim@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-amber-400" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password" className="text-stone-700 dark:text-stone-300">Şifre</Label>
                                <Input id="reg-password" type="password" placeholder="En az 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} className="border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 focus:border-amber-400" required />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white" disabled={isLoading}>
                                {isLoading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

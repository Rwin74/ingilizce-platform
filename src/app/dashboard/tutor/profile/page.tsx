'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { updateProfile, uploadAvatar, uploadCV } from '@/lib/supabase/service';
import { MOCK_TUTORS } from '@/lib/mock-data';
import { User, Save, CheckCircle2, Video, Camera, Loader2, ImagePlus, FileText, AlertCircle, ShieldCheck, Download, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TutorProfilePage() {
    const { user, setUser } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('tutor-');

    const profile = isDemo ? MOCK_TUTORS[0] : user!;
    const [fullName, setFullName] = useState(profile.full_name);
    const [bio, setBio] = useState(profile.bio || '');
    const [videoUrl, setVideoUrl] = useState(profile.video_intro_url || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
    const [cvUrl, setCvUrl] = useState(profile.cv_url || '');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [cvUploading, setCvUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cvInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isDemo || !user) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Lütfen bir resim dosyası seçin.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setUploading(true);
        try {
            const url = await uploadAvatar(user.id, file);
            setAvatarUrl(url);
            // Update profile immediately with new avatar
            await updateProfile(user.id, { avatar_url: url } as any);
            // Update global store
            setUser({ ...user, avatar_url: url });
        } catch (err) {
            alert('Fotoğraf yüklenirken hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isDemo || !user) return;

        if (file.type !== 'application/pdf') {
            alert('Lütfen PDF formatında bir dosya yükleyin.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
            return;
        }

        setCvUploading(true);
        try {
            const url = await uploadCV(user.id, file);
            if (url) {
                setCvUrl(url);
                // Update profile immediately
                await updateProfile(user.id, { cv_url: url, status: 'pending' } as any);
                setUser({ ...user, cv_url: url, status: 'pending' });
                alert('CV başarıyla yüklendi. Başvurunuz incelemeye alındı.');
            }
        } catch (err) {
            alert('CV yüklenirken hata oluştu.');
        } finally {
            setCvUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!isDemo && user) {
                await updateProfile(user.id, {
                    full_name: fullName,
                    bio,
                    video_intro_url: videoUrl || null,
                    avatar_url: avatarUrl || null,
                    cv_url: cvUrl || null,
                } as any);
                setUser({ ...user, full_name: fullName, bio, video_intro_url: videoUrl || null, avatar_url: avatarUrl || null, cv_url: cvUrl || null });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            alert('Kayıt sırasında hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="space-y-6">
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-stone-900 dark:text-stone-100">Profil Yönetimi</h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-1">Öğrencilere gösterilen profil bilgilerinizi düzenleyin.</p>
                    </div>
                    {user && !isDemo && (
                        <div className="flex items-center gap-2 bg-white dark:bg-stone-950 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm">
                            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Başvuru Durumu:</span>
                            <Badge
                                variant="outline"
                                className={
                                    user.status === 'approved' ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                        user.status === 'pending' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                                            'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                }
                            >
                                {user.status === 'approved' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Onaylı Eğitmen</> :
                                    user.status === 'pending' ? <><AlertCircle className="w-3 h-3 mr-1" />İnceleniyor</> :
                                        <><XCircle className="w-3 h-3 mr-1" />Reddedildi</>}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preview Card */}
                <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 lg:order-2">
                    <CardHeader>
                        <CardTitle className="text-sm text-stone-600 dark:text-stone-400 font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                            Önizleme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            {/* Avatar with upload */}
                            <div className="relative inline-block group mb-3">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 text-2xl font-bold overflow-hidden ring-4 ring-white dark:ring-stone-900 shadow-lg">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                                    ) : initials}
                                </div>
                                {!isDemo && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md hover:bg-amber-700 transition-colors group-hover:scale-110"
                                    >
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>
                            {!isDemo && (
                                <p className="text-[10px] text-stone-400 dark:text-stone-500 mb-3">Fotoğrafı değiştirmek için kamera ikonuna tıklayın</p>
                            )}
                            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{fullName}</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium mb-3">İngilizce Eğitmeni</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400 text-left leading-relaxed line-clamp-4">{bio || 'Henüz bir biyografi eklenmedi.'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 lg:col-span-2 lg:order-1">
                    <CardHeader>
                        <CardTitle className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <User className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                            Profil Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Avatar Upload Area */}
                        {!isDemo && (
                            <div className="space-y-2">
                                <Label className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5"><ImagePlus className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />Profil Fotoğrafı</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold overflow-hidden">
                                        {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : initials}
                                    </div>
                                    <div className="flex-1">
                                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="border-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                                            {uploading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Yükleniyor...</> : <><Camera className="w-3.5 h-3.5 mr-1.5" />Fotoğraf Yükle</>}
                                        </Button>
                                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">JPG, PNG veya WebP. Maksimum 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-stone-700 dark:text-stone-300">Ad Soyad</Label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="border-stone-200 dark:border-stone-800 focus:border-amber-400 dark:bg-stone-900 dark:text-stone-100" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-stone-700 dark:text-stone-300">Biyografi</Label>
                            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Kendinizi, deneyiminizi ve öğretim tarzınızı anlatın..." className="border-stone-200 dark:border-stone-800 focus:border-amber-400 dark:bg-stone-900 dark:text-stone-100" />
                            <p className="text-xs text-stone-400 dark:text-stone-500">{bio.length}/500 karakter</p>
                        </div>
                        <div className="space-y-2">
                            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="border-stone-200 dark:border-stone-800 focus:border-amber-400 dark:bg-stone-900 dark:text-stone-100" />
                        </div>

                        {!isDemo && (
                            <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-100 dark:border-stone-800/60">
                                <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                    Eğitmen Onayı için CV
                                </h4>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => cvInputRef.current?.click()}
                                        disabled={cvUploading || user?.status === 'approved'}
                                        className="bg-white dark:bg-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        {cvUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Yükleniyor...</> : <><FileText className="w-4 h-4 mr-2" />CV Yükle / Güncelle</>}
                                    </Button>
                                    <input
                                        ref={cvInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleCvUpload}
                                        className="hidden"
                                    />
                                    {cvUrl ? (
                                        <a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                                            CV Yüklendi
                                        </a>
                                    ) : (
                                        <span className="text-sm text-stone-500 dark:text-stone-400">Henüz CV yüklenmedi.</span>
                                    )}
                                </div>
                                <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Sadece PDF formatı. Onay sürecini başlatmak için zorunludur.</p>
                            </div>
                        )}
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900">
                            {saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Kaydedildi!</> : saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Kaydediliyor...</> : <><Save className="w-4 h-4 mr-2" />Değişiklikleri Kaydet</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

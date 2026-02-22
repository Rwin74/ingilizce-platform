'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getPendingTutors, approveTutor, rejectTutor, getAllUsers, deleteUser } from '@/lib/supabase/service';
import type { Profile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle, XCircle, FileText, Search, Trash2, ShieldCheck, ShieldAlert, AlertCircle
} from 'lucide-react';
import { AdminStats } from '@/components/dashboard/AdminStats';

export default function AdminDashboardPage() {
    const { user } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pendingTutors, setPendingTutors] = useState<Profile[]>([]);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('stats');

    useEffect(() => {
        if (!loading && (!user || !user.is_admin)) {
            // Redirect if not admin
            // For now, assume if status is NOT admin, redirect.
            // But we need to wait for profile load.
            // Let's rely on strict check.
        }
    }, [user, loading]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const pending = await getPendingTutors();
            setPendingTutors(pending);
            const users = await getAllUsers(search);
            setAllUsers(users);
            setLoading(false);
        }
        if (user?.is_admin) {
            loadData();
        } else if (user && !user.is_admin) {
            router.push('/dashboard');
        }
    }, [user, search, router]);

    const handleApprove = async (id: string) => {
        const success = await approveTutor(id);
        if (success) {
            setPendingTutors(prev => prev.filter(p => p.id !== id));
            alert('Eğitmen onaylandı.');
        } else {
            alert('Hata oluştu.');
        }
    };

    const handleReject = async (id: string) => {
        const success = await rejectTutor(id);
        if (success) {
            setPendingTutors(prev => prev.filter(p => p.id !== id));
            alert('Eğitmen reddedildi.');
        } else {
            alert('Hata oluştu.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        const success = await deleteUser(id);
        if (success) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'suspended' } : u));
            alert('Kullanıcı askıya alındı.');
        } else {
            alert('Hata oluştu.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>;
    }

    if (!user?.is_admin) {
        return <div className="p-8 text-center text-red-500 dark:text-red-400">Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Admin Paneli
            </h1>

            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="stats">İstatistikler</TabsTrigger>
                    <TabsTrigger value="pending">Onay Bekleyenler ({pendingTutors.length})</TabsTrigger>
                    <TabsTrigger value="users">Tüm Kullanıcılar</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="mt-6">
                    <AdminStats />
                </TabsContent>

                {/* PENDING TUTORS TAB */}
                <TabsContent value="pending" className="mt-6 space-y-4">
                    {pendingTutors.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-stone-900/50 rounded-lg border border-dashed dark:border-stone-800 text-gray-500 dark:text-gray-400">
                            Onay bekleyen eğitmen başvurusu yok.
                        </div>
                    ) : (
                        pendingTutors.map((tutor) => (
                            <Card key={tutor.id} className="overflow-hidden border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <Avatar className="h-20 w-20 border-2 border-gray-100 dark:border-stone-800/60">
                                            <AvatarImage src={tutor.avatar_url || ''} />
                                            <AvatarFallback>{tutor.full_name[0]}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100">{tutor.full_name}</h3>
                                                <Badge variant="outline" className="bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50">
                                                    Onay Bekliyor
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{tutor.email}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{tutor.bio || 'Biyografi yok.'}</p>

                                            {tutor.cv_url && (
                                                <div className="mt-4">
                                                    <a
                                                        href={tutor.cv_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        CV Görüntüle / İndir
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                                onClick={() => handleApprove(tutor.id)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Onayla
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={() => handleReject(tutor.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reddet
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* ALL USERS TAB */}
                <TabsContent value="users" className="mt-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="İsim ile ara..."
                            className="pl-10 dark:bg-stone-950/50 dark:border-stone-800/60 dark:text-stone-100 dark:placeholder:text-stone-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-6">
                        {/* SUSPENDED USERS SECTION */}
                        {allUsers.filter(u => u.status === 'suspended').length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/50 overflow-hidden">
                                <div className="bg-red-100 dark:bg-red-900/30 px-4 py-3 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <h3 className="font-bold text-red-800 dark:text-red-400">Askıya Alınan Kullanıcılar</h3>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-red-800 dark:text-red-400 border-b border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30">
                                        <tr>
                                            <th className="p-4 font-medium">Kullanıcı</th>
                                            <th className="p-4 font-medium">Rol</th>
                                            <th className="p-4 font-medium">Durum</th>
                                            <th className="p-4 font-medium">Kayıt Tarihi</th>
                                            <th className="p-4 font-medium text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-200 dark:divide-red-900/30">
                                        {allUsers.filter(u => u.status === 'suspended').map((u) => (
                                            <tr key={u.id} className="hover:bg-red-100/50 dark:hover:bg-red-900/20">
                                                <td className="p-4 flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-red-200 dark:border-red-900/50">
                                                        <AvatarImage src={u.avatar_url || ''} />
                                                        <AvatarFallback className="bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">{u.full_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-red-900 dark:text-red-300">{u.full_name}</div>
                                                        <div className="text-red-700/70 dark:text-red-400/70 text-xs">{u.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800/60">
                                                        {u.role === 'tutor' ? 'Eğitmen' : 'Öğrenci'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="secondary" className="bg-red-200 text-red-800 hover:bg-red-300 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/60">Askıda</Badge>
                                                </td>
                                                <td className="p-4 text-red-800 dark:text-red-400">
                                                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {/* Restore button could be added here */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ACTIVE USERS SECTION */}
                        <div className="bg-white dark:bg-stone-950/50 rounded-lg border border-stone-200/60 dark:border-stone-800/60 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-stone-900/50 px-4 py-3 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Aktif Kullanıcılar</h3>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-stone-900/50 text-gray-600 dark:text-gray-400 border-b border-stone-200/60 dark:border-stone-800/60">
                                    <tr>
                                        <th className="p-4 font-medium">Kullanıcı</th>
                                        <th className="p-4 font-medium">Rol</th>
                                        <th className="p-4 font-medium">Durum</th>
                                        <th className="p-4 font-medium">Kayıt Tarihi</th>
                                        <th className="p-4 font-medium text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                                    {allUsers.filter(u => u.status !== 'suspended').filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                Kullanıcı bulunamadı.
                                            </td>
                                        </tr>
                                    ) : (
                                        allUsers.filter(u => u.status !== 'suspended').filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-stone-900/50">
                                                <td className="p-4 flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={u.avatar_url || ''} />
                                                        <AvatarFallback className="dark:bg-stone-800">{u.full_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{u.full_name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-xs">{u.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={u.role === 'tutor' ? 'default' : 'secondary'}>
                                                        {u.role === 'tutor' ? 'Eğitmen' : 'Öğrenci'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            u.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' :
                                                                u.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50' :
                                                                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'
                                                        }
                                                    >
                                                        {u.status === 'approved' ? 'Onaylı' :
                                                            u.status === 'pending' ? 'Bekliyor' :
                                                                u.status === 'rejected' ? 'Reddedildi' : u.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400">
                                                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {!u.is_admin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

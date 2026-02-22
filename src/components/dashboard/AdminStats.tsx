'use client';

import { useState, useEffect } from 'react';
import { getAdminStats } from '@/lib/supabase/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, GraduationCap, CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

export function AdminStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getAdminStats();
            setStats(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" /></div>;
    }

    // Use real data from stats if available, otherwise fallback to empty structure
    const monthlyData = stats?.monthlyData || [
        { name: 'Oca', students: 0, lessons: 0 },
        { name: 'Şub', students: 0, lessons: 0 }
    ];

    return (
        <div className="space-y-8 animate-fade-in py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Toplam Kullanıcı" value={stats?.totalUsers} color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" />
                <StatCard icon={GraduationCap} label="Aktif Eğitmen" value={stats?.activeTutors} color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" />
                <StatCard icon={CalendarCheck} label="Tamamlanan Ders" value={stats?.completedLessons} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" />
                <StatCard icon={Clock} label="Bekleyen Başvuru" value={stats?.pendingApplications} color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-stone-900 dark:text-stone-100">Kullanıcı Büyümesi</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="students" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-stone-900 dark:text-stone-100">Ders Hacmi</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="lessons" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <Card className="border-stone-200/60 dark:border-stone-800/60 dark:bg-stone-950/50 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

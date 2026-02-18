'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getTutorStats, getBookingsForTutor } from '@/lib/supabase/service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Users, Star, Wallet, ArrowRight, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { Booking } from '@/lib/types';

export default function TutorDashboardPage() {
    const { user } = useAppStore();
    const [stats, setStats] = useState<any>(null);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (user?.id) {
                const [statsData, bookings] = await Promise.all([
                    getTutorStats(user.id),
                    getBookingsForTutor(user.id)
                ]);

                setStats(statsData);

                // Filter upcoming
                const now = new Date();
                const upcoming = bookings
                    .filter(b => new Date(`${b.booking_date}T${b.start_time}`) > now && b.status !== 'rejected' && b.status !== 'cancelled')
                    .slice(0, 5);
                setUpcomingBookings(upcoming);
            }
            setLoading(false);
        }
        load();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
    }

    // Use real data
    const monthlyData = stats?.monthlyData || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-3xl font-bold text-stone-900">Hoş Geldin, {user?.full_name}</h1>
                    <p className="text-stone-500 mt-1">İşte bu ayki performansın ve yaklaşan derslerin.</p>
                </div>
                <Link href="/dashboard/tutor/availability">
                    <Button className="bg-stone-900 hover:bg-stone-800 text-white gap-2">
                        <Calendar className="w-4 h-4" />
                        Müsaitlik Ayarla
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Calendar} label="Toplam Ders" value={stats?.totalLessons} color="bg-blue-100 text-blue-700" />
                <StatCard icon={Users} label="Öğrenci Sayısı" value={stats?.totalStudents} color="bg-purple-100 text-purple-700" />
                <StatCard icon={Star} label="Ortalama Puan" value={stats?.averageRating ? stats.averageRating.toFixed(1) : '-'} color="bg-amber-100 text-amber-700" subValue="/ 5.0" />
                <StatCard icon={Wallet} label="Tahmini Kazanç" value={`₺${stats?.estimatedEarnings}`} color="bg-emerald-100 text-emerald-700" subValue="Bu Ay" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* UPCOMING BOOKINGS */}
                <Card className="lg:col-span-2 border-stone-200/60 shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Yaklaşan Dersler</CardTitle>
                            <CardDescription>Sıradaki 5 randevun.</CardDescription>
                        </div>
                        <Link href="/dashboard/tutor/appointments" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                            Tümünü Gör <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingBookings.length === 0 ? (
                            <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-500">Yaklaşan ders bulunmuyor.</p>
                            </div>
                        ) : (
                            upcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-700 font-bold text-sm border-2 border-white shadow-sm">
                                            {booking.start_time.substring(0, 5)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-stone-900 flex items-center gap-2">
                                                {booking.student?.full_name}
                                                <Badge variant="outline" className="text-xs font-normal bg-white border-stone-200 text-stone-500">
                                                    {new Date(booking.booking_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </Badge>
                                            </h4>
                                            <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                                                <User className="w-3 h-3" /> {booking.student?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={booking.meeting_link || '#'} target="_blank">
                                        <Button size="sm" variant={booking.meeting_link ? "default" : "outline"} disabled={!booking.meeting_link} className={booking.meeting_link ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                                            {booking.meeting_link ? 'Derse Katıl' : 'Bekleniyor'}
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* EARNINGS CHART */}
                <Card className="border-stone-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Kazanç Özeti</CardTitle>
                        <CardDescription>Son 6 aylık tahmini gelir.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c' }} />
                                <Tooltip
                                    cursor={{ fill: '#f5f5f5' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₺${value}`, 'Kazanç']}
                                />
                                <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, subValue }: { icon: any, label: string, value: any, color: string, subValue?: string }) {
    return (
        <Card className="border-stone-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-stone-500 mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
                        {subValue && <span className="text-xs text-stone-400 font-medium">{subValue}</span>}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getStudentProgress } from '@/lib/supabase/service';
import type { StudentProgress } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, GraduationCap, BookOpen, Headphones, PenTool, Mic, History, User } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export default function StudentProgressPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('student-');

    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!isDemo && user) {
                const data = await getStudentProgress(user.id);
                setProgress(data);
            }
            setLoading(false);
        }
        load();
    }, [isDemo, user]);

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
    }

    if (!progress) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto p-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
                    <TrendingUp className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-3">Henüz Gelişim Raporun Yok</h2>
                <p className="text-stone-600 mb-6">
                    Eğitmenlerin seninle ilgili henüz bir değerlendirme yapmamış. Derslerini tamamladıkça burası dolacak.
                </p>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-stone-300 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-stone-300 animate-pulse delay-75" />
                    <div className="w-3 h-3 rounded-full bg-stone-300 animate-pulse delay-150" />
                </div>
            </div>
        );
    }

    const chartData = [
        { subject: 'Grammar', A: progress.grammar_score, fullMark: 100 },
        { subject: 'Vocabulary', A: progress.vocab_score, fullMark: 100 },
        { subject: 'Speaking', A: progress.speaking_score, fullMark: 100 },
        { subject: 'Listening', A: progress.listening_score, fullMark: 100 },
    ];

    const getLevelColor = (level: string) => {
        if (level.startsWith('A')) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (level.startsWith('B')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (level.startsWith('C')) return 'bg-purple-100 text-purple-700 border-purple-200';
        return 'bg-stone-100 text-stone-700 border-stone-200';
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-3xl font-bold text-stone-900">Gelişim Raporum</h1>
                    <p className="text-stone-500 mt-1">Dil öğrenme sürecindeki ilerlemen ve eğitmen değerlendirmeleri.</p>
                </div>
                <div className={`px-6 py-2 rounded-full border ${getLevelColor(progress.level)} flex items-center gap-2 font-bold`}>
                    <GraduationCap className="w-5 h-5" />
                    Seviye: {progress.level}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RADAR CHART */}
                <Card className="border-stone-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Yetenek Analizi</CardTitle>
                        <CardDescription>4 temel becerideki puan dağılımın.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Puan"
                                    dataKey="A"
                                    stroke="#d97706"
                                    fill="#d97706"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* BAR CHART & STATS */}
                <div className="space-y-6">
                    <Card className="border-stone-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detaylı Puanlar</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SkillBar icon={PenTool} label="Grammar" value={progress.grammar_score} color="text-blue-600" bg="bg-blue-600" />
                            <SkillBar icon={BookOpen} label="Vocabulary" value={progress.vocab_score} color="text-amber-600" bg="bg-amber-600" />
                            <SkillBar icon={Mic} label="Speaking" value={progress.speaking_score} color="text-emerald-600" bg="bg-emerald-600" />
                            <SkillBar icon={Headphones} label="Listening" value={progress.listening_score} color="text-purple-600" bg="bg-purple-600" />
                        </CardContent>
                    </Card>

                    {progress.notes && (
                        <Card className="bg-amber-50/50 border-amber-100">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                                    <User className="w-4 h-4" /> Eğitmen Notu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-stone-700 italic">"{progress.notes}"</p>
                                <p className="text-xs text-stone-400 mt-4 text-right">Son Güncelleme: {new Date(progress.updated_at).toLocaleDateString('tr-TR')}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkillBar({ icon: Icon, label, value, color, bg }: { icon: any, label: string, value: number, color: string, bg: string }) {
    return (
        <div>
            <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                </div>
                <span className={`font-bold ${color}`}>{value}/100</span>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${bg}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

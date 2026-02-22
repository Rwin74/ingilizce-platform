'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getBookingsForTutor } from '@/lib/supabase/service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, GraduationCap, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StudentProgressModal } from '@/components/dashboard/StudentProgressModal';
import type { Profile } from '@/lib/types';

export default function TutorStudentsPage() {
    const { user } = useAppStore();
    const isDemo = !user?.id || user.id.startsWith('tutor-');

    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        async function loadStudents() {
            if (!isDemo && user) {
                // Get all booking to extract unique students
                // Since getBookingsForTutor returns bookings with embedded 'student' profile
                const bookings = await getBookingsForTutor(user.id);

                // Map to unique students
                const studentMap = new Map<string, Profile>();
                bookings.forEach(b => {
                    if (b.student && b.student.id) {
                        studentMap.set(b.student.id, b.student);
                    }
                });

                setStudents(Array.from(studentMap.values()));
            }
            setLoading(false);
        }
        loadStudents();
    }, [isDemo, user]);

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Öğrencilerim</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">Ders verdiğiniz öğrencilerin listesi ve gelişim raporları.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-950/50 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800/60 shadow-sm flex items-center gap-4">
                <Search className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                <Input
                    placeholder="Öğrenci ara..."
                    className="border-none shadow-none focus-visible:ring-0 text-base dark:bg-transparent dark:text-stone-100 dark:placeholder:text-stone-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                    <User className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                    <p className="text-stone-500 dark:text-stone-400">Henüz kayıtlı öğrenciniz bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow group dark:bg-stone-950/50 dark:border-stone-800/60">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border border-stone-100 dark:border-stone-800/60">
                                            <AvatarImage src={student.avatar_url || ''} />
                                            <AvatarFallback className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200">{student.full_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">{student.full_name}</h3>
                                            <p className="text-sm text-stone-500 dark:text-stone-400">{student.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/60">
                                    <Button
                                        onClick={() => setSelectedStudent({ id: student.id, name: student.full_name })}
                                        className="w-full bg-stone-900 hover:bg-stone-800 text-white gap-2"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                        Gelişim Raporu
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedStudent && (
                <StudentProgressModal
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    studentId={selectedStudent.id}
                    studentName={selectedStudent.name}
                />
            )}
        </div>
    );
}

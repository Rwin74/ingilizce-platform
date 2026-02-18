import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider'; // Removed
import { Loader2, Save, GraduationCap } from 'lucide-react';
import { addStudentProgress, getStudentProgress } from '@/lib/supabase/service';
import type { StudentProgress } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface StudentProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

export function StudentProgressModal({ isOpen, onClose, studentId, studentName }: StudentProgressModalProps) {
    const { user } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [level, setLevel] = useState('Başlangıç');
    const [grammar, setGrammar] = useState(0);
    const [vocab, setVocab] = useState(0);
    const [speaking, setSpeaking] = useState(0);
    const [listening, setListening] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && studentId) {
            setFetching(true);
            getStudentProgress(studentId).then((data) => {
                if (data) {
                    setLevel(data.level);
                    setGrammar(data.grammar_score);
                    setVocab(data.vocab_score);
                    setSpeaking(data.speaking_score);
                    setListening(data.listening_score);
                    setNotes(data.notes || '');
                } else {
                    // Reset defaults
                    setLevel('Başlangıç');
                    setGrammar(0);
                    setVocab(0);
                    setSpeaking(0);
                    setListening(0);
                    setNotes('');
                }
                setFetching(false);
            });
        }
    }, [isOpen, studentId]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await addStudentProgress({
                student_id: studentId,
                tutor_id: user.id,
                level,
                grammar_score: grammar,
                vocab_score: vocab,
                speaking_score: speaking,
                listening_score: listening,
                notes
            });
            alert('Gelişim raporu kaydedildi.');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Kaydedilirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <GraduationCap className="w-6 h-6 text-amber-600" />
                        Gelişim Raporu: {studentName}
                    </DialogTitle>
                </DialogHeader>

                {fetching ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="level" className="font-semibold text-stone-700">Genel Seviye</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seviye Seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Başlangıç">Başlangıç (A0)</SelectItem>
                                    <SelectItem value="A1">A1 - Elementary</SelectItem>
                                    <SelectItem value="A2">A2 - Pre-Intermediate</SelectItem>
                                    <SelectItem value="B1">B1 - Intermediate</SelectItem>
                                    <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                                    <SelectItem value="C1">C1 - Advanced</SelectItem>
                                    <SelectItem value="C2">C2 - Proficiency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ScoreSlider label="Grammar (Dil Bilgisi)" value={grammar} onChange={setGrammar} />
                            <ScoreSlider label="Vocabulary (Kelime)" value={vocab} onChange={setVocab} />
                            <ScoreSlider label="Speaking (Konuşma)" value={speaking} onChange={setSpeaking} />
                            <ScoreSlider label="Listening (Dinleme)" value={listening} onChange={setListening} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes" className="font-semibold text-stone-700">Eğitmen Notları & Öneriler</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Öğrencinin güçlü ve zayıf yönleri, önerilen çalışma yöntemleri..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>İptal</Button>
                    <Button onClick={handleSave} disabled={loading || fetching} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Kaydet
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ScoreSlider({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s < 40) return 'text-red-500';
        if (s < 70) return 'text-amber-500';
        return 'text-emerald-600';
    };

    return (
        <div className="grid gap-3 p-4 border rounded-lg bg-stone-50">
            <div className="flex justify-between items-center">
                <Label className="font-medium text-stone-600">{label}</Label>
                <span className={`font-bold text-lg ${getColor(value)}`}>{value}/100</span>
            </div>
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={0}
                max={100}
                step={1}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
        </div>
    );
}

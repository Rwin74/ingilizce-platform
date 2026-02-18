'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, FileText, Upload, Download, CheckCircle2 } from 'lucide-react';
import type { Booking, LessonNote } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface LessonNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    existingNote: LessonNote | null;
    onSave: (content: string, file: File | null) => Promise<void>;
    mode: 'edit' | 'view';
}

export function LessonNoteModal({ isOpen, onClose, booking, existingNote, onSave, mode }: LessonNoteModalProps) {
    const [noteContent, setNoteContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && existingNote) {
            setNoteContent(existingNote.note_content || '');
            setFile(null); // Existing file is handled via URL
        } else if (isOpen) {
            setNoteContent('');
            setFile(null);
        }
    }, [isOpen, existingNote]);

    if (!booking) return null;

    const handleSave = async () => {
        if (!noteContent.trim()) {
            alert('Lütfen bir not girin.');
            return;
        }
        setSaving(true);
        try {
            await onSave(noteContent, file);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Kaydedilirken hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const isViewMode = mode === 'view';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        {isViewMode ? 'Ders Notları' : 'Ders Notu Ekle'}
                    </DialogTitle>
                    <DialogDescription>
                        {booking.booking_date} - {booking.start_time} dersi için notlar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Ders Notu / Geri Bildirim</Label>
                        {isViewMode ? (
                            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 min-h-[150px] whitespace-pre-wrap text-sm text-stone-800">
                                {existingNote?.note_content || 'Henüz not eklenmemiş.'}
                            </div>
                        ) : (
                            <Textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Öğrenci için ders notları, kelimeler ve ödevler..."
                                className="min-h-[150px]"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Ders Materyali / Ödev Dosyası</Label>

                        {isViewMode ? (
                            existingNote?.file_url ? (
                                <a
                                    href={existingNote.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-white text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-blue-900 text-sm">{existingNote.file_name || 'Ders Materyali'}</div>
                                        <div className="text-xs text-blue-500">İndirmek için tıklayın</div>
                                    </div>
                                    <Download className="w-4 h-4 text-blue-400" />
                                </a>
                            ) : (
                                <div className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-sm text-stone-400 italic text-center">
                                    Dosya eklenmemiş.
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                {existingNote?.file_url && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Mevcut dosya: <strong>{existingNote.file_name || 'Dosya'}</strong></span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full justify-start text-stone-600"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {file ? file.name : "Dosya Seç (PDF, Docx, Image)..."}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Kapat</Button>
                    {!isViewMode && (
                        <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Kaydediliyor...</> : <><Save className="w-4 h-4 mr-2" />Kaydet</>}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

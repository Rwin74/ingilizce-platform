'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-50/30">
            <Sidebar role="student" />
            <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
                <div className="max-w-5xl mx-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

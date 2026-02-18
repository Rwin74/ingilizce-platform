// Client-side helper to trigger email notifications via API route

export async function triggerEmailNotification(
    type: 'booking_request' | 'booking_approved' | 'booking_rejected',
    to: string,
    data: Record<string, string>
) {
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, to, data }),
        });
    } catch {
        // Silently fail — email is best-effort
        console.log('[Email] Failed to trigger email notification');
    }
}

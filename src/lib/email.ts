
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        return { error };
    }
}

export const EMAIL_TEMPLATES = {
    bookingRequest: (studentName: string, date: string, time: string) => `
        <h2>Yeni Ders İsteği</h2>
        <p>Merhaba,</p>
        <p><strong>${studentName}</strong> seninle bir ders planlamak istiyor.</p>
        <p><strong>Tarih:</strong> ${date}</p>
        <p><strong>Saat:</strong> ${time}</p>
        <p>Lütfen paneline giderek isteği onayla veya reddet.</p>
        <br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tutor/appointments" style="background: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Randevulara Git</a>
    `,

    bookingApproved: (tutorName: string, date: string, time: string) => `
        <h2>Randevunuz Onaylandı! ✅</h2>
        <p>Merhaba,</p>
        <p><strong>${tutorName}</strong> ders isteğini kabul etti.</p>
        <p><strong>Tarih:</strong> ${date}</p>
        <p><strong>Saat:</strong> ${time}</p>
        <p>Ders saatinde "Takvimim" sayfasındaki linke tıklayarak derse katılabilirsin.</p>
        <br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/schedule" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Takvime Git</a>
    `,

    bookingRejected: (tutorName: string, date: string, time: string) => `
        <h2>Randevu İsteğiniz Reddedildi ❌</h2>
        <p>Merhaba,</p>
        <p>Maalesef <strong>${tutorName}</strong>, ${date} ${time} tarihindeki ders isteğini kabul edemedi.</p>
        <p>Lütfen farklı bir zaman dilimi veya eğitmen seçmeyi dene.</p>
    `,

    bookingCancelled: (userName: string, date: string, time: string) => `
        <h2>Ders İptal Edildi ⚠️</h2>
        <p>Merhaba,</p>
        <p><strong>${userName}</strong>, ${date} ${time} tarihindeki dersi iptal etti.</p>
    `
};

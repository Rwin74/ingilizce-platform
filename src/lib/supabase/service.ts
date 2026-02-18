import { getSupabase } from './client';
import type { Profile, Availability, Booking, UserRole, Notification, NotificationType, Review, Message, LessonNote, StudentProgress } from '../types';
import { sendEmail, EMAIL_TEMPLATES } from '../email';

const supabase = () => getSupabase();

// Helper: check if a string is a valid UUID (Supabase uses UUIDs for IDs)
// Mock data IDs like "tutor-1", "student-1" are NOT valid UUIDs
function isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─── AUTH ───────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    const sb = supabase();
    if (!sb) throw new Error('Supabase bağlantısı yok');

    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, role },
        },
    });
    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    const sb = supabase();
    if (!sb) throw new Error('Supabase bağlantısı yok');

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const sb = supabase();
    if (!sb) return;
    await sb.auth.signOut();
}

export async function getCurrentUser() {
    const sb = supabase();
    if (!sb) return null;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: profile } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile as Profile | null;
}

// ─── PROFILES ───────────────────────────────────────

export async function getProfile(userId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return null;

    const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
    return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return;

    const { error } = await sb
        .from('profiles')
        .update({
            full_name: updates.full_name,
            bio: updates.bio,
            avatar_url: updates.avatar_url,
            video_intro_url: updates.video_intro_url,
        })
        .eq('id', userId);

    if (error) throw error;
}

export async function getTutors() {
    const sb = supabase();
    if (!sb) return [];

    const { data } = await sb
        .from('profiles')
        .select('*')
        .eq('role', 'tutor')
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

    return (data || []) as Profile[];
}

// ─── AVAILABILITY ───────────────────────────────────

export async function getAvailability(tutorId: string) {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return [];

    const { data } = await sb
        .from('availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('day_of_week')
        .order('start_time');

    return (data || []) as Availability[];
}

export async function saveAvailability(tutorId: string, slots: { day_of_week: number; start_time: string; end_time: string }[]) {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return;

    // Delete existing, then insert new
    await sb.from('availability').delete().eq('tutor_id', tutorId);

    if (slots.length > 0) {
        const rows = slots.map((s) => ({
            tutor_id: tutorId,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
        }));
        const { error } = await sb.from('availability').insert(rows);
        if (error) throw error;
    }
}

// ─── BOOKINGS ───────────────────────────────────────

// ─── BOOKINGS ───────────────────────────────────────

export async function createBooking(studentId: string, tutorId: string, date: string, startTime: string, endTime: string) {
    const sb = supabase();
    if (!sb) throw new Error('Supabase bağlantısı yok');
    if (!isUUID(studentId) || !isUUID(tutorId)) {
        throw new Error('Demo eğitmenlerle gerçek randevu oluşturulamaz. Lütfen gerçek bir eğitmen hesabı kullanın.');
    }

    // Validate future date
    const bookingDateTime = new Date(`${date}T${startTime}`);
    if (bookingDateTime < new Date()) {
        throw new Error('Geçmiş bir tarihe randevu oluşturulamaz.');
    }

    const { data, error } = await sb
        .from('bookings')
        .insert({
            student_id: studentId,
            tutor_id: tutorId,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Bu saat dilimi için randevu alınmış. Lütfen başka bir saat seçiniz.');
        }
        throw error;
    }

    // Send Notification & Email to Tutor
    const student = await getProfile(studentId);
    const tutor = await getProfile(tutorId);

    if (student && tutor) {
        await createNotification(
            tutorId,
            'booking_request',
            'Yeni Ders İsteği',
            `${student.full_name} seninle ${date} ${startTime} tarihinde ders yapmak istiyor.`,
            data.id
        );

        await sendEmail({
            to: tutor.email,
            subject: 'Yeni Ders İsteği - LinguaElite',
            html: EMAIL_TEMPLATES.bookingRequest(student.full_name, date, startTime)
        });
    }

    return data as Booking;
}

export async function getBookingsForTutor(tutorId: string) {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return [];

    const { data } = await sb
        .from('bookings')
        .select('*, student:profiles!bookings_student_id_fkey(*)')
        .eq('tutor_id', tutorId)
        .order('booking_date', { ascending: false })
        .order('start_time');

    return (data || []) as Booking[];
}

export async function getBookingsForStudent(studentId: string) {
    const sb = supabase();
    if (!sb || !isUUID(studentId)) return [];

    const { data } = await sb
        .from('bookings')
        .select('*, tutor:profiles!bookings_tutor_id_fkey(*)')
        .eq('student_id', studentId)
        .order('booking_date', { ascending: false })
        .order('start_time');

    return (data || []) as Booking[];
}

export async function updateBookingStatus(bookingId: string, status: 'approved' | 'rejected' | 'completed' | 'cancelled') {
    const sb = supabase();
    if (!sb || !isUUID(bookingId)) return;

    const { error } = await sb
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

    if (error) throw error;

    // Send Notification & Email to Student
    if (status === 'approved' || status === 'rejected') {
        const { data: booking } = await sb
            .from('bookings')
            .select('*, student:profiles!bookings_student_id_fkey(*), tutor:profiles!bookings_tutor_id_fkey(*)')
            .eq('id', bookingId)
            .single();

        if (booking && booking.student && booking.tutor) {
            const title = status === 'approved' ? 'Randevun Onaylandı ✅' : 'Randevun Reddedildi ❌';
            const message = status === 'approved'
                ? `${booking.tutor.full_name} ders isteğini onayladı. ${booking.booking_date} ${booking.start_time}`
                : `${booking.tutor.full_name} ders isteğini maalesef kabul edemedi.`;

            const type: NotificationType = status === 'approved' ? 'booking_approved' : 'booking_rejected';

            await createNotification(booking.student_id, type, title, message, booking.id);

            const emailHtml = status === 'approved'
                ? EMAIL_TEMPLATES.bookingApproved(booking.tutor.full_name, booking.booking_date, booking.start_time)
                : EMAIL_TEMPLATES.bookingRejected(booking.tutor.full_name, booking.booking_date, booking.start_time);

            await sendEmail({
                to: booking.student.email,
                subject: `Randevu Durumu: ${status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`,
                html: emailHtml
            });
        }
    }
}

export async function updateMeetingLink(bookingId: string, meetingLink: string) {
    const sb = supabase();
    if (!sb || !isUUID(bookingId)) return;

    const { error } = await sb
        .from('bookings')
        .update({ meeting_link: meetingLink })
        .eq('id', bookingId);

    if (error) throw error;
}

// ─── AVATAR UPLOAD ──────────────────────────────────

export async function uploadAvatar(userId: string, file: File): Promise<string> {
    const sb = supabase();
    if (!sb || !isUUID(userId)) throw new Error('Geçersiz kullanıcı');

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar.${ext}`;

    // Upload (upsert to overwrite existing)
    const { error } = await sb.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    // Get public URL
    const { data } = sb.storage.from('avatars').getPublicUrl(filePath);
    // Add cache-bust to force refresh
    return `${data.publicUrl}?t=${Date.now()}`;
}

// ─── NOTIFICATIONS ──────────────────────────────────

export async function getNotifications(userId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return [];

    const { data } = await sb
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    return (data || []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return 0;

    const { count } = await sb
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return count || 0;
}

export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedBookingId?: string
) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return;

    await sb.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        related_booking_id: relatedBookingId || null,
    });
}

export async function markAsRead(notificationId: string) {
    const sb = supabase();
    if (!sb || !isUUID(notificationId)) return;

    await sb
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
}

export async function markAllAsRead(userId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return;

    await sb
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
}

// ─── REVIEWS ──────────────────────────────────────

export async function createReview(
    studentId: string,
    tutorId: string,
    bookingId: string,
    rating: number,
    comment?: string
) {
    const sb = supabase();
    if (!sb || !isUUID(studentId) || !isUUID(tutorId)) throw new Error('Geçersiz ID');

    const { data, error } = await sb
        .from('reviews')
        .insert({
            student_id: studentId,
            tutor_id: tutorId,
            booking_id: bookingId,
            rating,
            comment: comment || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data as Review;
}

export async function getReviewsForTutor(tutorId: string) {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return [];

    const { data } = await sb
        .from('reviews')
        .select('*, student:student_id(id, full_name, avatar_url)')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

    return (data || []) as Review[];
}

export async function getAverageRating(tutorId: string): Promise<{ avg: number; count: number }> {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return { avg: 0, count: 0 };

    const { data } = await sb
        .from('reviews')
        .select('rating')
        .eq('tutor_id', tutorId);

    if (!data || data.length === 0) return { avg: 0, count: 0 };
    const sum = data.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
    return { avg: sum / data.length, count: data.length };
}

// ─── MESSAGES ──────────────────────────────────────

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    const sb = supabase();
    if (!sb || !isUUID(senderId) || !isUUID(receiverId)) throw new Error('Geçersiz ID');

    const { data, error } = await sb
        .from('messages')
        .insert({ sender_id: senderId, receiver_id: receiverId, content })
        .select()
        .single();

    if (error) throw error;
    return data as Message;
}

export async function getConversation(userId: string, otherId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId) || !isUUID(otherId)) return [];

    const { data } = await sb
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

    return (data || []) as Message[];
}

export async function getConversationList(userId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return [];

    // Get latest message per conversation partner
    const { data } = await sb
        .from('messages')
        .select('*, sender:sender_id(id, full_name, avatar_url, role), receiver:receiver_id(id, full_name, avatar_url, role)')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100);

    if (!data) return [];

    // Group by conversation partner, keep last message
    const convMap = new Map<string, Message>();
    data.forEach((msg: any) => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) convMap.set(partnerId, msg);
    });

    return Array.from(convMap.values());
}

export async function markMessagesAsRead(userId: string, senderId: string) {
    const sb = supabase();
    if (!sb || !isUUID(userId) || !isUUID(senderId)) return;

    await sb
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('sender_id', senderId)
        .eq('is_read', false);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return 0;

    const { count } = await sb
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

    return count || 0;
}

// Realtime subscription for new messages
export function subscribeToMessages(userId: string, callback: (msg: Message) => void) {
    const sb = supabase();
    if (!sb || !isUUID(userId)) return null;

    const channel = sb
        .channel('messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`,
        }, (payload: any) => {
            callback(payload.new as Message);
        })
        .subscribe();

    return channel;
}

// ─── ADMIN ──────────────────────────────────────────

export async function getPendingTutors() {
    const sb = supabase();
    if (!sb) return [];

    const { data } = await sb
        .from('profiles')
        .select('*')
        .eq('role', 'tutor')
        .eq('status', 'pending');

    return (data || []) as Profile[];
}

export async function approveTutor(tutorId: string) {
    const sb = supabase();
    if (!sb) return false;

    const { error } = await sb
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', tutorId);

    return !error;
}

export async function rejectTutor(tutorId: string) {
    const sb = supabase();
    if (!sb) return false;

    const { error } = await sb
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', tutorId);

    return !error;
}

export async function getAllUsers(search?: string) {
    const sb = supabase();
    if (!sb) return [];

    let query = sb
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.ilike('full_name', `%${search}%`);
    }

    const { data } = await query;
    return (data || []) as Profile[];
}

export async function deleteUser(userId: string) {
    // Note: Deleting a user from 'profiles' cascades to other tables if foreign keys are set correctly.
    // However, deleting from Supabase Auth requires Service Role key, which is not safe on client.
    // Here we just update status to 'suspended' or delete from public profile.
    const sb = supabase();
    if (!sb) return false;

    const { error } = await sb
        .from('profiles')
        .update({ status: 'suspended' }) // Soft delete/suspend
        .eq('id', userId);

    return !error;
}

// ─── STORAGE (CV & MATERIALS) ───────────────────────

export async function uploadCV(userId: string, file: File) {
    const sb = supabase();
    if (!sb) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await sb.storage
        .from('cvs')
        .upload(filePath, file, { upsert: true });

    if (error) {
        console.error('CV Upload Error:', error);
        return null;
    }

    // CVs are private, so we need a signed URL for admin to view
    // But for simplicity, we rely on RLS allowing admin to read
    // If public access fits, utilize getPublicUrl.
    // Since 'cvs' bucket is private by policy, getPublicUrl might return a URL that 403s for non-admins.
    const { data } = sb.storage.from('cvs').getPublicUrl(filePath);
    return data.publicUrl;
}

export async function uploadLessonMaterial(userId: string, file: File) {
    const sb = supabase();
    if (!sb) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await sb.storage
        .from('lesson_materials')
        .upload(filePath, file, { upsert: true });

    if (error) {
        console.error('Material Upload Error:', error);
        return null;
    }

    const { data } = sb.storage.from('lesson_materials').getPublicUrl(filePath);
    return data.publicUrl;
}

// ─── LESSON NOTES ───────────────────────────────────

export async function addLessonNote(
    bookingId: string,
    tutorId: string,
    studentId: string,
    content: string,
    fileUrl?: string,
    fileName?: string
) {
    const sb = supabase();
    if (!sb) return null;

    const { data, error } = await sb
        .from('lesson_notes')
        .upsert({
            booking_id: bookingId,
            tutor_id: tutorId,
            student_id: studentId,
            note_content: content,
            file_url: fileUrl,
            file_name: fileName,
        }, { onConflict: 'booking_id' })
        .select()
        .single();

    if (error) {
        console.error('Add Note Error:', error);
        return null;
    }
    return data as LessonNote;
}

export async function getLessonNote(bookingId: string) {
    const sb = supabase();
    if (!sb) return null;

    const { data, error } = await sb
        .from('lesson_notes')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Get Note Error:', error);
    }

    return (data as LessonNote) || null;
}

// ─── STUDENT PROGRESS ───────────────────────────────

export async function addStudentProgress(progressData: {
    student_id: string;
    tutor_id: string;
    level: string;
    grammar_score: number;
    vocab_score: number;
    speaking_score: number;
    listening_score: number;
    notes?: string;
}) {
    const sb = supabase();
    if (!sb) return null;

    const { data, error } = await sb
        .from('student_progress')
        .upsert({
            student_id: progressData.student_id,
            last_tutor_id: progressData.tutor_id,
            level: progressData.level,
            grammar_score: progressData.grammar_score,
            vocab_score: progressData.vocab_score,
            speaking_score: progressData.speaking_score,
            listening_score: progressData.listening_score,
            notes: progressData.notes,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' })
        .select()
        .single();

    if (error) {
        console.error('Progress Update Error:', error);
        return null;
    }
    return data as StudentProgress;
}

export async function getStudentProgress(studentId: string) {
    const sb = supabase();
    if (!sb) return null;

    const { data, error } = await sb
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Get Progress Error:', error);
    }

    return (data as StudentProgress) || null;
}

// ─── STATS ──────────────────────────────────────────

export async function getAdminStats() {
    const sb = supabase();
    if (!sb) return null;

    const [users, tutors, bookings, pendingTutors] = await Promise.all([
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor').eq('status', 'approved'),
        sb.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor').eq('status', 'pending'),
    ]);

    // Monthly Data Calculation (Client-side aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const { data: recentBookings } = await sb
        .from('bookings')
        .select('booking_date')
        .gte('booking_date', sixMonthsAgo.toISOString().split('T')[0])
        .eq('status', 'completed');

    const { data: recentStudents } = await sb
        .from('profiles')
        .select('created_at')
        .eq('role', 'student')
        .gte('created_at', sixMonthsAgo.toISOString());

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthName = d.toLocaleString('tr-TR', { month: 'short' });
        const monthKey = d.toISOString().slice(0, 7); // YYYY-MM

        const lessons = recentBookings?.filter((b: any) => b.booking_date.startsWith(monthKey)).length || 0;
        const students = recentStudents?.filter((s: any) => s.created_at.startsWith(monthKey)).length || 0;

        return { name: monthName, students, lessons };
    });

    return {
        totalUsers: users.count || 0,
        activeTutors: tutors.count || 0,
        completedLessons: bookings.count || 0,
        pendingApplications: pendingTutors.count || 0,
        monthlyData
    };
}

export async function getTutorStats(tutorId: string) {
    const sb = supabase();
    if (!sb || !isUUID(tutorId)) return null;

    // Completed Lessons
    const { count: lessonCount } = await sb
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');

    // Unique Students
    const { data: students } = await sb
        .from('bookings')
        .select('student_id')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');

    const uniqueStudents = new Set((students as { student_id: string }[])?.map(s => s.student_id)).size;

    // Average Rating
    const { avg } = await getAverageRating(tutorId);

    return {
        totalLessons: lessonCount || 0,
        totalStudents: uniqueStudents,
        averageRating: avg,
        // Mock earnings (Lesson count * 500 TL)
        estimatedEarnings: (lessonCount || 0) * 500
    };
}


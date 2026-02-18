export type UserRole = 'student' | 'tutor';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url: string | null;
    bio: string | null;
    video_intro_url: string | null;
    created_at: string;
    // New fields for Admin & Education features
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    cv_url?: string | null;
    is_admin?: boolean;
}

export interface LessonNote {
    id: string;
    booking_id: string;
    tutor_id: string;
    student_id: string;
    note_content: string | null;
    file_url: string | null;
    file_name: string | null;
    created_at: string;
}

export interface Availability {
    id: string;
    tutor_id: string;
    day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time: string;  // "HH:MM"
    end_time: string;    // "HH:MM"
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    student_id: string;
    tutor_id: string;
    booking_date: string; // "YYYY-MM-DD"
    start_time: string;   // "HH:MM"
    end_time: string;     // "HH:MM"
    status: BookingStatus;
    meeting_link: string | null;
    created_at: string;
    // Joined fields
    student?: Profile;
    tutor?: Profile;
}

export type NotificationType = 'booking_request' | 'booking_approved' | 'booking_rejected' | 'meeting_link';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    related_booking_id: string | null;
    created_at: string;
}

export interface Review {
    id: string;
    student_id: string;
    tutor_id: string;
    booking_id: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
    student?: Profile;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: Profile;
    receiver?: Profile;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 21; h++) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 21) TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`);
}

export interface StudentProgress {
    id: string;
    student_id: string;
    last_tutor_id?: string;
    level: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Başlangıç'
    grammar_score: number;
    vocab_score: number;
    speaking_score: number;
    listening_score: number;
    notes?: string;
    updated_at: string;
}


// This script simulates a race condition where multiple students try to book the same slot simultaneously.
// Run with: npx ts-node scripts/test_race_condition.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Update these IDs with real ones from your DB to test
const TUTOR_ID = 'REPLACE_WITH_REAL_TUTOR_ID';
const STUDENT_ID_1 = 'REPLACE_WITH_REAL_STUDENT_ID_1';
const STUDENT_ID_2 = 'REPLACE_WITH_REAL_STUDENT_ID_2';

async function attemptBooking(studentId: string, label: string) {
    console.log(`${label}: Starting booking request...`);
    const date = '2025-05-20'; // Future date
    const startTime = '10:00';
    const endTime = '11:00';

    const { data, error } = await supabase
        .from('bookings')
        .insert({
            student_id: studentId,
            tutor_id: TUTOR_ID,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.log(`${label}: Failed - ${error.message}`);
    } else {
        console.log(`${label}: SUCCESS! Booking ID: ${data.id}`);
    }
}

async function runTest() {
    console.log('--- STARTING RACE CONDITION TEST ---');

    // Fire 5 requests simultaneously
    const promises = [
        attemptBooking(STUDENT_ID_1, 'Req 1'),
        attemptBooking(STUDENT_ID_2, 'Req 2'),
        attemptBooking(STUDENT_ID_1, 'Req 3'), // Same student spamming
        attemptBooking(STUDENT_ID_2, 'Req 4'),
    ];

    await Promise.all(promises);
    console.log('--- TEST FINISHED ---');
}

// runTest();
// Commented out to prevent accidental execution.
// You need to set valid UUIDs first.

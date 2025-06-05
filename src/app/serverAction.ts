// app/actions.ts
'use server'; // This directive makes the entire file a Server Action file

import { cookies } from 'next/headers';

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('session-token');
    console.log("Session cookie cleared via Server Action.");
}
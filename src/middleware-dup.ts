// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(req: NextRequest) {
//     const sessionToken = req.cookies.get('session-token')?.value;
//     if (!sessionToken) {
//         return NextResponse.redirect(new URL('/sign-in', req.url));
//     }
//     return NextResponse.next();
// }

// export const config = {
//     matcher: [], 
// };

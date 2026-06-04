import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect from /admin to /admin/login
    if (pathname === '/admin' || pathname === '/admin/') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Protect all admin routes except login
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const token = request.cookies.get('admin-token')?.value;

        if (!token) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Verify token
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
            await jwtVerify(token, secret);

            // Token is valid, allow access
            return NextResponse.next();
        } catch (error) {
            // Invalid token, redirect to login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};

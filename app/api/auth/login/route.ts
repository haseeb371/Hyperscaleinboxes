import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getAdminPasswordHash } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = getAdminPasswordHash();

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

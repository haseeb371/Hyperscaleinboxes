import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function verifyAdminRequest(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

  try {
    await jwtVerify(token, secret);
    return null;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

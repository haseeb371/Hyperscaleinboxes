import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    try {
      await jwtVerify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch single order by orderId
    const order = await Order.findOne(
      { orderId },
      { accountNames: 1 }
    ).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build CSV header
    const header = ['First Name', 'Last Name', 'Email'];

    // Parse accountNames JSON string into objects
    let accounts: Array<{ firstName?: string; lastName?: string; email?: string }> = [];
    const rawAccountNames = (order as any).accountNames as string | undefined;

    if (rawAccountNames) {
      try {
        const parsed = JSON.parse(rawAccountNames);
        if (Array.isArray(parsed)) {
          accounts = parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse accountNames JSON for order', orderId, parseError);
      }
    }

    // Basic CSV escaping: wrap fields in quotes and escape internal quotes
    const escape = (value: string) =>
      `"${(value ?? '').replace(/"/g, '""')}"`;

    const rows = accounts.map((acc) =>
      [
        escape(acc.firstName || ''),
        escape(acc.lastName || ''),
        escape(acc.email || ''),
      ].join(',')
    );

    const csvContent = [header.join(','), ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="users.csv"',
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}



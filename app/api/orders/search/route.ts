import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email')?.trim().toLowerCase();
    const orderId = searchParams.get('orderId')?.trim();

    if (!email && !orderId) {
      return NextResponse.json(
        { error: 'Please provide either email or orderId' },
        { status: 400 }
      );
    }

    await connectDB();

    let query: any = {};

    if (email) {
      query.customerEmail = email;
    }

    if (orderId) {
      // Allow searching by full or partial orderId (Stripe session id)
      query.orderId = { $regex: orderId, $options: 'i' };
    }

    const orders = await Order.find(query, {
      orderId: 1,
      customerEmail: 1,
      customerName: 1,
      packageType: 1,
      numberOfDomains: 1,
      totalAccounts: 1,
      status: 1,
      progressStatus: 1,
      progressPercentage: 1,
      createdAt: 1,
      _id: 1,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      orders,
    });
  } catch (error: any) {
    console.error('Public order search error:', error);
    return NextResponse.json(
      { error: 'Failed to search orders' },
      { status: 500 }
    );
  }
}



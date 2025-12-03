import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function PATCH(request: NextRequest) {
    try {
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

        // Get update data from request
        const { orderId, status, progressPercentage, progressStatus } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Build update object
        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (progressPercentage !== undefined) updateData.progressPercentage = progressPercentage;
        if (progressStatus !== undefined) updateData.progressStatus = progressStatus;

        // Update the order
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId },
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}

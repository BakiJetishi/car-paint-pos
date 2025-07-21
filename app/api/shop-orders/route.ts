import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `WEB-${Date.now()}-${(orderCount + 1)
      .toString()
      .padStart(4, '0')}`;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Create a system user for web orders if it doesn't exist
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@autopaint.com' },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@autopaint.com',
          name: 'Web Order System',
          password: 'system', // This won't be used for login
          role: 'EMPLOYEE',
          isActive: false, // Prevent login
        },
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.userId || null, // Link to user if logged in
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: 'COMPLETED',
        paymentMethod: data.paymentMethod,
        userId: systemUser.id,
        orderItems: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Update stock quantities
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQty: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Here you would typically:
    // 1. Send confirmation email to customer
    // 2. Notify staff about new web order
    // 3. Integrate with cargo/delivery service

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message:
        'Order submitted successfully. We will contact you shortly to confirm delivery details.',
    });
  } catch (error) {
    console.error('Shop order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

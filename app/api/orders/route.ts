import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'No order items provided' },
        { status: 400 }
      );
    }

    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1)
      .toString()
      .padStart(4, '0')}`;

    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const taxRate = typeof data.taxRate === 'number' ? data.taxRate : 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId ?? undefined,
        customerName: data.customerName ?? undefined,
        customerPhone: data.customerPhone ?? undefined,
        customerEmail: data.customerEmail ?? undefined,
        customerAddress: data.customerAddress ?? undefined,
        customerCity: data.customerCity ?? undefined,
        customerState: data.customerState ?? undefined,
        customerZip: data.customerZip ?? undefined,
        subtotal,
        taxRate,
        taxAmount,
        total,
        paymentMethod: data.paymentMethod ?? 'CARGO',
        notes: data.notes ?? undefined,
        userId: session.user.id, // guaranteed string here
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

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

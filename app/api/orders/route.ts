import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();

    // ✅ Basic validation
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'No order items provided' }, { status: 400 });
    }

    // ✅ Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1)
      .toString()
      .padStart(4, '0')}`;

    // ✅ Calculate totals safely
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const taxRate = typeof data.taxRate === 'number' ? data.taxRate : 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // ✅ Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId ?? null,
        customerName: data.customerName ?? null,
        customerPhone: data.customerPhone ?? null,
        customerEmail: data.customerEmail ?? null,
        customerAddress: data.customerAddress ?? null,
        customerCity: data.customerCity ?? null,
        customerState: data.customerState ?? null,
        customerZip: data.customerZip ?? null,
        subtotal,
        taxRate,
        taxAmount,
        total,
        paymentMethod: data.paymentMethod ?? 'CARGO',
        notes: data.notes ?? null,
        userId: session?.user?.id ?? null,
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

    // ✅ Update product stock
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
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const limit = searchParams.get('limit');

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {};

    if (since) {
      whereClause.createdAt = {
        gt: new Date(since),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

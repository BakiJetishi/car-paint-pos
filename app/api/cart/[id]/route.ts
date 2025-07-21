import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update cart item quantity
export async function PUT(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantity } = await request.json();
    const params = (context as { params: { id: string } }).params;
    const id = params.id;

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          id,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove specific item from cart
export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { params } = context;
    const id = params.id;

    await prisma.cartItem.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, context: any) {
  const id = context.params.id;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { quantity } = await request.json();

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ message: 'Item removed from cart' });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id, userId: session.user.id },
    data: { quantity },
    include: { product: true },
  });

  return NextResponse.json(updatedItem);
}

export async function DELETE(request: NextRequest, context: any) {
  const id = context.params.id;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.cartItem.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: 'Item removed from cart' });
}

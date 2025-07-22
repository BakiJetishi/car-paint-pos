// app/api/notifications/[id]/read/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    return new NextResponse('Failed to mark notification read', { status: 500 });
  }
}

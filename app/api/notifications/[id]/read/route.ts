// app/api/notifications/[id]/read/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

<<<<<<< HEAD
export async function PUT(
=======
export async function POST(
>>>>>>> 2cbd4ae (some changes)
  request: NextRequest,
  context: any // <-- loose typing to fix TS error
) {
  const id = context.params.id;

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
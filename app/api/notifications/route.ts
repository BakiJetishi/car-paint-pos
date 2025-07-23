// /api/notifications/route.ts (GET)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CUSTOMER') {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return new Response(JSON.stringify(notifications), { status: 200 });
}

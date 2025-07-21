import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: any // <-- loose typing to fix TS error
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const id = context.params.id; // access route param here

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to update message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any // <-- loose typing here as well
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = context.params.id;

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

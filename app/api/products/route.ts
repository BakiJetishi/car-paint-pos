import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const products = await prisma.product.findMany({
      where: { isActive: true, stockQty: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: limit, // if undefined, Prisma returns all products
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        color: data.color,
        brand: data.brand,
        size: data.size,
        price: parseFloat(data.price),
        stockQty: parseInt(data.stockQty),
        minStock: parseInt(data.minStock || 5),
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        usageInstructions: data.usageInstructions,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

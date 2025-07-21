import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get orders for the customer based on their email/name
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: session.user.id }, // Primary: orders linked to user ID
          { customerName: session.user.name },
          { customerEmail: session.user.email }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch customer orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
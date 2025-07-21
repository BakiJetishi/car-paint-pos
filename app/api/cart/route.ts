import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's cart items
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session?.user?.id },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Failed to fetch cart items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { productId, quantity } = await request.json()
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session?.user?.id,
          productId: productId
        }
      }
    })
    
    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      })
      return NextResponse.json(updatedItem)
    } else {
      // Create new cart item
      const newItem = await prisma.cartItem.create({
        data: {
          userId: session?.user?.id,
          productId: productId,
          quantity: quantity
        },
        include: { product: true }
      })
      return NextResponse.json(newItem)
    }
  } catch (error) {
    console.error('Failed to add item to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// DELETE - Clear entire cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await prisma.cartItem.deleteMany({
      where: { userId: session?.user?.id }
    })
    
    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Failed to clear cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
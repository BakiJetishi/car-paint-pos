import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { quantity } = await request.json()
    
    if (quantity <= 0) {
      // Delete item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { 
          id: params.id,
          userId: session.user.id // Ensure user can only update their own items
        }
      })
      return NextResponse.json({ message: 'Item removed from cart' })
    } else {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { 
          id: params.id,
          userId: session.user.id // Ensure user can only update their own items
        },
        data: { quantity },
        include: { product: true }
      })
      return NextResponse.json(updatedItem)
    }
  } catch (error) {
    console.error('Failed to update cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove specific item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await prisma.cartItem.delete({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user can only delete their own items
      }
    })
    
    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Failed to remove cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
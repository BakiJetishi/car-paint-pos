import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, context: any) {
  const id = context.params.id;
  return NextResponse.json({ message: `Received PUT for id: ${id}` });
}

export async function DELETE(request: NextRequest, context: any) {
  const id = context.params.id;
  return NextResponse.json({ message: `Received DELETE for id: ${id}` });
}

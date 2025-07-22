import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        status: 'UNREAD',
      },
    });

    // Create a notification for the new message
    await prisma.notification.create({
      data: {
        type: 'message',
        title: 'New Message',
        message: `Message from ${data.name}: ${data.subject}`,
      },
    });

    // Here you would typically send an email notification
    // Example with a simple email service (you'll need to configure your email provider):
    /*
    try {
      await sendEmail({
        to: 'info@autopaintpro.com', // Your business email
        subject: `New Contact Form Message: ${data.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      id: contactMessage.id,
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const limit = searchParams.get('limit');

    const whereClause: any = {};

    if (since) {
      whereClause.createdAt = {
        gt: new Date(since),
      };
    }

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

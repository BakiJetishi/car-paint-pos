'use client';

import { CheckCircle, Clock, Mail, MapPin, Phone } from 'lucide-react';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Label } from '@radix-ui/react-label';
import { Button } from './button';

export default function Contact() {
  const { data: session } = useSession();

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          // Use logged-in user info if available
          name: session?.user?.name || contactForm.name,
          email: session?.user?.email || contactForm.email,
          phone: session?.user?.phone || contactForm.phone,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        toast({
          title: 'Message Sent!',
          description: result.message,
        });

        // Clear form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section id='contact' className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Contact Us</h2>
          <p className='text-lg text-gray-600'>
            Get in touch for quotes, questions, or professional advice
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div>
            <h3 className='text-xl font-semibold mb-6'>Get in Touch</h3>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <MapPin className='h-5 w-5 text-blue-600 mr-3' />
                <span>123 Paint Street, Auto District, City, State 12345</span>
              </div>
              <div className='flex items-center'>
                <Phone className='h-5 w-5 text-blue-600 mr-3' />
                <span>(555) 123-4567</span>
              </div>
              <div className='flex items-center'>
                <Mail className='h-5 w-5 text-blue-600 mr-3' />
                <span>info@autopaintpro.com</span>
              </div>
              <div className='flex items-center'>
                <Clock className='h-5 w-5 text-blue-600 mr-3' />
                <span>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</span>
              </div>
            </div>

            <div className='mt-8'>
              <h4 className='font-semibold mb-4'>Why Order Online?</h4>
              <ul className='space-y-2'>
                <li className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-600 mr-2' />
                  <span className='text-sm'>
                    Fast cargo delivery to your location
                  </span>
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-600 mr-2' />
                  <span className='text-sm'>
                    Pay on delivery (COD available)
                  </span>
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-600 mr-2' />
                  <span className='text-sm'>
                    Professional consultation included
                  </span>
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-600 mr-2' />
                  <span className='text-sm'>
                    Bulk order discounts available
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Have questions about our products? Need a custom quote? We're
                  here to help!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name'>Name</Label>
                      <Input
                        id='name'
                        readOnly={!!session?.user?.name}
                        value={session?.user?.name || contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        placeholder={session?.user?.name || 'Your name'}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        readOnly={!!session?.user?.email}
                        value={session?.user?.email || contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        placeholder={session?.user?.email || 'your@email.com'}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input
                      id='phone'
                      readOnly={!!session?.user?.phone}
                      value={session?.user?.phone || contactForm.phone}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder={session?.user?.phone || 'Your phone number'}
                    />
                  </div>
                  <div>
                    <Label htmlFor='subject'>Subject</Label>
                    <Input
                      id='subject'
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      placeholder='What can we help you with?'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='message'>Message</Label>
                    <Textarea
                      id='message'
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      placeholder='Tell us about your project or questions...'
                      rows={4}
                      required
                    />
                  </div>
                  <Button type='submit' className='w-full'>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

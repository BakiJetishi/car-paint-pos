'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Package,
  MessageSquare,
  LogOut,
  Eye,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Paintbrush,
  ShoppingCart,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: string;
      name: string;
      color: string;
      brand: string;
    };
  }>;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
}

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (
      session?.user?.role == 'ADMIN' ||
      session?.user?.role == 'MANAGER' ||
      session?.user?.role == 'EMPLOYEE'
    ) {
      router.replace('/dashboard');
    }

    const role = session?.user?.role;

    if (status === 'unauthenticated') {
      router.replace('/customer-login');
    } else if (role === 'ADMIN' || role === 'MANAGER' || role === 'EMPLOYEE') {
      router.replace('/dashboard');
    } else if (role !== 'CUSTOMER') {
      router.replace('/customer-login'); // fallback for unknown roles
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetchOrders();
      fetchMessages();
    }
  }, [session]);

  // Auto-refresh data when user returns to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user?.role === 'CUSTOMER') {
        fetchOrders();
        fetchMessages();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/customer-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/customer-messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name,
          email: session?.user?.email,
          phone: session?.user?.phone || undefined,
          subject: messageForm.subject,
          message: messageForm.message,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Message Sent!',
          description: 'Your message has been sent successfully.',
        });

        setMessageForm({ subject: '', message: '' });
        fetchMessages();

        // Auto-refresh after a short delay to show the new message
        setTimeout(() => {
          fetchMessages();
        }, 1000);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'bg-red-100 text-red-800';
      case 'READ':
        return 'bg-yellow-100 text-yellow-800';
      case 'REPLIED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING'
  ).length;
  const unreadMessages = messages.filter(
    (msg) => msg.status === 'UNREAD'
  ).length;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                <Paintbrush className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  AutoPaint Pro
                </h1>
                <p className='text-sm text-gray-600'>
                  Welcome, {session?.user?.name}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <Link href='/'>
                <Button variant='outline'>
                  <ShoppingCart className='h-4 w-4 mr-2' />
                  Continue Shopping
                </Button>
              </Link>
              <Button
                variant='ghost'
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className='h-4 w-4 mr-2' />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Package className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Orders
                  </p>
                  <p className='text-2xl font-bold'>{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <DollarSign className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Spent
                  </p>
                  <p className='text-2xl font-bold'>${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Calendar className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Pending Orders
                  </p>
                  <p className='text-2xl font-bold'>{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <MessageSquare className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Unread Messages
                  </p>
                  <p className='text-2xl font-bold'>{unreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue='orders' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='orders'>My Orders</TabsTrigger>
            <TabsTrigger value='messages'>Messages</TabsTrigger>
            <TabsTrigger value='profile'>Profile</TabsTrigger>
          </TabsList>

          <TabsContent value='orders'>
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track all your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <Package className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p>No orders found</p>
                    <p className='text-sm'>
                      Start shopping to see your orders here
                    </p>
                    <Link href='/shop'>
                      <Button className='mt-4'>
                        <ShoppingCart className='h-4 w-4 mr-2' />
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className='font-medium'>
                              {order.orderNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {order.orderItems.length} items
                            </TableCell>
                            <TableCell className='font-medium'>
                              ${order.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className='h-4 w-4' />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className='max-w-2xl'>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Order Details - {order.orderNumber}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Order placed on{' '}
                                      {new Date(
                                        order.createdAt
                                      ).toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedOrder && (
                                    <div className='space-y-4'>
                                      <div>
                                        <h4 className='font-medium mb-2'>
                                          Items
                                        </h4>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Product</TableHead>
                                              <TableHead>Qty</TableHead>
                                              <TableHead>Price</TableHead>
                                              <TableHead>Total</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedOrder.orderItems.map(
                                              (item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>
                                                    <div>
                                                      <div className='font-medium'>
                                                        {item.product.name}
                                                      </div>
                                                      <div className='text-sm text-gray-500'>
                                                        {item.product.color} -{' '}
                                                        {item.product.brand}
                                                      </div>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.quantity}
                                                  </TableCell>
                                                  <TableCell>
                                                    ${item.price.toFixed(2)}
                                                  </TableCell>
                                                  <TableCell>
                                                    ${item.total.toFixed(2)}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>

                                      <div className='border-t pt-4'>
                                        <div className='flex justify-between'>
                                          <span>Subtotal:</span>
                                          <span>
                                            ${selectedOrder.subtotal.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span>Tax:</span>
                                          <span>
                                            $
                                            {selectedOrder.taxAmount.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className='flex justify-between font-bold text-lg'>
                                          <span>Total:</span>
                                          <span>
                                            ${selectedOrder.total.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='messages'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Send New Message</CardTitle>
                  <CardDescription>
                    Contact us with questions or concerns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className='space-y-4'>
                    <div>
                      <Label htmlFor='subject'>Subject</Label>
                      <Input
                        id='subject'
                        value={messageForm.subject}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
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
                        value={messageForm.message}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            message: e.target.value,
                          })
                        }
                        placeholder='Tell us about your question or concern...'
                        rows={4}
                        required
                      />
                    </div>
                    <Button type='submit' className='w-full'>
                      <Send className='h-4 w-4 mr-2' />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Message History</CardTitle>
                  <CardDescription>
                    Your previous messages and responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <MessageSquare className='h-12 w-12 mx-auto mb-2 opacity-50' />
                      <p>No messages found</p>
                      <p className='text-sm'>
                        Send your first message using the form
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4 max-h-96 overflow-y-auto'>
                      {messages.map((message) => (
                        <div key={message.id} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-medium'>{message.subject}</h4>
                            <Badge
                              className={getMessageStatusColor(message.status)}
                            >
                              {message.status}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>
                            {message.message}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='profile'>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label>Name</Label>
                      <div className='flex items-center mt-1'>
                        <User className='h-4 w-4 mr-2 text-gray-400' />
                        <span>{session?.user?.name}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className='flex items-center mt-1'>
                        <Mail className='h-4 w-4 mr-2 text-gray-400' />
                        <span>{session?.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  {session?.user?.phone && (
                    <div>
                      <Label>Phone</Label>
                      <div className='flex items-center mt-1'>
                        <Phone className='h-4 w-4 mr-2 text-gray-400' />
                        <span>{session.user.phone}</span>
                      </div>
                    </div>
                  )}

                  <div className='pt-4 border-t'>
                    <h4 className='font-medium mb-2'>Account Statistics</h4>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-600'>Member since:</span>
                        <div className='font-medium'>
                          {new Date(
                            session?.user?.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className='text-gray-600'>Total orders:</span>
                        <div className='font-medium'>{orders.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Package,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    color: string;
    brand: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user?: {
    name: string;
    role: string;
  };
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, paymentFilter, sourceFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        credentials: 'include', // this ensures cookies (session) are sent
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
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

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerPhone?.includes(searchTerm) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.paymentMethod === paymentFilter
      );
    }

    // New source filter logic:
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((order) => {
        if (sourceFilter === 'web')
          return order.user?.role === 'CUSTOMER' || !order.user;
        if (sourceFilter === 'employee') return order.user?.role === 'EMPLOYEE';
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'CARGO':
        return 'bg-blue-100 text-blue-800';
      case 'CARD':
        return 'bg-purple-100 text-purple-800';
      case 'CHECK':
        return 'bg-yellow-100 text-yellow-800';
      case 'TRANSFER':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2'>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link href='/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to POS
              </Button>
            </Link>
            <div>
              <h1 className='text-xl font-bold'>Orders History</h1>
              <p className='text-sm text-gray-600'>
                View and manage all orders
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className='p-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
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
                    Total Revenue
                  </p>
                  <p className='text-2xl font-bold'>
                    $
                    {orders
                      .reduce((sum, order) => sum + order.total, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Calendar className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Today's Orders
                  </p>
                  <p className='text-2xl font-bold'>
                    {
                      orders.filter(
                        (order) =>
                          new Date(order.createdAt).toDateString() ===
                          new Date().toDateString()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <User className='h-8 w-8 text-orange-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Avg Order Value
                  </p>
                  <p className='text-2xl font-bold'>
                    $
                    {orders.length > 0
                      ? (
                          orders.reduce((sum, order) => sum + order.total, 0) /
                          orders.length
                        ).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Filter className='h-5 w-5 mr-2' />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='search'>Search Orders</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='search'
                    placeholder='Order number, customer, employee...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='payment'>Payment Method</Label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Payment Methods' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Payment Methods</SelectItem>
                    <SelectItem value='CASH'>Cash</SelectItem>
                    <SelectItem value='CARD'>Card</SelectItem>
                    <SelectItem value='CHECK'>Check</SelectItem>
                    <SelectItem value='TRANSFER'>Transfer</SelectItem>
                    <SelectItem value='CARGO'>Cargo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='date'>Date Filter</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Dates' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Dates</SelectItem>
                    <SelectItem value='today'>Today</SelectItem>
                    <SelectItem value='this_week'>This Week</SelectItem>
                    <SelectItem value='this_month'>This Month</SelectItem>
                    <SelectItem value='this_year'>This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='source'>Order Source</Label>
                <Select
                  value={sourceFilter}
                  onValueChange={(value) =>
                    setSourceFilter(value as 'all' | 'web' | 'employee')
                  }
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter by source' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='web'>Web Ordering</SelectItem>
                    <SelectItem value='employee'>Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders?.length})</CardTitle>
            <CardDescription>
              {filteredOrders?.length === orders?.length
                ? 'Showing all orders'
                : `Showing ${filteredOrders?.length} of ${orders?.length} orders`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-medium'>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {order.customerName ? (
                          <div>
                            <div className='font-medium'>
                              {order.customerName}
                            </div>
                            {order.customerPhone && (
                              <div className='text-sm text-gray-500'>
                                {order.customerPhone}
                              </div>
                            )}
                            {selectedOrder?.customerAddress && (
                              <div className='text-sm text-gray-500 mt-1'>
                                <div>{selectedOrder?.customerAddress}</div>
                                <div>
                                  {selectedOrder?.customerCity},{' '}
                                  {selectedOrder?.customerState}{' '}
                                  {selectedOrder?.customerZip}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className='text-gray-500'>Walk-in</span>
                        )}
                      </TableCell>

                      {/* Employee / Guest / Web order with badges */}
                      <TableCell>
                        {!order.user ? (
                          <Badge
                            variant='outline'
                            className='bg-blue-100 text-blue-800'
                          >
                            Web Order (Guest)
                          </Badge>
                        ) : order.user.role === 'CUSTOMER' ? (
                          <Badge
                            variant='outline'
                            className='bg-blue-100 text-blue-800'
                          >
                            Web Order
                          </Badge>
                        ) : order.user.role === 'EMPLOYEE' ? (
                          <div>
                            <div>{order.user.name}</div>
                            <Badge
                              variant='outline'
                              className='bg-green-100 text-green-800 mt-1'
                            >
                              Employee
                            </Badge>
                          </div>
                        ) : (
                          <div>{order.user.name ?? 'N/A'}</div>
                        )}
                      </TableCell>

                      <TableCell>{order?.orderItems?.length} items</TableCell>
                      <TableCell className='font-medium'>
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPaymentMethodColor(
                            order?.paymentMethod
                          )}
                        >
                          {order?.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order?.createdAt).toLocaleDateString()}
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
                                {new Date(order.createdAt).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                              <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                  <div>
                                    <h4 className='font-medium mb-2'>
                                      Customer Information
                                    </h4>
                                    <p>
                                      Name:{' '}
                                      {selectedOrder?.customerName ||
                                        'Walk-in customer'}
                                    </p>
                                    {selectedOrder?.customerPhone && (
                                      <p>
                                        Phone: {selectedOrder?.customerPhone}
                                      </p>
                                    )}
                                    {selectedOrder?.customerEmail && (
                                      <p>
                                        Email: {selectedOrder?.customerEmail}
                                      </p>
                                    )}
                                    {selectedOrder?.notes && (
                                      <p>Notes: {selectedOrder.notes}</p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className='font-medium mb-2'>
                                      Order Information
                                    </h4>
                                    <p>Employee: {selectedOrder?.user?.name}</p>
                                    <p>
                                      Payment Method:{' '}
                                      {selectedOrder?.paymentMethod}
                                    </p>
                                    <p>
                                      Address:{' '}
                                      {selectedOrder?.customerAddress || 'N/A'}
                                    </p>
                                    <p>
                                      City:{' '}
                                      {selectedOrder?.customerCity || 'N/A'}
                                    </p>
                                    <p>
                                      State:{' '}
                                      {selectedOrder?.customerState || 'N/A'}
                                    </p>
                                    <p>
                                      Zip Code:{' '}
                                      {selectedOrder?.customerZip || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className='font-medium mb-2'>Items</h4>
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
                                      {selectedOrder?.orderItems.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <div className='flex items-center space-x-3'>
                                              {/* Product Image */}
                                              {item?.product?.imageUrl ? (
                                                <img
                                                  src={item.product.imageUrl}
                                                  alt={item.product.name}
                                                  className='h-10 w-10 object-cover rounded'
                                                />
                                              ) : (
                                                <div className='h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs'>
                                                  No Image
                                                </div>
                                              )}

                                              <div>
                                                {/* Product Name */}
                                                <div className='font-medium'>
                                                  {item?.product?.name}
                                                </div>

                                                {/* Product ID */}
                                                <div className='text-xs text-gray-500'>
                                                  ID: {item?.product?.id}
                                                </div>

                                                {/* Product Color and Brand */}
                                                <div className='text-sm text-gray-500'>
                                                  {item?.product?.color} -{' '}
                                                  {item?.product?.brand}
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {item?.quantity}
                                          </TableCell>
                                          <TableCell>
                                            ${item?.price.toFixed(2)}
                                          </TableCell>
                                          <TableCell>
                                            ${item?.total.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                <div className='border-t pt-4'>
                                  <div className='flex justify-between'>
                                    <span>Subtotal:</span>
                                    <span>
                                      ${selectedOrder?.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span>Tax:</span>
                                    <span>
                                      ${selectedOrder?.taxAmount.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between font-bold text-lg'>
                                    <span>Total:</span>
                                    <span>
                                      ${selectedOrder?.total.toFixed(2)}
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

              {filteredOrders.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <Package className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No orders found</p>
                  <p className='text-sm'>Try adjusting your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

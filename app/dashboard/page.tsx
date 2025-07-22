'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  Settings,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Search,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { printReceipt } from '@/lib/utils/receipt-generator';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  color: string;
  brand: string;
  size: string;
  price: number;
  stockQty: number;
  category: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerDescription, setCustomerDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory && product.stockQty > 0;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stockQty) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${product.stockQty} units available`,
          variant: 'destructive',
        });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && newQuantity <= product.stockQty) {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return { subtotal, taxRate, taxAmount, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add items to cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    const { subtotal, taxRate, taxAmount, total } = calculateTotals();

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: customerDescription || undefined, // NEW
        taxRate,
        paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // Generate and print receipt
        const receiptData = {
          orderNumber: order.orderNumber,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          items: cart.map((item) => ({
            name: item.name,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
          subtotal,
          taxRate,
          taxAmount,
          total,
          paymentMethod,
          employeeName: session?.user?.name || 'Unknown',
          date: new Date(),
        };

        printReceipt(receiptData);

        // Clear cart and customer info
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerDescription('');


        // Refresh products to update stock
        fetchProducts();

        toast({
          title: 'Order Completed',
          description: `Order ${order.orderNumber} created successfully`,
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process order',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2'>Loading...</p>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <Package className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>AutoPaint Pro POS</h1>
              <p className='text-sm text-gray-600'>
                Welcome, {session?.user?.name}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <Link href='/orders'>
              <Button variant='outline' size='sm'>
                <Users className='h-4 w-4 mr-2' />
                Orders History
              </Button>
            </Link>
            <Link href='/messages'>
              <Button variant='outline' size='sm'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Messages
              </Button>
            </Link>
            {(session?.user?.role === 'ADMIN' ||
              session?.user?.role === 'MANAGER') && (
              <Link href='/products'>
                <Button variant='outline' size='sm'>
                  <Settings className='h-4 w-4 mr-2' />
                  Manage Products
                </Button>
              </Link>
            )}
            <Button
              size='sm'
              onClick={
                () => signOut({ callbackUrl: '/login' }) // redirect to login after logout
              }
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className='flex h-[calc(100vh-80px)]'>
        {/* Products Section */}
        <div className='flex-1 p-6'>
          <div className='mb-6'>
            <div className='flex space-x-4 mb-4'>
              <div className='flex-1'>
                <Label htmlFor='search'>Search Products</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='search'
                    placeholder='Search by name, color, or brand...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='category'>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='All Categories' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className='cursor-pointer hover:shadow-md transition-shadow'
              >
                <CardContent className='p-4 flex space-x-4 items-center'>
                  {/* Product Image on the left */}
                  <div className='w-24 h-24 flex-shrink-0 overflow-hidden'>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={200}
                        height={200}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      // Optionally render a placeholder or nothing
                      <div className='bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-xs'>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='flex-1'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-medium text-sm'>{product.name}</h3>
                      <Badge
                        variant={
                          product.stockQty <= 5 ? 'destructive' : 'secondary'
                        }
                      >
                        {product.stockQty} left
                      </Badge>
                    </div>

                    <div className='space-y-1 text-xs text-gray-600 mb-3'>
                      <div>Color: {product.color}</div>
                      <div>Brand: {product.brand}</div>
                      <div>Size: {product.size}</div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-lg font-bold text-blue-600'>
                        ${product.price.toFixed(2)}
                      </span>
                      <Button
                        size='sm'
                        onClick={() => addToCart(product)}
                        disabled={product.stockQty === 0}
                      >
                        <Plus className='h-4 w-4 mr-1' />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className='w-96 bg-white border-l shadow-lg flex flex-col'>
          <div className='p-6 border-b'>
            <div className='flex items-center space-x-2 mb-4'>
              <ShoppingCart className='h-5 w-5' />
              <h2 className='text-lg font-semibold'>Shopping Cart</h2>
              <Badge variant='secondary'>{cart.length}</Badge>
            </div>

            {/* Customer Info */}
            <div className='space-y-3'>
              <div>
                <Label htmlFor='customerName'>Customer Name (Optional)</Label>
                <Input
                  id='customerName'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder='Enter customer name'
                />
              </div>

              <div>
                <Label htmlFor='customerPhone'>Phone (Optional)</Label>
                <Input
                  id='customerPhone'
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder='Enter phone number'
                />
              </div>

              {/* New description field */}
              <div>
                <Label htmlFor='customerDescription'>Description (Optional)</Label>
                <Input
                  id='customerDescription'
                  value={customerDescription}
                  onChange={(e) => setCustomerDescription(e.target.value)}
                  placeholder='Additional notes or instructions'
                />
              </div>
            </div>
          </div>


          {/* Cart Items */}
          <div className='flex-1 overflow-y-auto'>
            {cart.length === 0 ? (
              <div className='p-6 text-center text-gray-500'>
                <ShoppingCart className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>Cart is empty</p>
                <p className='text-sm'>Add products to get started</p>
              </div>
            ) : (
              <div className='p-4 space-y-3'>
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className='p-3'>
                      <div className='flex justify-between items-start mb-2'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-sm'>{item.name}</h4>
                          <p className='text-xs text-gray-600'>
                            {item.color} - {item.brand}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeFromCart(item.id)}
                          className='h-6 w-6 p-0'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className='h-6 w-6 p-0'
                          >
                            <Minus className='h-3 w-3' />
                          </Button>
                          <span className='text-sm font-medium w-8 text-center'>
                            {item.quantity}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className='h-6 w-6 p-0'
                          >
                            <Plus className='h-3 w-3' />
                          </Button>
                        </div>
                        <span className='font-medium'>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {cart.length > 0 && (
            <div className='border-t p-6'>
              <div className='space-y-2 mb-4'>
                <div className='flex justify-between text-sm'>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Tax (8%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className='flex justify-between font-bold'>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className='mb-4'>
                <Label htmlFor='payment'>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CASH'>Cash</SelectItem>
                    <SelectItem value='CARD'>Card</SelectItem>
                    <SelectItem value='CHECK'>Check</SelectItem>
                    <SelectItem value='TRANSFER'>Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className='w-full' size='lg' onClick={handleCheckout}>
                <CreditCard className='h-4 w-4 mr-2' />
                Complete Sale
              </Button>

              <Button
                variant='outline'
                className='w-full mt-2'
                size='sm'
                onClick={() => setCart([])}
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
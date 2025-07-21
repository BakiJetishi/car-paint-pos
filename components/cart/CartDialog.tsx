'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCartStore } from '@/lib/store/cart-store';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface OrderForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  notes: string;
  paymentMethod: string;
}

export function CartDialog() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTaxAmount,
    getTotalPrice,
  } = useCartStore();

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerZip: '',
    notes: '',
    paymentMethod: 'CARGO',
  });

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before ordering',
        variant: 'destructive',
      });
      return;
    }

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: session?.user?.name || orderForm.customerName,
        customerEmail: session?.user?.email || orderForm.customerEmail,
        customerPhone: session?.user?.phone || orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        customerCity: orderForm.customerCity,
        customerState: orderForm.customerState,
        customerZip: orderForm.customerZip,
        notes: orderForm.notes,
        paymentMethod: orderForm.paymentMethod,
        userId: session?.user?.id,
      };

      // const endpoint =
      //   session?.user?.role === 'CUSTOMER' ? '/api/shop-orders' : '/api/orders';

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();

        toast({
          title: 'Order Submitted!',
          description: `Order ${result.orderNumber} submitted successfully.`,
        });

        clearCart();
        setOrderForm({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: '',
          customerCity: '',
          customerState: '',
          customerZip: '',
          notes: '',
          paymentMethod: 'CARGO',
        });
        setIsOrderDialogOpen(false);
        closeCart();

        // Refresh page to update stock
        window.location.reload();
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const total = getTotalPrice();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeCart}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center'>
              <ShoppingCart className='h-5 w-5 mr-2' />
              Shopping Cart ({getTotalItems()} items)
            </DialogTitle>
            <DialogDescription>
              Review your items and proceed to checkout
            </DialogDescription>
          </DialogHeader>

          <div className='max-h-96 overflow-y-auto'>
            {items.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <ShoppingCart className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <h4 className='font-medium'>{item.name}</h4>
                      <p className='text-sm text-gray-600'>
                        {item.color} • {item.brand} • {item.size}
                      </p>
                      <p className='text-sm font-medium text-blue-600'>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className='h-3 w-3' />
                      </Button>
                      <span className='w-8 text-center'>{item.quantity}</span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeItem(item.id)}
                        className='text-red-600'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <div className='ml-4 font-medium'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className='border-t pt-4'>
              <div className='flex justify-between items-center mb-4'>
                <span className='text-lg font-semibold'>Total:</span>
                <span className='text-2xl font-bold text-blue-600'>
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  onClick={clearCart}
                  className='flex-1'
                >
                  Clear Cart
                </Button>
                <Button
                  onClick={() => setIsOrderDialogOpen(true)}
                  className='flex-1'
                >
                  <Truck className='h-4 w-4 mr-2' />
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Fill in your details to complete the purchase
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOrderSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='customerName'>Full Name *</Label>
                <Input
                  id='customerName'
                  readOnly={!!session?.user?.name}
                  value={session?.user?.name || orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerName: e.target.value })
                  }
                  placeholder={session?.user?.name || 'Enter your full name'}
                  required
                />
              </div>
              <div>
                <Label htmlFor='customerPhone'>Phone Number *</Label>
                <Input
                  id='customerPhone'
                  readOnly={!!session?.user?.phone}
                  value={session?.user?.phone || orderForm.customerPhone}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      customerPhone: e.target.value,
                    })
                  }
                  placeholder={
                    session?.user?.phone || 'Enter your phone number'
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor='customerEmail'>Email Address *</Label>
              <Input
                id='customerEmail'
                type='email'
                readOnly={!!session?.user?.email}
                value={session?.user?.email || orderForm.customerEmail}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, customerEmail: e.target.value })
                }
                placeholder={session?.user?.email || 'Enter your email address'}
                required
              />
            </div>

            <div>
              <Label htmlFor='customerAddress'>Delivery Address *</Label>
              <Input
                id='customerAddress'
                value={orderForm.customerAddress}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    customerAddress: e.target.value,
                  })
                }
                placeholder='Street address'
                required
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='customerCity'>City *</Label>
                <Input
                  id='customerCity'
                  value={orderForm.customerCity}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerCity: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='customerState'>State *</Label>
                <Input
                  id='customerState'
                  value={orderForm.customerState}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      customerState: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='customerZip'>ZIP Code *</Label>
                <Input
                  id='customerZip'
                  value={orderForm.customerZip}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerZip: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor='paymentMethod'>Payment Method</Label>
              <Select
                value={orderForm.paymentMethod}
                onValueChange={(value) =>
                  setOrderForm({ ...orderForm, paymentMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='CASH'>Cash</SelectItem>
                  <SelectItem value='CARGO'>Cargo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='notes'>Special Instructions (Optional)</Label>
              <Textarea
                id='notes'
                value={orderForm.notes}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, notes: e.target.value })
                }
                placeholder='Any special instructions...'
                rows={3}
              />
            </div>

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium mb-2'>Order Summary</h4>
              <div className='space-y-1 text-sm'>
                {items.map((item) => (
                  <div key={item.id} className='flex justify-between'>
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className='border-t pt-2 space-y-1'>
                  <div className='flex justify-between'>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tax (8%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className='border-t pt-1 font-medium flex justify-between'>
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsOrderDialogOpen(false)}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button type='submit' className='flex-1'>
                <CreditCard className='h-4 w-4 mr-2' />
                Place Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

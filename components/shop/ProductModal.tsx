'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Package, Info, Wrench, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  color: string;
  brand: string;
  size: string;
  price: number;
  stockQty: number;
  category: string;
  description?: string;
  imageUrl?: string;
  usageInstructions?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return `Low Stock (${stock} left)`;
    return `${stock} in stock`;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stockQty) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Product Image */}
          <div className='space-y-4'>
            <div className='relative aspect-square overflow-hidden rounded-lg bg-gray-100'>
              {!imageError && product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className='object-cover'
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                  <Package className='h-24 w-24 text-gray-400' />
                </div>
              )}
            </div>

            {/* Additional product images could go here */}
            <div className='grid grid-cols-4 gap-2'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='aspect-square bg-gray-100 rounded-md flex items-center justify-center'
                >
                  <Package className='h-6 w-6 text-gray-400' />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className='space-y-6'>
            {/* Brand and Category */}
            <div className='flex items-center space-x-2'>
              <Badge variant='outline'>{product.brand}</Badge>
              <Badge variant='secondary'>{product.category}</Badge>
            </div>

            {/* Product specs */}
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Color:</span>
                <span className='font-medium'>{product.color}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Size:</span>
                <span className='font-medium'>{product.size}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Stock:</span>
                <Badge className={getStockBadgeColor(product.stockQty)}>
                  {getStockText(product.stockQty)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className='space-y-2'>
              <div className='flex items-baseline space-x-2'>
                <span className='text-3xl font-bold text-blue-600'>
                  ${product.price.toFixed(2)}
                </span>
                <span className='text-gray-500'>per {product.size}</span>
              </div>
              <div className='flex items-center space-x-1 text-yellow-500'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className='h-4 w-4 fill-current' />
                ))}
                <span className='text-sm text-gray-600 ml-2'>
                  (4.8/5 - 124 reviews)
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className='space-y-3'>
              <label className='text-sm font-medium'>Quantity:</label>
              <div className='flex items-center space-x-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className='h-4 w-4' />
                </Button>
                <span className='w-12 text-center font-medium'>{quantity}</span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stockQty}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              <p className='text-sm text-gray-600'>
                Total:{' '}
                <span className='font-semibold'>
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </p>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stockQty === 0}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3'
              size='lg'
            >
              <Plus className='h-5 w-5 mr-2' />
              Add {quantity} to Cart
            </Button>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Info className='h-5 w-5 text-blue-600' />
                  <h3 className='font-semibold'>Description</h3>
                </div>
                <p className='text-gray-700 leading-relaxed'>
                  {product.description}
                </p>
              </div>
            )}

            {/* Usage Instructions */}
            {product.usageInstructions && (
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Wrench className='h-5 w-5 text-green-600' />
                  <h3 className='font-semibold'>Usage Instructions</h3>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <p className='text-green-800 text-sm leading-relaxed'>
                    {product.usageInstructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

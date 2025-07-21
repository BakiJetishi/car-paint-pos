'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Package } from 'lucide-react';
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
  description?: string;
  imageUrl?: string;
  usageInstructions?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (stock <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return `Low Stock (${stock})`;
    return `${stock} in stock`;
  };

  return (
    <Card className='group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden'>
      <div className='relative aspect-square overflow-hidden bg-gray-100'>
        {!imageError && product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            onError={() => setImageError(true)}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
            <Package className='h-16 w-16 text-gray-400' />
          </div>
        )}

        {/* Quick view overlay */}
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => onViewDetails(product)}
            className='bg-white/90 hover:bg-white text-gray-900'
          >
            <Eye className='h-4 w-4 mr-2' />
            Quick View
          </Button>
        </div>

        {/* Stock badge */}
        <div className='absolute top-3 right-3'>
          <Badge className={getStockBadgeColor(product.stockQty)}>
            {getStockText(product.stockQty)}
          </Badge>
        </div>

        {/* Category badge */}
        <div className='absolute top-3 left-3'>
          <Badge variant='secondary' className='bg-white/90 text-gray-700'>
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className='p-4'>
        <div className='space-y-3'>
          {/* Product name and brand */}
          <div>
            <h3 className='font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
              {product.name}
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              {product.brand} • {product.color} • {product.size}
            </p>
          </div>

          {/* Description preview */}
          {product.description && (
            <p className='text-sm text-gray-600 line-clamp-2'>
              {product.description}
            </p>
          )}

          {/* Price and actions */}
          <div className='flex items-center justify-between pt-2'>
            <div className='flex flex-col'>
              <span className='text-2xl font-bold text-blue-600'>
                ${product.price.toFixed(2)}
              </span>
              <span className='text-xs text-gray-500'>per {product.size}</span>
            </div>

            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onViewDetails(product)}
                className='hover:bg-gray-50'
              >
                <Eye className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                onClick={() => onAddToCart(product)}
                disabled={product.stockQty === 0}
                className='bg-blue-600 hover:bg-blue-700'
              >
                <Plus className='h-4 w-4 mr-1' />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

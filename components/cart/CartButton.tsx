'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';

export function CartButton(props: any) {
  const { getTotalItems, openCart } = useCartStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const totalItems = hasMounted ? getTotalItems() : 0;

  return (
    <Button onClick={openCart} className='relative' variant='outline'>
      <ShoppingCart className='h-4 w-4 mr-2' />
      {props.showtext ? 'Cart' : ''}
      {totalItems > 0 && (
        <Badge className='absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center text-xs'>
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}

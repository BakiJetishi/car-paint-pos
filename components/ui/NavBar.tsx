'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CartButton } from '@/components/cart/CartButton';
import {
  Paintbrush,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className='fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg'>
              <Paintbrush className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>AutoPaint Pro</h1>
              <p className='text-xs text-gray-600'>Professional Solutions</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center space-x-8'>
            <Link
              href='/'
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              Home
            </Link>
            <Link
              href='/shop'
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              Shop
            </Link>
            <Link
              href='/#services'
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              Services
            </Link>
            <Link
              href='/#contact'
              className='text-gray-700 hover:text-blue-600 font-medium'
            >
              Contact
            </Link>
          </div>

          <div className='hidden md:flex items-center space-x-4'>
            {!isLoggedIn && (
              <Link href='/customer-login'>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-blue-600 text-blue-600 hover:bg-blue-50'
                >
                  <Users className='h-4 w-4 mr-2' />
                  Login
                </Button>
              </Link>
            )}

            {isLoggedIn && (
              <Link href='/customer-dashboard'>
                <Button variant='outline' size='sm'>
                  <LayoutDashboard className='h-4 w-4 mr-2' />
                  Dashboard
                </Button>
              </Link>
            )}

            <CartButton />
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-100'>
          <div className='px-4 py-2 space-y-2'>
            <Link
              href='/'
              className='block py-2 text-gray-700 hover:text-blue-600'
            >
              Home
            </Link>
            <Link
              href='/shop'
              className='block py-2 text-gray-700 hover:text-blue-600'
            >
              Shop
            </Link>
            <Link
              href='#services'
              className='block py-2 text-gray-700 hover:text-blue-600'
            >
              Services
            </Link>
            <Link
              href='#contact'
              className='block py-2 text-gray-700 hover:text-blue-600'
            >
              Contact
            </Link>
<div className='flex flex-col space-y-2 pt-2 md:hidden'>
  {!isLoggedIn && (
    <div className='flex space-x-2'>
      <Link href='/customer-login' className='flex-1'>
        <Button variant='outline' size='sm' className='w-full'>
          <Users className='h-4 w-4 mr-2' />
          Login
        </Button>
      </Link>
      <CartButton />
    </div>
  )}

  {isLoggedIn && (
    <div className='flex space-x-2'>
      <Link href='/customer-dashboard' className=''>
        <Button variant='outline' size='sm' className='w-full'>
          <LayoutDashboard className='h-4 w-4 mr-2' />
          Dashboard
        </Button>
      </Link>
      <CartButton />
    </div>
  )}
</div>
          </div>
        </div>
      )}
    </nav>
  );
}

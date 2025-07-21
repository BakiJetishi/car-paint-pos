import { Mail, MapPin, Paintbrush, Phone } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                <Paintbrush className='h-7 w-7 text-white' />
              </div>
              <div>
                <h3 className='text-2xl font-bold'>AutoPaint Pro</h3>
                <p className='text-gray-400'>Professional Solutions</p>
              </div>
            </div>
            <p className='text-gray-400 leading-relaxed max-w-md'>
              Your trusted partner for professional automotive paint solutions.
              Quality products, expert advice, and reliable service since 2010.
            </p>
          </div>

          <div>
            <h4 className='text-lg font-semibold mb-6'>Quick Links</h4>
            <ul className='space-y-3 text-gray-400'>
              <li>
                <a href='#home' className='hover:text-white transition-colors'>
                  Home
                </a>
              </li>
              <li>
                <a href='#shop' className='hover:text-white transition-colors'>
                  Shop
                </a>
              </li>
              <li>
                <a
                  href='#services'
                  className='hover:text-white transition-colors'
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href='#contact'
                  className='hover:text-white transition-colors'
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href='/customer-login'
                  className='hover:text-white transition-colors'
                >
                  Customer Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-lg font-semibold mb-6'>Contact Info</h4>
            <ul className='space-y-3 text-gray-400'>
              <li className='flex items-center'>
                <Phone className='h-4 w-4 mr-2' />
                (555) 123-4567
              </li>
              <li className='flex items-center'>
                <Mail className='h-4 w-4 mr-2' />
                info@autopaintpro.com
              </li>
              <li className='flex items-start'>
                <MapPin className='h-4 w-4 mr-2 mt-1 flex-shrink-0' />
                123 Paint Street, Auto District
                <br />
                City, State 12345
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-400 text-sm'>
            &copy; 2024 AutoPaint Pro. All rights reserved.
          </p>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <a
              href='#'
              className='text-gray-400 hover:text-white transition-colors text-sm'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='text-gray-400 hover:text-white transition-colors text-sm'
            >
              Terms of Service
            </a>
            <a
              href='#'
              className='text-gray-400 hover:text-white transition-colors text-sm'
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Package, MessageSquare, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: 'order' | 'message' | 'low_stock';
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const handleMarkAndRemove = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return <Package className='w-4 h-4 text-blue-600' />;
      case 'message':
        return <MessageSquare className='w-4 h-4 text-green-600' />;
      case 'low_stock':
        return <AlertTriangle className='w-4 h-4 text-yellow-600' />;
      default:
        return <Bell className='w-4 h-4 text-gray-600' />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label='Notifications'
          className='relative p-1 rounded-full hover:bg-gray-100 focus:outline-none'
        >
          <Bell className='w-6 h-6 text-gray-700' />
          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-5 flex items-center justify-center rounded-full'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className='w-96 p-0 shadow-lg rounded-md border border-gray-200'
        align='end'
      >
        <div className='font-semibold text-lg px-4 py-3 border-b border-gray-200'>
          Notifications
        </div>

        {unreadNotifications.length === 0 ? (
          <div className='p-6 text-center text-gray-500'>
            <Bell className='mx-auto mb-2 w-10 h-10 opacity-40' />
            No unread notifications
          </div>
        ) : (
          <ul className='max-h-72 overflow-y-auto divide-y divide-gray-200'>
            {unreadNotifications.map((n) => (
              <li
                key={n.id}
                className='cursor-pointer px-4 py-3 hover:bg-gray-50 flex justify-between items-start gap-4 bg-blue-50 border-l-4 border-blue-500'
                onClick={() => handleMarkAndRemove(n.id)}
                title='Click to mark as read'
              >
                <div className='flex items-start gap-3 flex-1 min-w-0'>
                  <div className='pt-1'>{getNotificationIcon(n.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-gray-900 truncate'>
                      {n.title}
                    </p>
                    <p className='text-gray-600 text-sm truncate'>
                      {n.message}
                    </p>
                    <time
                      className='text-gray-400 text-xs mt-1'
                      dateTime={n.createdAt}
                    >
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAndRemove(n.id);
                  }}
                  className='text-gray-400 hover:text-gray-600 rounded p-1'
                  aria-label='Remove notification'
                >
                  <X className='w-4 h-4' />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

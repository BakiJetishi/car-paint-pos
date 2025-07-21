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
  Mail,
  Phone,
  User,
  Calendar,
  Trash2,
  MailOpen,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact');
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
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((message) => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchMessages();
        toast({
          title: 'Success',
          description: 'Message status updated',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMessages();
        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
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

  const openMessageDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'UNREAD') {
      updateMessageStatus(message.id, 'READ');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2'>Loading messages...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;
  const readCount = messages.filter((m) => m.status === 'READ').length;
  const repliedCount = messages.filter((m) => m.status === 'REPLIED').length;

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
              <h1 className='text-xl font-bold'>Contact Messages</h1>
              <p className='text-sm text-gray-600'>
                Manage customer inquiries and messages
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
                <MessageSquare className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Messages
                  </p>
                  <p className='text-2xl font-bold'>{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Mail className='h-8 w-8 text-red-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Unread</p>
                  <p className='text-2xl font-bold'>{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <MailOpen className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Read</p>
                  <p className='text-2xl font-bold'>{readCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <MessageSquare className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Replied</p>
                  <p className='text-2xl font-bold'>{repliedCount}</p>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='search'>Search Messages</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='search'
                    placeholder='Name, email, subject, message...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='status'>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Statuses' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='UNREAD'>Unread</SelectItem>
                    <SelectItem value='READ'>Read</SelectItem>
                    <SelectItem value='REPLIED'>Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Messages ({filteredMessages.length})</CardTitle>
            <CardDescription>
              {filteredMessages.length === messages.length
                ? 'Showing all messages'
                : `Showing ${filteredMessages.length} of ${messages.length} messages`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={
                        message.status === 'UNREAD' ? 'bg-blue-50' : ''
                      }
                    >
                      <TableCell>
                        <div className='flex items-center'>
                          <User className='h-4 w-4 mr-2 text-gray-400' />
                          <div>
                            <div className='font-medium'>{message.name}</div>
                            {message.phone && (
                              <div className='text-sm text-gray-500 flex items-center'>
                                <Phone className='h-3 w-3 mr-1' />
                                {message.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center'>
                          <Mail className='h-4 w-4 mr-2 text-gray-400' />
                          {message.email}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {message.subject}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center'>
                          <Calendar className='h-4 w-4 mr-2 text-gray-400' />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => openMessageDialog(message)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-2xl'>
                              <DialogHeader>
                                <DialogTitle>
                                  Message from {message.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Received on{' '}
                                  {new Date(message.createdAt).toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedMessage && (
                                <div className='space-y-4'>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                      <h4 className='font-medium mb-2'>
                                        Contact Information
                                      </h4>
                                      <p>
                                        <strong>Name:</strong>{' '}
                                        {selectedMessage.name}
                                      </p>
                                      <p>
                                        <strong>Email:</strong>{' '}
                                        {selectedMessage.email}
                                      </p>
                                      {selectedMessage.phone && (
                                        <p>
                                          <strong>Phone:</strong>{' '}
                                          {selectedMessage.phone}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className='font-medium mb-2'>
                                        Message Details
                                      </h4>
                                      <p>
                                        <strong>Subject:</strong>{' '}
                                        {selectedMessage.subject}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>
                                        <Badge
                                          className={`ml-2 ${getStatusColor(
                                            selectedMessage.status
                                          )}`}
                                        >
                                          {selectedMessage.status}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className='font-medium mb-2'>
                                      Message
                                    </h4>
                                    <div className='bg-gray-50 p-4 rounded-lg'>
                                      <p className='whitespace-pre-wrap'>
                                        {selectedMessage.message}
                                      </p>
                                    </div>
                                  </div>

                                  <div className='flex space-x-2'>
                                    <Select
                                      value={selectedMessage.status}
                                      onValueChange={(status) =>
                                        updateMessageStatus(
                                          selectedMessage.id,
                                          status
                                        )
                                      }
                                    >
                                      <SelectTrigger className='w-40'>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value='UNREAD'>
                                          Unread
                                        </SelectItem>
                                        <SelectItem value='READ'>
                                          Read
                                        </SelectItem>
                                        <SelectItem value='REPLIED'>
                                          Replied
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Button
                                      onClick={() =>
                                        window.open(
                                          `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`
                                        )
                                      }
                                      className='flex-1'
                                    >
                                      <Mail className='h-4 w-4 mr-2' />
                                      Reply via Email
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {session?.user?.role === 'ADMIN' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => deleteMessage(message.id)}
                              className='text-red-600 hover:text-red-700'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMessages.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <MessageSquare className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No messages found</p>
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

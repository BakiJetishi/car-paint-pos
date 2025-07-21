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
import { Textarea } from '@/components/ui/textarea';
import { ProductImageUpload } from '@/components/admin/ProductImageUpload';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
  Boxes,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  color: string;
  brand: string;
  size: string;
  price: number;
  stockQty: number;
  minStock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  usageInstructions?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    brand: '',
    size: '',
    price: '',
    stockQty: '',
    minStock: '5',
    category: '',
    description: '',
    imageUrl: '',
    usageInstructions: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && session.user.role === 'EMPLOYEE') {
      router.push('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to manage products',
        variant: 'destructive',
      });
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter]);

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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(
        (product) => product.stockQty <= product.minStock
      );
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((product) => product.stockQty === 0);
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const resetForm = () => {
    setFormData({
      name: '',
      color: '',
      brand: '',
      size: '',
      price: '',
      stockQty: '',
      minStock: '5',
      category: '',
      description: '',
      imageUrl: '',
      usageInstructions: '',
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product added successfully',
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      color: product.color,
      brand: product.brand,
      size: product.size,
      price: product.price.toString(),
      stockQty: product.stockQty.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      usageInstructions: product.usageInstructions || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQty === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (product.stockQty <= product.minStock) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2'>Loading products...</p>
        </div>
      </div>
    );
  }

  const lowStockProducts = products.filter(
    (p) => p.stockQty <= p.minStock && p.stockQty > 0
  );
  const outOfStockProducts = products.filter((p) => p.stockQty === 0);
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stockQty,
    0
  );

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
              <h1 className='text-xl font-bold'>Manage Products</h1>
              <p className='text-sm text-gray-600'>
                Add, edit, and manage inventory
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className='h-4 w-4 mr-2' />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details for the new product
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleAddProduct}
                className='space-y-4 max-h-[70vh] overflow-y-auto'
              >
                {/* Product Image Upload */}
                <ProductImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageChange={(imageUrl) =>
                    setFormData({ ...formData, imageUrl })
                  }
                  productName={formData.name || 'New Product'}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='name'>Product Name</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='color'>Color</Label>
                    <Input
                      id='color'
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='brand'>Brand</Label>
                    <Input
                      id='brand'
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='size'>Size</Label>
                    <Input
                      id='size'
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='price'>Price ($)</Label>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='category'>Category</Label>
                    <Input
                      id='category'
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='stockQty'>Stock Quantity</Label>
                    <Input
                      id='stockQty'
                      type='number'
                      value={formData.stockQty}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQty: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='minStock'>Min Stock Level</Label>
                    <Input
                      id='minStock'
                      type='number'
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor='usageInstructions'>
                    Usage Instructions (Optional)
                  </Label>
                  <Textarea
                    id='usageInstructions'
                    value={formData.usageInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageInstructions: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder='How to use this product...'
                  />
                </div>

                <div className='flex justify-end space-x-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Add Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                    Total Products
                  </p>
                  <p className='text-2xl font-bold'>{products.length}</p>
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
                    Inventory Value
                  </p>
                  <p className='text-2xl font-bold'>${totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <AlertTriangle className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Low Stock</p>
                  <p className='text-2xl font-bold'>
                    {lowStockProducts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Boxes className='h-8 w-8 text-red-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Out of Stock
                  </p>
                  <p className='text-2xl font-bold'>
                    {outOfStockProducts.length}
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
                <Label htmlFor='search'>Search Products</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='search'
                    placeholder='Name, color, brand, category...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='category'>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor='stock'>Stock Status</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Stock Levels' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Stock Levels</SelectItem>
                    <SelectItem value='low'>Low Stock</SelectItem>
                    <SelectItem value='out'>Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            <CardDescription>
              {filteredProducts.length === products.length
                ? 'Showing all products'
                : `Showing ${filteredProducts.length} of ${products.length} products`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{product.name}</div>
                            <div className='text-sm text-gray-500'>
                              {product.color} - {product.size}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className='font-medium'>
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {product.stockQty}
                            </div>
                            <div className='text-sm text-gray-500'>
                              Min: {product.minStock}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            {session?.user?.role === 'ADMIN' && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteProduct(product.id)}
                                className='text-red-600 hover:text-red-700'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <Package className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>No products found</p>
                  <p className='text-sm'>Try adjusting your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditProduct} className='space-y-4'>
            {/* Product Image Upload */}
            <ProductImageUpload
              currentImageUrl={formData.imageUrl}
              onImageChange={(imageUrl) =>
                setFormData({ ...formData, imageUrl })
              }
              productName={formData.name || 'Product'}
            />

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-name'>Product Name</Label>
                <Input
                  id='edit-name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='edit-color'>Color</Label>
                <Input
                  id='edit-color'
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-brand'>Brand</Label>
                <Input
                  id='edit-brand'
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='edit-size'>Size</Label>
                <Input
                  id='edit-size'
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-price'>Price ($)</Label>
                <Input
                  id='edit-price'
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='edit-category'>Category</Label>
                <Input
                  id='edit-category'
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-stockQty'>Stock Quantity</Label>
                <Input
                  id='edit-stockQty'
                  type='number'
                  value={formData.stockQty}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQty: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='edit-minStock'>Min Stock Level</Label>
                <Input
                  id='edit-minStock'
                  type='number'
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor='edit-description'>Description (Optional)</Label>
              <Textarea
                id='edit-description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='edit-usageInstructions'>
                Usage Instructions (Optional)
              </Label>
              <Textarea
                id='edit-usageInstructions'
                value={formData.usageInstructions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usageInstructions: e.target.value,
                  })
                }
                rows={3}
                placeholder='How to use this product...'
              />
            </div>

            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit'>Update Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

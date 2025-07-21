'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductModal } from '@/components/shop/ProductModal';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { CartDialog } from '@/components/cart/CartDialog';
import { useCartStore } from '@/lib/store/cart-store';
import { Paintbrush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';

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

export default function ShopPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.filter((p: Product) => p.stockQty > 0));
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
    const matchesBrand =
      selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesPrice &&
      product.stockQty > 0
    );
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addItem(product, quantity);
    toast({
      title: 'Added to Cart',
      description: `${quantity} ${product.name} added to your cart`,
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange([0, 1000]);
  };

  const activeFiltersCount = [
    searchTerm !== '',
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <NavBar />
      </header>

      {/* Products Section */}
      <section className='pb-16 pt-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Our Products
            </h2>
            <p className='text-lg text-gray-600'>
              Browse our extensive collection of automotive paints and supplies
            </p>
          </div>

          {/* Filters */}
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            categories={categories}
            brands={brands}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Products Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className='text-center py-12'>
              <Paintbrush className='h-16 w-16 mx-auto mb-4 text-gray-400' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No products found
              </h3>
              <p className='text-gray-600'>
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Dialog */}
      <CartDialog />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductModal } from '@/components/shop/ProductModal';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { CartDialog } from '@/components/cart/CartDialog';
import { CartButton } from '@/components/cart/CartButton';
import { useCartStore } from '@/lib/store/cart-store';
import {
  Paintbrush,
  Shield,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import NavBar from '@/components/ui/NavBar';
import Contact from '@/components/ui/Contact';
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

const heroSlides = [
  {
    id: 1,
    title: 'Premium Automotive Paints',
    subtitle: 'Professional-grade finishes for perfect results',
    image:
      'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    cta: 'Shop Paints',
  },
  {
    id: 2,
    title: 'Professional Spray Equipment',
    subtitle: 'High-quality spray guns and accessories',
    image:
      'https://images.pexels.com/photos/3806290/pexels-photo-3806290.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    cta: 'View Equipment',
  },
  {
    id: 3,
    title: 'Complete Body Shop Solutions',
    subtitle: 'Everything you need for professional results',
    image:
      'https://images.pexels.com/photos/3806289/pexels-photo-3806289.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    cta: 'Explore All',
  },
];

export default function HomePage() {
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8'); // Fetch only 8 products for homepage
      if (response.ok) {
        const data = await response.json();
        setProducts(data); // Show only 8 products on homepage
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send to your newsletter service
    toast({
      title: 'Subscribed!',
      description: 'Thank you for subscribing to our newsletter.',
    });
    setNewsletterEmail('');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-50'>
        <NavBar />
      </header>

      {/* Hero Slider */}
      <section id='home' className='relative h-screen overflow-hidden'>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide
                ? 'translate-x-0'
                : index < currentSlide
                ? '-translate-x-full'
                : 'translate-x-full'
            }`}
          >
            <div
              className='w-full h-full bg-cover bg-center bg-no-repeat'
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent' />
              <div className='relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8'>
                <div className='max-w-2xl text-center sm:text-left'>
                  <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight'>
                    {slide.title}
                  </h1>
                  <p className='text-base sm:text-lg md:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed'>
                    {slide.subtitle}
                  </p>
                  <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4'>
                    <Link href='/shop'>
                      <Button
                        size='lg'
                        className='bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto'
                      >
                        {slide.cta}
                        <ArrowRight className='ml-2 h-5 w-5' />
                      </Button>
                    </Link>
                    <Button
                      size='lg'
                      variant='outline'
                      className='border-white text-black hover:bg-white hover:text-gray-900 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto'
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all'
        >
          <ChevronLeft className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
        </button>
        <button
          onClick={nextSlide}
          className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all'
        >
          <ChevronRight className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
        </button>

        {/* Slide Indicators */}
        <div className='absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2'>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Why Choose AutoPaint Pro?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Professional automotive paint solutions with unmatched quality and
              service
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform'>
                <Shield className='h-10 w-10 text-white' />
              </div>
              <h3 className='text-2xl font-bold mb-4 text-gray-900'>
                Premium Quality
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Professional-grade paints and coatings from the world's most
                trusted brands, ensuring perfect finishes every time.
              </p>
            </div>

            <div className='group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform'>
                <Truck className='h-10 w-10 text-white' />
              </div>
              <h3 className='text-2xl font-bold mb-4 text-gray-900'>
                Fast Delivery
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Quick and reliable cargo delivery nationwide. Get your supplies
                when you need them with our efficient logistics network.
              </p>
            </div>

            <div className='group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform'>
                <Award className='h-10 w-10 text-white' />
              </div>
              <h3 className='text-2xl font-bold mb-4 text-gray-900'>
                Expert Support
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Professional advice and technical support from paint specialists
                with decades of industry experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Featured Products
            </h2>
            <p className='text-lg text-gray-600'>
              Discover our most popular automotive paints and supplies
            </p>
          </div>

          {/* Quick Filters */}
          <div className='mb-8'>
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
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

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

              {/* View All Products Button */}
              <div className='text-center'>
                <Link href='/shop'>
                  <Button size='lg' className='bg-blue-600 hover:bg-blue-700'>
                    View All Products
                    <ArrowRight className='h-5 w-5 ml-2' />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <Contact />

      {/* Newsletter Section */}
      <section className='py-16 bg-gradient-to-r from-blue-600 to-blue-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>Stay Updated</h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Subscribe to our newsletter for the latest products, tips, and
            exclusive offers
          </p>

          <form onSubmit={handleNewsletterSubmit} className='max-w-md mx-auto'>
            <div className='flex gap-4'>
              <Input
                type='email'
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70'
              />
              <Button
                type='submit'
                className='bg-white text-blue-600 hover:bg-gray-100'
              >
                Subscribe
              </Button>
            </div>
          </form>
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

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  categories: string[];
  brands: string[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  categories,
  brands,
  onClearFilters,
  activeFiltersCount,
}: FilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className='mb-6'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center text-lg'>
            <Filter className='h-5 w-5 mr-2' />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className='flex items-center space-x-2'>
            {activeFiltersCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onClearFilters}
                className='text-red-600 hover:text-red-700'
              >
                <X className='h-4 w-4 mr-1' />
                Clear All
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='md:hidden'
            >
              <SlidersHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={`space-y-4 ${isExpanded ? 'block' : 'hidden md:block'}`}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Search */}
          <div className='space-y-2'>
            <Label htmlFor='search'>Search Products</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='search'
                placeholder='Search by name, color, brand...'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
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

          {/* Brand Filter */}
          <div className='space-y-2'>
            <Label htmlFor='brand'>Brand</Label>
            <Select value={selectedBrand} onValueChange={onBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder='All Brands' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className='space-y-2'>
            <Label>Price Range</Label>
            <div className='flex items-center space-x-2'>
              <Input
                type='number'
                placeholder='Min'
                value={priceRange[0] || ''}
                onChange={(e) =>
                  onPriceRangeChange([
                    Number(e.target.value) || 0,
                    priceRange[1],
                  ])
                }
                className='w-20'
              />
              <span className='text-gray-500'>-</span>
              <Input
                type='number'
                placeholder='Max'
                value={priceRange[1] || ''}
                onChange={(e) =>
                  onPriceRangeChange([
                    priceRange[0],
                    Number(e.target.value) || 1000,
                  ])
                }
                className='w-20'
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className='flex flex-wrap gap-2 pt-2 border-t'>
            <span className='text-sm text-gray-600'>Active filters:</span>
            {searchTerm && (
              <Badge variant='outline' className='flex items-center'>
                Search: "{searchTerm}"
                <X
                  className='h-3 w-3 ml-1 cursor-pointer'
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant='outline' className='flex items-center'>
                Category: {selectedCategory}
                <X
                  className='h-3 w-3 ml-1 cursor-pointer'
                  onClick={() => onCategoryChange('all')}
                />
              </Badge>
            )}
            {selectedBrand !== 'all' && (
              <Badge variant='outline' className='flex items-center'>
                Brand: {selectedBrand}
                <X
                  className='h-3 w-3 ml-1 cursor-pointer'
                  onClick={() => onBrandChange('all')}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant='outline' className='flex items-center'>
                Price: ${priceRange[0]} - ${priceRange[1]}
                <X
                  className='h-3 w-3 ml-1 cursor-pointer'
                  onClick={() => onPriceRangeChange([0, 1000])}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

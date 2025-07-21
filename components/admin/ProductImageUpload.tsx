'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ProductImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  productName?: string;
}

export function ProductImageUpload({
  currentImageUrl,
  onImageChange,
  productName = 'Product',
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file (JPG, PNG, GIF, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productName', productName);

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Update parent component with new image URL
      onImageChange(result.url);

      toast({
        title: 'Image Uploaded',
        description: 'Product image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });

      // Reset preview on error
      setPreviewUrl(currentImageUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-4'>
      <Label>Product Image</Label>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
      />

      {/* Image preview or upload area */}
      <Card className='overflow-hidden'>
        <CardContent className='p-0'>
          {previewUrl ? (
            <div className='relative group'>
              <div className='aspect-square relative bg-gray-100'>
                <Image
                  src={previewUrl}
                  alt={`${productName} preview`}
                  fill
                  className='object-cover'
                />
              </div>

              {/* Overlay with actions */}
              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={triggerFileSelect}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <Upload className='h-4 w-4 mr-2' />
                  )}
                  Change
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className='h-4 w-4 mr-2' />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className='aspect-square border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100'
              onClick={triggerFileSelect}
            >
              {uploading ? (
                <div className='text-center'>
                  <Loader2 className='h-12 w-12 text-gray-400 animate-spin mx-auto mb-4' />
                  <p className='text-gray-600'>Uploading...</p>
                </div>
              ) : (
                <div className='text-center'>
                  <ImageIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600 mb-2'>
                    Click to upload product image
                  </p>
                  <p className='text-sm text-gray-500'>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload button (alternative to clicking the area) */}
      <div className='flex space-x-2'>
        <Button
          variant='outline'
          onClick={triggerFileSelect}
          disabled={uploading}
          className='flex-1'
        >
          {uploading ? (
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
          ) : (
            <Upload className='h-4 w-4 mr-2' />
          )}
          {previewUrl ? 'Change Image' : 'Upload Image'}
        </Button>

        {previewUrl && (
          <Button
            variant='outline'
            onClick={handleRemoveImage}
            disabled={uploading}
            className='text-red-600 hover:text-red-700'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  creator: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  variantId?: string;
  variantName?: string;
}

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
}

export const AddToCartButton = ({ 
  product, 
  variant = 'default',
  className = '' 
}: AddToCartButtonProps) => {
  const { addToCart, isInCart, getCartItemQuantity, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  
  const inCart = isInCart(product.id, product.variantId);
  const currentQuantity = getCartItemQuantity(product.id, product.variantId);

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    setIsLoading(true);
    try {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error("Failed to add item to cart",error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(product.id, newQuantity, product.variantId);
  };

  // Out of stock
  if (product.stock <= 0) {
    return (
      <Button disabled variant="outline" className={className}>
        Out of Stock
      </Button>
    );
  }

  // Icon variant
  if (variant === 'icon') {
    return (
      <Button
        variant={inCart ? "default" : "outline"}
        size="icon"
        onClick={handleAddToCart}
        disabled={isLoading}
        className={className}
      >
        {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </Button>
    );
  }

  // Compact variant - shows quantity controls when in cart
  if (variant === 'compact' && inCart) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <p className='text-sm font-medium whitespace-nowrap text-muted-foreground'>
          In Cart:{" "}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(currentQuantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium min-w-[20px] text-center">
          {currentQuantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(currentQuantity + 1)}
          disabled={currentQuantity >= product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <Button
      variant={inCart ? "default" : "outline"}
      onClick={handleAddToCart}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        'Adding...'
      ) : inCart ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added ({currentQuantity})
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
};

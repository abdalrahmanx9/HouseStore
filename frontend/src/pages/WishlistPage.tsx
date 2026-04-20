import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

interface WishlistItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category: string;
    stock_count: number;
  };
}

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const { data: wishlist, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/wishlist/');
      return data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => axios.delete(`/api/v1/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    },
  });

  const handleAddToCart = (item: WishlistItem) => {
    if (item.product.stock_count <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image_url: item.product.image_url,
      category: item.product.category,
      stock_count: item.product.stock_count,
    } as Parameters<typeof addToCart>[0]);
    toast.success(`${item.product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-xl bg-surface animate-pulse border border-border"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Heart size={64} className="mx-auto text-foreground/20" />
          <h2 className="text-xl font-semibold text-foreground">Your wishlist is empty</h2>
          <p className="text-foreground/50 text-sm">
            Browse products and save your favorites here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Products
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        My Wishlist ({wishlist.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl bg-surface border border-border overflow-hidden hover:bg-surface-hover transition-colors group"
            >
              <Link to={`/products/${item.product.id}`} className="aspect-square overflow-hidden bg-surface block">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                    <Heart size={48} className="text-foreground/20" />
                  </div>
                )}
              </Link>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-foreground/50 mt-0.5">{item.product.category}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {item.product.price.toLocaleString()} EGP
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.product.stock_count > 0
                        ? 'bg-green-500/10 text-success'
                        : 'bg-red-500/10 text-danger'
                    }`}
                  >
                    {item.product.stock_count > 0 ? `${item.product.stock_count} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.product.stock_count <= 0}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={15} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(item.product.id)}
                    disabled={removeMutation.isPending}
                    className="flex items-center justify-center px-3 py-2 rounded-lg border border-border text-danger hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

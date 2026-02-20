import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, Check, X, ShieldCheck, Zap, Share2, Heart, Gamepad2, Laptop, MessageCircle, Cpu, GraduationCap, Package, Star, AlertTriangle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import type { Review, Product } from '../types'
import ReviewList from '../components/ReviewList'
import ProductCard from '../components/ProductCard'

import ReactMarkdown from 'react-markdown'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Breadcrumbs from '../components/Breadcrumbs'
import RecentlyViewed, { trackProductView } from '../components/RecentlyViewed'
import { usePageMeta } from '../hooks/usePageMeta'

const CATEGORY_STYLES: Record<string, { gradient: string, Icon: any }> = {
  'games':        { gradient: 'from-violet-600/30 via-purple-500/20 to-fuchsia-500/10', Icon: Gamepad2 },
  'software':     { gradient: 'from-blue-600/30 via-cyan-500/20 to-teal-500/10',       Icon: Laptop },
  'social media': { gradient: 'from-pink-600/30 via-rose-500/20 to-orange-500/10',      Icon: MessageCircle },
  'system':       { gradient: 'from-emerald-600/30 via-green-500/20 to-lime-500/10',    Icon: Cpu },
  'education':    { gradient: 'from-amber-600/30 via-yellow-500/20 to-orange-500/10',   Icon: GraduationCap },
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category.toLowerCase()] || { gradient: 'from-indigo-600/30 via-blue-500/20 to-sky-500/10', Icon: Package }
}

const fetchProduct = async (id: string): Promise<Product> => {
  const response = await axios.get(`/api/v1/products/${id}`)
  return response.data
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  })

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', id],
    queryFn: async () => {
        const res = await axios.get(`/api/v1/reviews/product/${id}`)
        return res.data
    },
    enabled: !!id,
  })

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ['related-products', id],
    queryFn: async () => {
        const res = await axios.get(`/api/v1/products/${id}/related`)
        return res.data
    },
    enabled: !!id,
  })

  const { data: ratingData } = useQuery<{ average: number; total: number; distribution: Record<string, number> }>({
    queryKey: ['product-rating', id],
    queryFn: async () => {
        const res = await axios.get(`/api/v1/products/${id}/rating`)
        return res.data
    },
    enabled: !!id,
  })

  usePageMeta({
    title: product?.name,
    description: product?.description?.slice(0, 160) || `Buy ${product?.name || 'this product'} at House Store`,
    ogTitle: product?.name,
    ogDescription: product?.description?.slice(0, 160),
    ogImage: product?.image_url,
  })

  useEffect(() => {
    if (product) {
      trackProductView(product)
    }
  }, [product])
  
  // Immersive Portrait Media Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Persist Favorites locally
  const [favorites, setFavorites] = useState<Product[]>(() => {
     const stored = localStorage.getItem('favorites')
     return stored ? JSON.parse(stored) : []
  })
  const isFavorite = product ? favorites.some(fav => fav.id === product.id) : false

  const toggleFavorite = () => {
      if (!product) return
      let newFavs = []
      if (isFavorite) {
         newFavs = favorites.filter(fav => fav.id !== product.id)
      } else {
         newFavs = [...favorites, product]
      }
      setFavorites(newFavs)
      localStorage.setItem('favorites', JSON.stringify(newFavs))
  }

  const handleShare = async () => {
      try {
          if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(window.location.href)
          } else {
              const textArea = document.createElement("textarea")
              textArea.value = window.location.href
              textArea.style.position = "fixed"
              textArea.style.left = "-999999px"
              textArea.style.top = "-999999px"
              document.body.appendChild(textArea)
              textArea.focus()
              textArea.select()
              document.execCommand('copy')
              textArea.remove()
          }
           toast.success('Link copied to clipboard!')
      } catch (err) {
           console.error("Failed to copy link", err)
           toast.error('Failed to copy link. Please copy the URL manually.')
      }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-16">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <Skeleton className="h-[600px] lg:w-2/3 rounded-[2.5rem]" />
          <Skeleton className="h-[400px] lg:w-1/3 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-6 bg-danger/10 rounded-full mb-6">
            <X className="w-16 h-16 text-danger" />
        </div>
        <p className="text-3xl font-bold text-foreground mb-6 font-display">Product not found</p>
        <Link to="/">
          <Button variant="outline" size="lg" className="rounded-full"><ArrowLeft className="w-5 h-5 mr-2" /> Return to Store</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      
      {/* Immersive Header Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-background pointer-events-none z-0" />

      {/* Breadcrumbs */}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 pt-24 relative z-10">
        <Breadcrumbs items={[
          { label: product.category, href: `/?category=${encodeURIComponent(product.category)}` },
          { label: product.name }
        ]} />
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 pt-8 lg:pt-12 relative z-10">
        
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary mb-8 transition-colors text-sm font-semibold tracking-wide uppercase">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
          
          {/* Main Content Column (Left) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Massive Image Container */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full bg-surface-hover/50 aspect-video md:aspect-[21/9] lg:aspect-[16/9] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group border border-border/40 shadow-2xl"
            >
               {/* Decorative Gradient Glow inside image */}
               <div className="absolute inset-0 bg-gradient-to-tr from-surface-hover via-background to-primary/10 opacity-80" />
               
               {product.image_url ? (
                  <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover z-10 cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setIsImageModalOpen(true)}
                  />
               ) : (() => {
                  const { gradient, Icon: CategoryIcon } = getCategoryStyle(product.category)
                  return (
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} z-10`}>
                      <CategoryIcon className="w-24 h-24 text-foreground/10" strokeWidth={1} />
                    </div>
                  )
               })()}
               
               {/* Badges Floating on Image */}
               <div className="absolute top-6 left-6 z-20 flex gap-2">
                  <Badge variant="secondary" className="backdrop-blur-xl bg-background/60 border-border/50 shadow-lg px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                    {product.category}
                  </Badge>
                  {product.subcategory && (
                    <Badge variant="outline" className="backdrop-blur-xl bg-background/40 border-border/30 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg text-gray-300">
                      {product.subcategory}
                    </Badge>
                  )}
               </div>
            </motion.div>

            {/* Title & Description Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-2"
            >
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1] font-display uppercase mb-6">
                  {product.name}
               </h1>
               <div dir="rtl" className="prose prose-lg prose-gray dark:prose-invert max-w-3xl text-gray-400 leading-relaxed text-lg lg:text-xl font-medium text-right mb-8">
                  <ReactMarkdown>
                    {product.description || 'Experience the pinnacle of digital craftsmanship with this premium asset, tailored to integrate seamlessly into your elite workflow.'}
                  </ReactMarkdown>
               </div>
            </motion.div>
          </div>
          
          {/* ACTION HUB (Sticky Sidebar - Right) */}
          <div className="w-full lg:w-1/3 pt-2 lg:sticky lg:top-24">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
            >
              <Card className="rounded-[2.5rem] bg-surface/60 backdrop-blur-2xl border border-border/50 p-8 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
                
                {/* Decorative Hub Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex justify-between items-start mb-6 z-10">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                    <div className="flex gap-2">
                       <button onClick={handleShare} className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-gray-400">
                         <Share2 className="w-4 h-4" />
                       </button>
                       <button onClick={toggleFavorite} className={`w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center transition-colors ${isFavorite ? 'bg-red-500/20 text-red-500' : 'hover:bg-red-500/20 hover:text-red-500 text-gray-400'}`}>
                         <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                       </button>
                    </div>
                </div>

                <div className="mb-8 z-10">
                    <p className="text-[3rem] font-black text-foreground leading-none tracking-tighter font-display mb-2">
                        {product.price}
                        <span className="text-xl text-gray-500 ml-1 align-top relative top-3">EGP</span>
                    </p>
                    {product.stock_count > 10 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-bold">
                          <Check className="w-3 h-3" /> In Stock
                        </div>
                    ) : product.stock_count > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                          <AlertTriangle className="w-3 h-3" /> Low Stock &mdash; {product.stock_count} left
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/20 text-danger text-sm font-bold">
                          <X className="w-3 h-3" /> Out of Stock
                        </div>
                    )}
                </div>

                {/* Metadata Modules */}
                <div className="grid grid-cols-1 gap-4 mb-8 z-10">
                     <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-border/30">
                        <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                           <Zap className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                           <span className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Delivery System</span>
                           <p className="font-semibold text-foreground text-sm uppercase tracking-wide">{product.delivery_type === 'auto' ? 'Instant Activation' : 'Manual Fulfillment'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-border/30">
                        <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                           <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                           <span className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Availability</span>
                           <p className="font-semibold text-foreground text-sm uppercase tracking-wide">{product.stock_count} Licenses Left</p>
                        </div>
                     </div>
                </div>

                {/* Primary Action */}
                <Button 
                    size="lg"
                    className="w-full text-lg h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-[0_0_30px_-5px_var(--color-primary)] transition-transform hover:scale-[1.02] active:scale-[0.98] z-10"
                    disabled={product.stock_count === 0}
                    onClick={() => addToCart(product)}
                >
                    {product.stock_count > 0 ? 'Initialize Purchase' : 'Out of Stock'}
                </Button>
                
                <p className="text-center text-xs text-gray-500 mt-6 font-medium z-10">
                  Encrypted & Secure Transaction via Stripe
                </p>

              </Card>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section Upgrade */}
        <motion.div 
           initial={{ y: 40, opacity: 0 }}
           whileInView={{ y: 0, opacity: 1 }}
           viewport={{ once: true }}
           className="mt-32 w-full max-w-[1920px] mx-auto border-t border-border/30 pt-16"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 px-2">
               <div>
                 <h2 className="text-4xl md:text-5xl font-black text-foreground font-display uppercase tracking-tight mb-2">Customer Reviews</h2>
                 <p className="text-xl text-gray-400 font-medium">Verified purchases from {reviews?.length || 0} customers.</p>
               </div>

               {/* Rating Breakdown */}
               {ratingData && ratingData.total > 0 && (
                 <div className="bg-surface border border-border/50 rounded-2xl p-6 min-w-[280px] shrink-0">
                   <div className="flex items-center gap-4 mb-4">
                     <span className="text-5xl font-black text-foreground tracking-tighter">{ratingData.average.toFixed(1)}</span>
                     <div>
                       <div className="flex text-yellow-500 mb-1">
                         {[1, 2, 3, 4, 5].map(s => (
                           <Star key={s} className={`w-5 h-5 ${s <= Math.round(ratingData.average) ? 'fill-current' : 'text-gray-600'}`} />
                         ))}
                       </div>
                       <p className="text-sm text-gray-400">{ratingData.total} review{ratingData.total !== 1 ? 's' : ''}</p>
                     </div>
                   </div>
                   <div className="space-y-2">
                     {[5, 4, 3, 2, 1].map(star => {
                       const count = ratingData.distribution[String(star)] || 0
                       const pct = ratingData.total > 0 ? (count / ratingData.total) * 100 : 0
                       return (
                         <div key={star} className="flex items-center gap-2 text-sm">
                           <span className="w-6 text-right text-gray-400 font-medium">{star}</span>
                           <Star className="w-3 h-3 text-yellow-500 fill-current shrink-0" />
                           <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                             <motion.div
                               initial={{ width: 0 }}
                               whileInView={{ width: `${pct}%` }}
                               viewport={{ once: true }}
                               transition={{ duration: 0.8, ease: 'easeOut' }}
                               className="h-full bg-yellow-500 rounded-full"
                             />
                           </div>
                           <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}
            </div>
            
            {/* Reviews display area */}
            <div className="max-w-4xl px-2">
               <ReviewList reviews={reviews || []} />
            </div>
        </motion.div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 w-full max-w-[1920px] mx-auto border-t border-border/30 pt-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground font-display uppercase tracking-tight mb-8 px-2">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Portrait Media Modal */}
      <AnimatePresence>
        {isImageModalOpen && product?.image_url && (
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-pointer"
             onClick={() => setIsImageModalOpen(false)}
          >
              <button 
                className="absolute top-6 right-6 p-2 rounded-full bg-surface/30 text-white hover:bg-surface-hover transition-colors z-[110]"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={product.image_url} 
                alt={product.name}
                className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] cursor-default select-none"
                onClick={(e) => e.stopPropagation()}
              />
          </motion.div>
        )}
      </AnimatePresence>

      <RecentlyViewed />
    </div>
  )
}

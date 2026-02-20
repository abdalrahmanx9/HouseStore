import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, Check, X, ShieldCheck, Zap, Share2, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import type { Review, Product } from '../types'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import { useAuth } from '../context/AuthContext'
import ReactMarkdown from 'react-markdown'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { useState } from 'react'

const fetchProduct = async (id: string): Promise<Product> => {
  const response = await axios.get(`/api/v1/products/${id}`)
  return response.data
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { user } = useAuth()
  
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

  const { data: myOrders } = useQuery<any[]>({
      queryKey: ['my-orders'],
      queryFn: async () => {
          const res = await axios.get('/api/v1/orders/')
          return res.data
      },
      enabled: !!user
  })

  const hasPurchased = myOrders?.some(order => order.product_id === parseInt(id!) && order.status === 'completed')
  const [isFavorite, setIsFavorite] = useState(false)

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href)
      alert("Product Link copied to clipboard!")
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
               <motion.span 
                 initial={{ scale: 0.9 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 0.8 }}
                 className="text-border-subtle tracking-[0.3em] uppercase font-display font-black text-2xl opacity-40 z-10"
               >
                 Media Preview
               </motion.span>
               
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
               <div className="prose prose-lg prose-gray dark:prose-invert max-w-3xl text-gray-400 leading-relaxed text-lg lg:text-xl font-medium">
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
                       <button onClick={() => setIsFavorite(!isFavorite)} className={`w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center transition-colors ${isFavorite ? 'bg-red-500/20 text-red-500' : 'hover:bg-red-500/20 hover:text-red-500 text-gray-400'}`}>
                         <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                       </button>
                    </div>
                </div>

                <div className="mb-8 z-10">
                    <p className="text-[3rem] font-black text-foreground leading-none tracking-tighter font-display mb-2">
                        {product.price}
                        <span className="text-xl text-gray-500 ml-1 align-top relative top-3">EGP</span>
                    </p>
                    {product.stock_count > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-bold">
                          <Check className="w-3 h-3" /> Ready for Deployment
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/20 text-danger text-sm font-bold">
                          <X className="w-3 h-3" /> Systems Offline
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
               <div>
                 <h2 className="text-4xl md:text-5xl font-black text-foreground font-display uppercase tracking-tight mb-2">Customer Reviews</h2>
                 <p className="text-xl text-gray-400 font-medium">Verified purchases from {reviews?.length || 0} customers.</p>
               </div>
               
               {user ? (
                   hasPurchased ? (
                       <div className="w-full md:w-auto mt-4 md:mt-0">
                         {/* For a real app, this form could be a modal or expanding drawer to keep UI clean */}
                         <Card className="rounded-[2rem] p-6 bg-surface/50 border-border/50 max-w-md ml-auto">
                            <ReviewForm productId={product.id} />
                         </Card>
                       </div>
                   ) : (
                       <div className="px-6 py-4 mt-4 md:mt-0 rounded-[2rem] border border-border/50 bg-surface/30 backdrop-blur-md flex flex-col items-center gap-2 md:flex text-center max-w-sm ml-auto">
                           <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Verified Purchase Required</span>
                           <p className="text-xs text-gray-500">You must purchase this asset and wait for activation to submit intelligence.</p>
                       </div>
                   )
               ) : (
                   <div className="px-6 py-4 rounded-[2rem] border border-border/50 bg-surface/30 backdrop-blur-md flex items-center gap-4 hidden md:flex">
                       <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Authentication Required</span>
                       <Link to="/login">
                           <Button variant="secondary" size="sm" className="rounded-full px-6 uppercase font-bold text-xs tracking-wider">Log In</Button>
                       </Link>
                   </div>
               )}
            </div>
            
            {/* Reviews display area could be upgraded in ReviewList.tsx, but we render it here */}
            <div className="max-w-4xl px-2">
               <ReviewList reviews={reviews || []} />
            </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { Star, ShieldCheck, Zap, Gamepad2, Laptop, MessageCircle, Cpu, Store } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock_count: number
  description?: string
  subcategory?: string
  delivery_type?: string
  is_active?: boolean
}

const fetchProducts = async (): Promise<Product[]> => {
  // Use relative URL to leverage proxy if setup, or absolute for now
  // In production we should use env var
  const response = await axios.get('/api/v1/products/')
  return response.data
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    full_name?: string;
    email?: string;
    picture?: string;
  };
  product?: {
    name: string;
    image_url?: string;
  };
}

const fetchRecentReviews = async (): Promise<Review[]> => {
  const response = await axios.get('/api/v1/reviews/recent')
  return response.data
}

import { Skeleton } from '../components/ui/Skeleton'
import { TypewriterText } from '../components/ui/TypewriterText'

import { motion } from 'framer-motion'

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const { data: recentReviews } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: fetchRecentReviews,
  })

  // Filter products based on selected category
  const filteredProducts = products?.filter(product => {
    if (!selectedCategory) return true;
    return product.category.toLowerCase() === selectedCategory.toLowerCase();
  }) || [];

  if (isLoading) {
    return (
      <div className="w-full max-w-[1920px] px-4 md:px-8 mx-auto py-24">
        <Skeleton className="h-[400px] w-full max-w-3xl mb-16 rounded-3xl" />
        <h2 className="text-3xl font-bold text-foreground mb-10">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-4">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
        <div className="flex justify-center items-center h-[50vh] w-full max-w-[1920px] px-4 md:px-8 mx-auto">
          <p className="text-xl text-danger font-medium flex items-center gap-2"><span>⚠️</span> Error loading products. Please try again later.</p>
        </div>
      )
  }

  if (!products || products.length === 0) {
    return (
        <div className="flex justify-center items-center h-[50vh] w-full max-w-[1920px] px-4 md:px-8 mx-auto">
          <p className="text-xl text-gray-500">No products found.</p>
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center overflow-hidden bg-[#09090b] pt-20 pb-24 lg:pt-32 lg:pb-36 border-b border-border/10">
        
        {/* Layer 0: Subtle Grid & Gradient Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.10)_0%,transparent_60%)] pointer-events-none" />

        {/* Layer 1: Massive Background Parallax Text (Meebits Style) */}
        <div className="absolute flex justify-center items-center inset-0 overflow-hidden pointer-events-none select-none z-0">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.03 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[15vw] font-black uppercase tracking-tighter text-white whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            HOUSE
          </motion.h1>
        </div>

        {/* Layer 2: Foreground Content (FreakHosting Typewriter Style) */}
        <div className="w-full max-w-[1920px] px-4 md:px-8 mx-auto relative z-10 flex flex-col items-center justify-center text-center gap-8 mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 uppercase tracking-widest backdrop-blur-md">
              <Zap className="w-4 h-4 fill-current" /> Next-Gen Digital Store
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.1] font-display uppercase">
              Elevate Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
                <TypewriterText 
                  phrases={['Gaming Experience', 'Digital Workflow', 'Creative Pipeline', 'Software Arsenal']} 
                  typingSpeed={80} 
                  deletingSpeed={40} 
                  pauseDuration={2500} 
                />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed font-medium">
              Discover a rigorously curated collection of premium software, professional tools, and digital assets engineered to accelerate your potential.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-surface/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-border/50 shadow-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-surface/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-border/50 shadow-xl">
                    <Zap className="w-4 h-4 text-amber-400" /> Instant Delivery
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Chapter Nav */}
      <div className="sticky top-16 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/50 py-4 shadow-sm">
        <div className="w-full max-w-[1920px] px-4 md:px-8 mx-auto flex items-center justify-start md:justify-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
             onClick={() => setSelectedCategory(null)}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${!selectedCategory ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!selectedCategory ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
              <Store className={`w-6 h-6 transition-transform ${!selectedCategory ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${!selectedCategory ? 'font-bold' : 'font-medium'}`}>Verify All</span>
          </button>
          
          <button 
             onClick={() => setSelectedCategory('Games')}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${selectedCategory === 'Games' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedCategory === 'Games' ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
               <Gamepad2 className={`w-6 h-6 transition-transform ${selectedCategory === 'Games' ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${selectedCategory === 'Games' ? 'font-bold' : 'font-medium'}`}>Games</span>
          </button>

          <button 
             onClick={() => setSelectedCategory('Software')}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${selectedCategory === 'Software' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedCategory === 'Software' ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
               <Laptop className={`w-6 h-6 transition-transform ${selectedCategory === 'Software' ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${selectedCategory === 'Software' ? 'font-bold' : 'font-medium'}`}>Software</span>
          </button>

          <button 
             onClick={() => setSelectedCategory('Social Media')}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${selectedCategory === 'Social Media' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedCategory === 'Social Media' ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
               <MessageCircle className={`w-6 h-6 transition-transform ${selectedCategory === 'Social Media' ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${selectedCategory === 'Social Media' ? 'font-bold' : 'font-medium'}`}>Social Media</span>
          </button>
          
          <button 
             onClick={() => setSelectedCategory('System')}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${selectedCategory === 'System' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedCategory === 'System' ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
               <Cpu className={`w-6 h-6 transition-transform ${selectedCategory === 'System' ? 'scale-110' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${selectedCategory === 'System' ? 'font-bold' : 'font-medium'}`}>System Tools</span>
          </button>
        </div>
      </div>

      {/* Product Grid Section */}
      <section className="w-full max-w-[1920px] px-4 md:px-8 mx-auto py-16 lg:py-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
             {selectedCategory ? `${selectedCategory} Collection` : 'Featured Products'}
          </h2>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="bg-surface/50 border border-border/50 rounded-2xl p-12 text-center max-w-2xl mx-auto">
             <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
                 <Store className="w-8 h-8 text-gray-500" />
             </div>
             <p className="text-xl font-bold text-foreground mb-2">No products found</p>
             <p className="text-gray-400 mb-6">We couldn't find any active products in the "{selectedCategory}" category.</p>
             <button
               onClick={() => setSelectedCategory(null)}
               className="text-primary hover:text-blue-400 font-medium tracking-wide transition-colors uppercase text-sm"
             >
               View All Products
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 min-h-[400px]">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews Section */}
      {recentReviews && recentReviews.length > 0 && (
        <section className="w-full bg-surface py-16 lg:py-24 border-t border-border/50">
           <div className="w-full max-w-[1920px] px-4 md:px-8 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Loved by Developers Worldwide</h2>
                <p className="text-gray-400">Don't just take our word for it. Here's what our community has to say about our premium assets.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {recentReviews.map((review, idx) => (
                  <motion.div 
                      key={review.id}
                      whileHover={{ y: -5 }}
                      className="bg-background p-8 rounded-2xl border border-border/50 shadow-xl flex flex-col justify-between"
                  >
                      <div>
                          <div className="flex text-yellow-500 mb-4">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                              ))}
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed italic">"{review.comment || 'No comment provided.'}"</p>
                      </div>
                      <div className="flex items-center gap-4 border-t border-border/50 pt-4 mt-auto">
                          {/* User Avatar */}
                          {review.user?.picture ? (
                              <img src={review.user.picture} alt="User Avatar" loading={idx < 3 ? 'eager' : 'lazy'} className="w-10 h-10 rounded-full object-cover shadow-lg border border-border/50" />
                          ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-bold text-gray-400 shadow-lg border border-border/50">
                                  {(review.user?.full_name || review.user?.email || 'A')[0].toUpperCase()}
                              </div>
                          )}
                          
                          <div className="flex-1">
                              <p className="font-semibold text-foreground text-sm line-clamp-1">{review.user?.full_name || review.user?.email?.split('@')[0] || 'Anonymous'}</p>
                              <p className="text-xs text-primary font-medium tracking-wide">Verified Customer</p>
                          </div>
                          
                          {/* Product Thumbnail */}
                          {review.product?.image_url && (
                             <img src={review.product.image_url} alt={review.product.name} loading={idx < 3 ? 'eager' : 'lazy'} className="w-12 h-12 rounded-lg object-cover ml-auto border border-border/30 shadow-md" title={`Purchased ${review.product.name}`} />
                          )}
                      </div>
                  </motion.div>
                ))}
            </div>
         </div>
        </section>
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { Star, ShieldCheck, Zap, Gamepad2, Laptop, MessageCircle, Cpu, Store, GraduationCap, Package, Search, ArrowUpDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [visibleCount, setVisibleCount] = useState(12)
  const location = useLocation()

  usePageMeta({
    title: 'Digital Store',
    description: 'Discover premium software, games, and digital assets at House Store. Secure checkout, instant delivery.',
  })

   
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) {
        setSelectedCategory(cat)
        // Scroll slightly past the trending/categories to see items
        const el = document.getElementById('catalog')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.search])

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const { data: recentReviews } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: fetchRecentReviews,
  })

  const filteredProducts = useMemo(() => {
    let result = products?.filter(product => {
      const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];

    // Sort
    switch (sortBy) {
      case 'price_asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price_desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'stock': result = [...result].sort((a, b) => a.stock_count - b.stock_count); break;
      case 'name': result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Reset pagination when filters change
   
  useEffect(() => {
    setVisibleCount(12)
  }, [selectedCategory, searchQuery, sortBy])

  const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'games': Gamepad2,
    'software': Laptop,
    'social media': MessageCircle,
    'system': Cpu,
    'education': GraduationCap,
  }

  const uniqueCategories = useMemo(() => {
    if (!products) return []
    const cats = Array.from(new Set(products.map(p => p.category)))
    return cats
  }, [products])

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
      <div id="categories" className="sticky top-16 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/50 py-4 shadow-sm">
        <div className="w-full max-w-[1920px] px-4 md:px-8 mx-auto flex items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border/50 rounded-full text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {/* Category Buttons */}
          <div className="flex items-center justify-start md:justify-center gap-6 overflow-x-auto no-scrollbar scroll-smooth flex-1">
          <button 
             onClick={() => setSelectedCategory(null)}
             className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${!selectedCategory ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!selectedCategory ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
              <Store className={`w-6 h-6 transition-transform ${!selectedCategory ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
            </div>
            <span className={`text-xs ${!selectedCategory ? 'font-bold' : 'font-medium'}`}>View All</span>
          </button>
          
          {uniqueCategories.map(cat => {
            const CatIcon = CATEGORY_ICONS[cat.toLowerCase()] || Package
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors group ${isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary/20' : 'bg-surface group-hover:bg-primary/10'}`}>
                  <CatIcon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{cat}</span>
              </button>
            )
          })}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <section id="trending" className="w-full max-w-[1920px] px-4 md:px-8 mx-auto py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <Star className="w-8 h-8 text-yellow-500 fill-current" /> Trending Now
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {products?.slice().sort((a, b) => a.stock_count - b.stock_count).slice(0, 4).map((product) => (
             <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Product Grid Section */}
      <section id="catalog" className="w-full max-w-[1920px] px-4 md:px-8 mx-auto pb-16 lg:pb-24">
        <div className="flex items-center justify-between mb-10 gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
             {selectedCategory ? `${selectedCategory} Collection` : 'Featured Products'}
          </h2>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-foreground/40" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer pr-10 relative shadow-sm hover:border-primary/50 transition-colors"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
            >
              <option value="default" className="bg-surface text-foreground font-medium py-2">Default Sort</option>
              <option value="price_asc" className="bg-surface text-foreground font-medium py-2">Price: Low → High</option>
              <option value="price_desc" className="bg-surface text-foreground font-medium py-2">Price: High → Low</option>
              <option value="stock" className="bg-surface text-foreground font-medium py-2">Lowest Stock</option>
              <option value="name" className="bg-surface text-foreground font-medium py-2">Name: A → Z</option>
            </select>
          </div>
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
          <div className="flex flex-col items-center gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 min-h-[400px] w-full">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {visibleCount < filteredProducts.length && (
              <button
                onClick={() => setVisibleCount((prev: number) => prev + 12)}
                className="px-8 py-3 bg-surface hover:bg-surface-hover border border-border/50 rounded-full text-foreground/80 font-medium text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm"
              >
                Load More Products <ArrowUpDown className="w-4 h-4 opacity-70" />
              </button>
            )}
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
            
            {/* Flowing Marquee Reviews */}
            <div className="relative overflow-hidden">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
              
              <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
                {/* Duplicate reviews for seamless loop */}
                {[...recentReviews, ...recentReviews].map((review, idx) => (
                  <div 
                      key={`${review.id}-${idx}`}
                      className="bg-background p-6 rounded-2xl border border-border/50 shadow-xl flex flex-col justify-between w-[340px] shrink-0"
                  >
                      <div>
                          <div className="flex text-yellow-500 mb-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                              ))}
                          </div>
                          <p className="text-gray-300 mb-4 leading-relaxed italic text-sm line-clamp-3">"{review.comment || 'No comment provided.'}"</p>
                      </div>
                      <div className="flex items-center gap-3 border-t border-border/50 pt-3 mt-auto">
                          {review.user?.picture ? (
                              <img src={review.user.picture} alt="User Avatar" loading="lazy" className="w-8 h-8 rounded-full object-cover shadow-lg border border-border/50" />
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center font-bold text-gray-400 text-sm shadow-lg border border-border/50">
                                  {(review.user?.full_name || review.user?.email || 'A')[0].toUpperCase()}
                              </div>
                          )}
                          <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-xs line-clamp-1">{review.user?.full_name || review.user?.email?.split('@')[0] || 'Anonymous'}</p>
                              <p className="text-[10px] text-primary font-medium tracking-wide">Verified Customer</p>
                          </div>
                          {review.product?.image_url && (
                             <img src={review.product.image_url} alt={review.product.name} loading="lazy" className="w-10 h-10 rounded-lg object-cover ml-auto border border-border/30 shadow-md" title={`Purchased ${review.product.name}`} />
                          )}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
         </section>
      )}
    </div>
  )
}

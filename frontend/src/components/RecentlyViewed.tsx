import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import type { Product } from '../types'

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 8

export function trackProductView(product: Product) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    let items: Product[] = stored ? JSON.parse(stored) : []
    // Remove if already exists
    items = items.filter(p => p.id !== product.id)
    // Add to front
    items.unshift(product)
    // Keep max items
    items = items.slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setProducts(JSON.parse(stored))
    } catch {}
  }, [])

  if (products.length === 0) return null

  return (
    <section className="w-full max-w-[1920px] px-4 md:px-8 mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-foreground/40" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recently Viewed</h2>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group flex-shrink-0 w-[200px] bg-surface border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[4/3] bg-surface-hover overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/10 text-4xl font-black">
                  {product.name[0]}
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-semibold text-primary">{product.price} EGP</span>
                <ChevronRight className="w-3 h-3 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

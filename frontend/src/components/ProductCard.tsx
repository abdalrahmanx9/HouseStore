import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { ShoppingBag, Zap, Tag } from 'lucide-react'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  
  return (
    <Card className="group relative overflow-hidden flex flex-col h-full rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-border/40 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)]">
      
      {/* Background Anime-style Accent Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-surface-hover overflow-hidden m-2 rounded-[2rem]">
        {/* Placeholder image that scales on parent hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-hover via-background to-border/20 transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out">
           <span className="text-border-subtle font-display font-bold tracking-widest uppercase text-xs opacity-50">Image</span>
        </div>
        
        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
           <Badge variant="secondary" className="backdrop-blur-md bg-background/80 border-border/50 shadow-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
             <Tag className="w-3 h-3 mr-1.5" />
             {product.category}
           </Badge>
           {product.subcategory && (
             <Badge variant="outline" className="backdrop-blur-md bg-background/50 border-border/30 px-3 py-0.5 rounded-full text-[10px] text-gray-400">
               {product.subcategory}
             </Badge>
           )}
        </div>
        <div className="absolute top-4 right-4 z-10">
            {product.is_active ? (
               <Badge variant="default" className="shadow-lg shadow-primary/20 bg-primary/90 hover:bg-primary text-white px-3 py-1 rounded-full text-xs">Available</Badge>
            ) : (
               <Badge variant="destructive" className="shadow-lg shadow-red-500/20 px-3 py-1 rounded-full text-xs">Sold Out</Badge>
            )}
        </div>
      </div>
      
      {/* Content Area */}
      <CardContent className="p-6 flex-grow flex flex-col">
        <Link to={`/products/${product.id}`} className="mt-2 block group/link">
          <h3 className="text-xl md:text-2xl font-bold font-sans text-foreground group-hover/link:text-primary transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Delivery Type Metadata Pill */}
        {product.delivery_type && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-surface/50 w-fit px-2.5 py-1 rounded-md border border-border/30">
            <Zap className="w-3 h-3 text-yellow-500" />
            {product.delivery_type === 'auto' ? 'Instant Delivery' : 'Manual Delivery'}
          </div>
        )}

        <div className="mt-auto pt-6 flex flex-col gap-1">
            <span className="text-sm text-gray-500 font-medium">Starting at</span>
            <span className="text-3xl font-black tracking-tighter text-foreground font-display">
              {product.price} EGP
            </span>
        </div>
      </CardContent>
      
      {/* Footer / Actions */}
      <CardFooter className="p-6 pt-0">
        <Button 
            className="w-full gap-2 font-bold shadow-lg shadow-primary/20 rounded-full h-12 text-sm uppercase tracking-wide transition-transform hover:scale-[1.02] active:scale-95"
            disabled={!product.is_active}
            onClick={() => addToCart(product)}
            variant={product.is_active ? "default" : "secondary"}
        >
            <ShoppingBag className="w-5 h-5" />
            {product.is_active ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  )
}

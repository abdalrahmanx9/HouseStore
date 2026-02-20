import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { ShoppingBag, Zap, Tag, Gamepad2, Laptop, MessageCircle, Cpu, GraduationCap, Package, Check, Scale } from 'lucide-react'
import type { Product } from '../types'
import { useState } from 'react'
import { useComparison } from '../context/ComparisonContext'

const CATEGORY_STYLES: Record<string, { gradient: string, Icon: React.ElementType }> = {
  'games':        { gradient: 'from-violet-600/30 via-purple-500/20 to-fuchsia-500/10', Icon: Gamepad2 },
  'software':     { gradient: 'from-blue-600/30 via-cyan-500/20 to-teal-500/10',       Icon: Laptop },
  'social media': { gradient: 'from-pink-600/30 via-rose-500/20 to-orange-500/10',      Icon: MessageCircle },
  'system':       { gradient: 'from-emerald-600/30 via-green-500/20 to-lime-500/10',    Icon: Cpu },
  'education':    { gradient: 'from-amber-600/30 via-yellow-500/20 to-orange-500/10',   Icon: GraduationCap },
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category.toLowerCase()] || { gradient: 'from-indigo-600/30 via-blue-500/20 to-sky-500/10', Icon: Package }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToCompare } = useComparison()
  const [justAdded, setJustAdded] = useState(false)
  
  const handleAddToCart = () => {
    addToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const { gradient, Icon: CategoryIcon } = getCategoryStyle(product.category)

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-border/40 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)]">
      
      {/* Background Anime-style Accent Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-surface-hover overflow-hidden m-2 rounded-[2rem]">
        {/* Product Image */}
        {product.image_url ? (
            <img 
                src={product.image_url} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
        ) : (
            <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} transform group-hover:scale-110 transition-transform duration-700 ease-out`}>
               <CategoryIcon className="w-16 h-16 text-foreground/15" strokeWidth={1.5} />
            </div>
        )}
        
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
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
            {product.stock_count > 0 && product.stock_count <= 5 && (
               <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white shadow-lg uppercase tracking-wider">
                 🔥 Low Stock
               </span>
            )}
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
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
            variant="outline"
            className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow hover:bg-surface-hover hover:border-border"
            onClick={(e) => { 
               e.preventDefault()
               e.stopPropagation()
               addToCompare(product) 
            }}
            title="Compare Product"
        >
            <Scale className="w-5 h-5 text-foreground/70" />
        </Button>
        <Button 
            className={`flex-1 gap-2 font-bold shadow-lg rounded-full h-12 text-sm uppercase tracking-wide transition-all hover:scale-[1.02] active:scale-95 ${
              justAdded 
                ? 'bg-success hover:bg-success text-white shadow-success/20' 
                : 'shadow-primary/20'
            }`}
            disabled={!product.is_active}
            onClick={handleAddToCart}
            variant={product.is_active ? (justAdded ? undefined : "default") : "secondary"}
        >
            {justAdded ? (
              <><Check className="w-5 h-5" /> Added!</>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> {product.is_active ? 'Add to Cart' : 'Unavailable'}</>
            )}
        </Button>
      </CardFooter>
    </Card>
  )
}

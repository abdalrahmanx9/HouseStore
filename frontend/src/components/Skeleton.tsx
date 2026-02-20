import { motion } from 'framer-motion'

// Skeleton base shimmer animation
function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-hover rounded-xl ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
    </div>
  )
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <Shimmer className="h-48 rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Shimmer className="h-6 w-24" />
          <Shimmer className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Product grid skeleton (shows N cards)
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Table row skeleton for admin tables
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Shimmer className={`h-4 ${i === 0 ? 'w-12' : i === cols - 1 ? 'w-20' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  )
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number, cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  )
}

// Generic content skeleton
export function ContentSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Shimmer className="h-8 w-48" />
      <Shimmer className="h-4 w-full max-w-md" />
      <Shimmer className="h-4 w-full max-w-sm" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Shimmer className="h-32" />
        <Shimmer className="h-32" />
        <Shimmer className="h-32" />
      </div>
    </div>
  )
}

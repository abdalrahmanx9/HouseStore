import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Product } from '../types'

interface ComparisonContextType {
  compareItems: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: number) => void
  clearCompare: () => void
  isCompareModalOpen: boolean
  setCompareModalOpen: (isOpen: boolean) => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([])
  const [isCompareModalOpen, setCompareModalOpen] = useState(false)

  const addToCompare = (product: Product) => {
    setCompareItems((prev) => {
      // Don't add if already exists
      if (prev.some(p => p.id === product.id)) return prev
      // Max 4 items to compare
      const newItems = [...prev, product]
      if (newItems.length > 4) newItems.shift()
      return newItems
    })
    setCompareModalOpen(true)
  }

  const removeFromCompare = (productId: number) => {
    setCompareItems((prev) => prev.filter(p => p.id !== productId))
  }

  const clearCompare = () => {
    setCompareItems([])
    setCompareModalOpen(false)
  }

  return (
    <ComparisonContext.Provider 
      value={{ 
        compareItems, 
        addToCompare, 
        removeFromCompare, 
        clearCompare,
        isCompareModalOpen,
        setCompareModalOpen
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}

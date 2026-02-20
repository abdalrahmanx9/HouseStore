import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Package, ArrowRight } from 'lucide-react'
import axios, { type CancelTokenSource } from 'axios'
import type { Product } from '../types'

// ---------------------------------------------------------------------------
// Hook: global Ctrl+K / Cmd+K listener that any component can use to
// read or control the search modal state.
// ---------------------------------------------------------------------------

let globalOpen: () => void = () => {}
let globalClose: () => void = () => {}

export function useSearchShortcut() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Expose to the module-level helpers so SearchCommand can drive the state
  useEffect(() => {
    globalOpen = open
    globalClose = close
  }, [open, close])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, open, close }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchCommand() {
  const { isOpen, close } = useSearchShortcut()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<CancelTokenSource | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens / closes
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      setActiveIndex(-1)
      // Small delay so the DOM is ready before we focus
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return

    if (query.trim().length === 0) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setActiveIndex(-1)

    const timer = setTimeout(() => {
      // Cancel any in-flight request
      cancelRef.current?.cancel()
      const source = axios.CancelToken.source()
      cancelRef.current = source

      axios
        .get<Product[]>('/api/v1/products/search', {
          params: { q: query.trim(), per_page: 8 },
          cancelToken: source.token,
        })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data as any).items ?? []
          setResults(data)
          setHasSearched(true)
          setIsLoading(false)
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            setResults([])
            setHasSearched(true)
            setIsLoading(false)
          }
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      cancelRef.current?.cancel()
    }
  }, [query, isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  // Arrow-key navigation within the result list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault()
      navigateToProduct(results[activeIndex].id)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function navigateToProduct(id: number) {
    close()
    navigate(`/products/${id}`)
  }

  // ----- Render -----

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0 z-[100] flex justify-center pt-[10vh] px-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-surface border border-border/50 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[70vh]">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 border-b border-border/50">
                <Search className="w-5 h-5 text-foreground/40 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search House Store products..."
                  className="flex-1 h-14 bg-transparent text-foreground placeholder:text-foreground/30 text-base outline-none"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[10px] font-mono font-semibold bg-background border border-border/50 rounded-md text-foreground/40">
                    ESC
                  </kbd>
                  <button
                    onClick={close}
                    className="p-1.5 rounded-full hover:bg-surface-hover text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Results area */}
              <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
                {/* Loading skeletons */}
                {isLoading && (
                  <div className="p-2 space-y-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse"
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface-hover shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/5 bg-surface-hover rounded-md" />
                          <div className="h-3 w-2/5 bg-surface-hover rounded-md" />
                        </div>
                        <div className="h-4 w-16 bg-surface-hover rounded-md shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && hasSearched && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-4 border border-border/50">
                      <Package className="w-6 h-6 text-foreground/20" />
                    </div>
                    <p className="text-sm font-medium text-foreground/60">No results found</p>
                    <p className="text-xs text-foreground/30 mt-1 max-w-xs">
                      Try a different search term or check your spelling.
                    </p>
                  </div>
                )}

                {/* Results list */}
                {!isLoading && results.length > 0 && (
                  <div className="p-2">
                    <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-foreground/30">
                      Products
                    </p>
                    {results.map((product, index) => (
                      <button
                        key={product.id}
                        onClick={() => navigateToProduct(product.id)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors group ${
                          activeIndex === index
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-surface-hover'
                        }`}
                      >
                        {/* Icon / thumbnail */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                            activeIndex === index
                              ? 'bg-primary/20 border-primary/30'
                              : 'bg-surface-hover border-border/50'
                          }`}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Package
                              className={`w-4 h-4 ${
                                activeIndex === index ? 'text-primary' : 'text-foreground/30'
                              }`}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-foreground/40 capitalize">
                              {product.category}
                            </span>
                            <span className="text-foreground/20">·</span>
                            {product.stock_count > 0 ? (
                              <span className="text-xs text-emerald-500 font-medium">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price + arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-sm font-bold tabular-nums ${
                              activeIndex === index ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {product.price} EGP
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              activeIndex === index
                                ? 'text-primary translate-x-0'
                                : 'text-foreground/20 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Idle state hint */}
                {!isLoading && !hasSearched && query.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <Search className="w-8 h-8 text-foreground/10 mb-3" />
                    <p className="text-sm text-foreground/30">
                      Start typing to search products...
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/50 text-[11px] text-foreground/30">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono bg-background border border-border/50 rounded text-foreground/40">
                      ↑
                    </kbd>
                    <kbd className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono bg-background border border-border/50 rounded text-foreground/40">
                      ↓
                    </kbd>
                    <span className="ml-0.5">navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-mono bg-background border border-border/50 rounded text-foreground/40">
                      ↵
                    </kbd>
                    <span className="ml-0.5">open</span>
                  </span>
                </div>
                <span>House Store</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

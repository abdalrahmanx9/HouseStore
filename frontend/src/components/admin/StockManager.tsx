import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface StockManagerProps {
  productId: number
  productName: string
  deliveryType?: string
}

interface StockItem {
  id: number
  content: string
  added_at: string
  is_sold: boolean
}

export default function StockManager({ productId, productName, deliveryType = 'manual' }: StockManagerProps) {
  const queryClient = useQueryClient()
  const [includeSold, setIncludeSold] = useState(false)
  const [newStock, setNewStock] = useState('')
  const [manualCount, setManualCount] = useState<number | ''>('')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // ── Fetch stock items ──────────────────────────────────────────────
  const { data: stockItems = [], isLoading, isError } = useQuery<StockItem[]>({
    queryKey: ['stock', productId, includeSold],
    queryFn: async () => {
      const res = await axios.get(
        `/api/v1/products/${productId}/stock?include_sold=${includeSold}`
      )
      return res.data
    },
  })

  // ── Add stock mutation ─────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (items: string[]) => {
      await axios.post(`/api/v1/products/${productId}/stock`, items)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock', productId] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`Added ${variables.length} stock item${variables.length > 1 ? 's' : ''}`)
      setNewStock('')
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Failed to add stock')
    },
  })

  // ── Delete stock mutation ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await axios.delete(`/api/v1/products/stock/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', productId] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock item deleted')
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Failed to delete stock item')
    },
  })

  // ── Derived counts ────────────────────────────────────────────────
  const availableCount = stockItems.filter((i) => !i.is_sold).length
  const soldCount = stockItems.filter((i) => i.is_sold).length

  // ── Handlers ──────────────────────────────────────────────────────
  const handleBulkAdd = () => {
    if (deliveryType === 'manual') {
      if (!manualCount || typeof manualCount !== 'number' || manualCount <= 0) {
        toast.error('Enter a valid amount to add')
        return
      }
      // Generate dummy items for manual count
      const items = Array.from({ length: manualCount }).map(() => `Manual-Stock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
      addMutation.mutate(items)
      setManualCount('')
      return
    }

    const items = newStock
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (items.length === 0) {
      toast.error('Enter at least one item')
      return
    }
    addMutation.mutate(items)
  }

  const handleDelete = (itemId: number) => {
    toast('Delete this stock item?', {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(itemId),
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 8000,
    })
  }

  const handleCopy = async (itemId: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(itemId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  // ── Loading / error states ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8 text-center text-foreground/50">
        Loading stock...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-danger">
        Error loading stock
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Stock &mdash; {productName}
          </h2>
        </div>

        {/* Sold toggle */}
        <button
          onClick={() => setIncludeSold((v) => !v)}
          className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
        >
          {includeSold ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {includeSold ? 'Hide sold' : 'Show sold'}
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
          {availableCount} available
        </span>
        {includeSold && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-red-500/15 text-red-400 border-red-500/30">
            {soldCount} sold
          </span>
        )}
      </div>

      {/* Add stock form */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        {deliveryType === 'manual' ? (
          <>
            <label htmlFor="manual-stock" className="text-sm font-semibold text-foreground">
              Add Stock Quantity
            </label>
            <input
              id="manual-stock"
              type="number"
              min="1"
              value={manualCount}
              onChange={(e) => setManualCount(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="e.g. 50"
              className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={handleBulkAdd}
                disabled={addMutation.isPending || !manualCount || manualCount <= 0}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {addMutation.isPending ? 'Adding...' : 'Add Stock Quantity'}
              </button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="new-stock" className="text-sm font-semibold text-foreground">
              Add Stock (one digital key/item per line)
            </label>
            <textarea
              id="new-stock"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              rows={5}
              placeholder={"XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY"}
              className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y font-mono"
            />
            <div className="flex items-center justify-between gap-3 mt-2">
              <span className="text-xs text-foreground/40">
                {newStock.split('\n').filter((l) => l.trim()).length} item(s) to add
              </span>
              <button
                onClick={handleBulkAdd}
                disabled={addMutation.isPending || !newStock.trim()}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {addMutation.isPending ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stock list */}
      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {stockItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-foreground/40">
            No stock items{!includeSold ? ' (try showing sold items)' : ''}
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            <AnimatePresence initial={false}>
              {stockItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 hover:bg-surface-hover/50 transition-colors">
                    {/* Content */}
                    <span className="flex-1 min-w-0 font-mono text-sm text-foreground truncate">
                      {item.content}
                    </span>

                    {/* Meta */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-foreground/40 whitespace-nowrap">
                        {new Date(item.added_at).toLocaleDateString()}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          item.is_sold
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.is_sold ? 'Sold' : 'Available'}
                      </span>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="text-foreground/50 hover:text-foreground transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete (unsold only) */}
                      {!item.is_sold && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          className="text-danger hover:text-red-300 transition-colors disabled:opacity-50"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}

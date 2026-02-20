import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Trash, Check, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  id: number
  code: string
  discount_percent: number
  max_discount_amount: number | null
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

export default function AdminCoupons() {
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/coupons/')
      return res.data as Coupon[]
    }
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number, is_active: boolean }) => {
      await axios.put(`/api/v1/coupons/${id}`, { is_active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon status updated')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/v1/coupons/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted')
    }
  })

  const handleDelete = (id: number) => {
    toast('Delete this coupon permanently?', {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id)
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 8000,
    })
  }

  if (isLoading) return <div className="p-8 text-center text-foreground/50">Loading coupons...</div>

  return (
    <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Active Coupons
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {isCreating && (
          <CreateCouponForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/50">
          <thead className="bg-surface-hover">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-foreground">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {coupon.discount_percent}%
                    {coupon.max_discount_amount && <span className="text-xs text-foreground/50 block">(Max: {coupon.max_discount_amount} EGP)</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    {coupon.used_count} / {coupon.max_uses ?? '∞'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                        coupon.is_active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                    }`}
                  >
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-danger hover:text-red-300 transition-colors"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground/40">
                        No coupons found. Create one to get started!
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CreateCouponForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const [code, setCode] = useState('')
    const [discount, setDiscount] = useState(10)
    const [maxDiscount, setMaxDiscount] = useState<string>('')
    const [maxUses, setMaxUses] = useState<string>('')
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async () => {
            await axios.post('/api/v1/coupons/', {
                code: code.toUpperCase(),
                discount_percent: Number(discount),
                max_discount_amount: maxDiscount ? Number(maxDiscount) : null,
                max_uses: maxUses ? Number(maxUses) : null,
                is_active: true
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
            toast.success('Coupon created successfully')
            onSuccess()
        },
        onError: () => {
            toast.error('Failed to create coupon')
        }
    })

    const inputClass = "w-full p-2.5 border border-border/50 rounded-xl bg-background text-foreground text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-foreground/40"

    return (
        <div className="bg-surface-hover/50 p-6 border-b border-border/50">
            <h3 className="font-semibold mb-4 text-foreground">New Coupon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Code</label>
                    <input
                        className={`${inputClass} uppercase`}
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="SUMMER2026"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Discount (%)</label>
                    <input
                        type="number"
                        className={inputClass}
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        min="1" max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Max Discount EGP (Optional)</label>
                     <input
                        type="number"
                        className={inputClass}
                        value={maxDiscount}
                        onChange={e => setMaxDiscount(e.target.value)}
                        placeholder="e.g. 50"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Max Uses (Optional)</label>
                    <input
                        type="number"
                        className={inputClass}
                        value={maxUses}
                        onChange={e => setMaxUses(e.target.value)}
                        placeholder="Unlimited"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-4 py-2 text-foreground/70 hover:bg-surface-hover rounded-xl transition-colors text-sm">Cancel</button>
                <button
                    onClick={() => mutation.mutate()}
                    disabled={!code || mutation.isPending}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    {mutation.isPending ? 'Saving...' : <><Check className="w-4 h-4" /> Save Coupon</>}
                </button>
            </div>
        </div>
    )
}

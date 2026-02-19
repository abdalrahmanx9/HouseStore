import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Trash, Check, X, Tag } from 'lucide-react'

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

  // Fetch Coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/coupons/')
      return res.data as Coupon[]
    }
  })

  // Toggle Active Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number, is_active: boolean }) => {
      await axios.put(`/api/v1/coupons/${id}`, { is_active })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/v1/coupons/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  })

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Active Coupons
        </h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </button>
      </div>

      {isCreating && (
          <CreateCouponForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {coupons?.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {coupon.discount_percent}% 
                    {coupon.max_discount_amount && <span className="text-xs text-gray-400 block">(Max: EGP {coupon.max_discount_amount})</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {coupon.used_count} / {coupon.max_uses ?? '∞'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => { if(confirm('Delete this coupon?')) deleteMutation.mutate(coupon.id) }}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
            onSuccess()
        }
    })

    return (
        <div className="bg-gray-50 dark:bg-gray-750 p-6 border-b dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-semibold mb-4 dark:text-white">New Coupon</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                    <input 
                        className="w-full p-2 border rounded uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="SUMMER2026"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
                    <input 
                        type="number"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={discount}
                        onChange={e => setDiscount(Number(e.target.value))}
                        min="1" max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Discount $ (Optional)</label>
                     <input 
                        type="number"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={maxDiscount}
                        onChange={e => setMaxDiscount(e.target.value)}
                        placeholder="e.g. 50"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (Optional)</label>
                    <input 
                        type="number"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={maxUses}
                        onChange={e => setMaxUses(e.target.value)}
                        placeholder="Unlimited"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button 
                    onClick={() => mutation.mutate()}
                    disabled={!code || mutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {mutation.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Save Coupon</>}
                </button>
            </div>
        </div>
    )
}

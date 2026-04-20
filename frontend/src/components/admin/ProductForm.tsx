import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Product {
  id?: number
  name: string
  description?: string
  price: number
  category: string
  image_url?: string
  delivery_type?: "manual" | "auto"
  is_active: boolean
}

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    delivery_type: 'manual',
    is_active: true
  })

   
  useEffect(() => {
    if (product) {
        setFormData({
            ...product,
            description: product.description || '',
            image_url: product.image_url || ''
        })
    }
  }, [product])

  const mutation = useMutation({
    mutationFn: async (data: Product) => {
        let productId = product?.id
        if (productId) {
            await axios.put(`/api/v1/products/${productId}`, data)
        } else {
            const res = await axios.post('/api/v1/products/', data)
            productId = res.data.id
        }

        if (imageFile && productId) {
            const uploadData = new FormData()
            uploadData.append('file', imageFile)
            await axios.post(`/api/v1/products/${productId}/image`, uploadData, {
                withCredentials: true
            })
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(product ? 'Product updated' : 'Product created')
        onClose()
    },
    onError: () => {
        toast.error('Failed to save product')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const inputClass = "mt-1 block w-full rounded-xl border border-border/50 bg-background text-foreground p-2.5 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-foreground/40"

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-surface border border-border/50 rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-5 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-hover text-foreground/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-foreground/70">Name</label>
                <input
                    type="text"
                    required
                    className={inputClass}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground/70">Price (EGP)</label>
                <input
                    type="number"
                    step="0.01"
                    required
                    className={inputClass}
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70">Category</label>
            <input
                type="text"
                required
                className={inputClass}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70">Description</label>
            <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/70">Product Image</label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              <span className="font-medium text-foreground/40 whitespace-nowrap text-sm">OR URL:</span>
              <input
                  type="url"
                  className={inputClass}
                  value={formData.image_url || ''}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!imageFile}
              />
            </div>
            {formData.image_url && !imageFile && (
                <p className="text-xs text-success">Using existing image URL.</p>
            )}
            {imageFile && (
                <p className="text-xs text-primary">Will upload file: {imageFile.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-foreground/70">Delivery Type</label>
                <select
                    className={inputClass}
                    value={formData.delivery_type}
                    onChange={e => setFormData({...formData, delivery_type: e.target.value as "manual" | "auto"})}
                >
                    <option value="manual">Manual (Admin sends info)</option>
                    <option value="auto">Automatic (Instant)</option>
                </select>
            </div>

            <div className="flex items-center mt-6">
                <input
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                />
                <label className="ml-2 block text-sm text-foreground/70">
                    Active (Visible in Store)
                </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border/50">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-hover rounded-xl transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={mutation.isPending}
                className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50"
            >
                {mutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}

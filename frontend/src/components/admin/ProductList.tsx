import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ProductForm from './ProductForm'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock_count: number
  is_active: boolean
  image_url?: string
  delivery_type?: 'manual' | 'auto'
  description?: string
  features?: string[]
}

export default function ProductList() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/products/')
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
        await axios.delete(`/api/v1/products/${id}`)
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success('Product deleted')
    },
    onError: () => {
        toast.error('Failed to delete product')
    }
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    toast('Delete this product permanently?', {
      action: {
        label: 'Delete',
        onClick: () => deleteMutation.mutate(id)
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 8000,
    })
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  if (isLoading) return <div className="p-8 text-center text-foreground/50">Loading products...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Products</h2>
        <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
        </button>
      </div>

      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border/50">
          <thead className="bg-surface-hover">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products?.map((product: Product) => (
              <tr key={product.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded-lg" />
                    ) : (
                        <div className="h-10 w-10 bg-surface-hover rounded-lg flex items-center justify-center text-xs text-foreground/40">—</div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-bold">{product.price} EGP</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      product.stock_count > 0
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}>
                        {product.stock_count}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      product.is_active
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                    }`}>
                      {product.is_active ? 'Yes' : 'No'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(product)} className="text-primary hover:text-primary-hover transition-colors" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-danger hover:text-red-300 transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-foreground/40">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <ProductForm
            product={editingProduct}
            onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

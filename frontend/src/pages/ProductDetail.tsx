import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock_count: number
  description?: string
  subcategory?: string
  delivery_type?: string
  is_active?: boolean
}

const fetchProduct = async (id: string): Promise<Product> => {
  const response = await axios.get(`/api/v1/products/${id}`)
  return response.data
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-500 animate-pulse">Loading product details...</p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-500 mb-4">Product not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          <div className="flex items-center justify-center">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2 bg-gray-200 h-64 md:h-auto flex items-center justify-center">
             <span className="text-gray-400 text-lg">Product Image Placeholder</span>
          </div>
          
          {/* Content Section */}
          <div className="p-8 md:w-1/2">
            <div className="flex justify-between items-start">
                <div>
                     <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        {product.category} {product.subcategory && `> ${product.subcategory}`}
                     </span>
                     <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-2">{product.name}</h1>
                </div>
                {product.stock_count > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="w-4 h-4 mr-1" /> In Stock
                    </span>
                ) : (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <X className="w-4 h-4 mr-1" /> Out of Stock
                    </span>
                )}
            </div>

            <p className="text-4xl font-bold text-gray-900 mt-4 mb-6">${product.price}</p>
            
            <div className="prose max-w-none text-gray-600 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p>{product.description || 'No description available.'}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <span className="text-gray-500 text-sm">Delivery Type</span>
                        <p className="font-medium capitalize">{product.delivery_type || 'Instant'}</p>
                     </div>
                     <div>
                        <span className="text-gray-500 text-sm">Stock</span>
                        <p className="font-medium">{product.stock_count} units</p>
                     </div>
                </div>

                <button 
                    className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg cursor-pointer"
                    disabled={product.stock_count === 0}
                    onClick={() => addToCart(product)}
                >
                    {product.stock_count > 0 ? 'Add to Cart' : 'Unavailable'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

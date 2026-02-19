import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

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

const fetchProducts = async (): Promise<Product[]> => {
  // Use relative URL to leverage proxy if setup, or absolute for now
  // In production we should use env var
  const response = await axios.get('/api/v1/products/')
  return response.data
}

export default function ProductList() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-500">Loading products...</p>
      </div>
    )
  }

  if (isError) {
    return (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-red-500">Error loading products.</p>
        </div>
      )
  }

  if (!products || products.length === 0) {
    return (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-500">No products found.</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

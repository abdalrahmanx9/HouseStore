import { Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock_count: number
}

interface ProductCardProps {
  product: Product
}

import { useCart } from '../context/CartContext'

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">Image Placeholder</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {product.category}
          </span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            product.stock_count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.stock_count > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            <Link to={`/products/${product.id}`} className="hover:text-blue-600">
                {product.name}
            </Link>
        </h3>
        <p className="text-xl font-bold text-gray-900">EGP {product.price}</p>
        <button 
            className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={product.stock_count === 0}
            onClick={() => addToCart(product)}
        >
            Add to Cart
        </button>
      </div>
    </div>
  )
}

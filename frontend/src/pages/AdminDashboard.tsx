import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ShoppingBag, Package } from 'lucide-react'
import ProductList from '../components/admin/ProductList'

// ... Order Interface ...
interface Order {
  id: number
  product_name: string
  amount: number
  status: string
  payment_method: string
  payment_proof_url: string
  created_at: string
}

const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders')

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
    enabled: activeTab === 'orders'
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b dark:border-gray-700">
        <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'orders' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <ShoppingBag className="w-5 h-5 mr-2" />
            <span className="font-medium">Orders</span>
        </button>
        <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'products' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <Package className="w-5 h-5 mr-2" />
            <span className="font-medium">Products</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <ProductList />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
            <div className="p-8 text-center dark:text-gray-300">Loading Orders...</div>
        ) : isError ? (
            <div className="p-8 text-center text-red-500">Error loading orders</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proof</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders?.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">${order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{order.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                      {order.payment_proof_url ? (
                          <a href={`http://localhost:8000/${order.payment_proof_url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              View Proof
                          </a>
                      ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      )}
    </div>
  )
}

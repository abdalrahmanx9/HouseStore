import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Order {
  id: number
  product_name: string
  amount: number
  status: string
  payment_method: string
  payment_proof_url: string
  created_at: string
}

const fetchMyOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

export default function UserDashboard() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
         <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Dashboard</h1>
         <p className="text-red-500">Failed to load orders. Please try linking to google or logging in again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Orders</h1>

      {orders?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders?.map((order) => (
              <li key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{order.product_name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                        <span>Order #{order.id}</span>
                        <span>${order.amount.toFixed(2)}</span>
                        <span>{order.payment_method}</span>
                    </div>
                  </div>
                  <div>
                    {order.status === 'completed' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-2" /> Completed
                        </span>
                    ) : order.status === 'rejected' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                             <XCircle className="w-4 h-4 mr-2" /> Rejected
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-4 h-4 mr-2" /> Pending
                        </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

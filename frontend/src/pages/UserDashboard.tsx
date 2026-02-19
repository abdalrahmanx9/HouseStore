import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle, MessageSquare, X } from 'lucide-react'
import OrderChat from '../components/OrderChat'

interface Order {
  id: number
  product_name: string
  amount: number
  status: string
  payment_method: string
  payment_proof_url: string
  created_at: string
  has_unread_messages: boolean
}

const fetchMyOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

export default function UserDashboard() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    refetchInterval: 10000 // Poll for new messages/updates
  })

  const handleCloseChat = () => {
    setSelectedOrderId(null)
    queryClient.invalidateQueries({ queryKey: ['my-orders'] }) // Refresh to clear unread status
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Orders</h1>
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
         <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Orders</h1>
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
              <li key={order.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${order.has_unread_messages ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        {order.product_name}
                        {order.has_unread_messages && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                New Message
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                        <span>Order #{order.id}</span>
                        <span>EGP {order.amount.toFixed(2)}</span>
                        <span>{order.payment_method}</span>
                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                    
                    <button 
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`flex items-center space-x-1 hover:underline ${order.has_unread_messages ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-blue-600 dark:text-blue-400'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                        {order.has_unread_messages && (
                             <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                        )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold dark:text-white">Order #{selectedOrderId} Chat</h3>
                    <button onClick={handleCloseChat} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <OrderChat orderId={selectedOrderId} />
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

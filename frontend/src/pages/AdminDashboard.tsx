import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ShoppingBag, Package, MessageSquare, X, Check, Ban, AlertCircle, MessageCircle, Tag } from 'lucide-react'
import ProductList from '../components/admin/ProductList'
import AdminCoupons from '../components/AdminCoupons'
import OrderChat from '../components/OrderChat'
import { useAuth } from '../context/AuthContext'

// ... Order Interface ...
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

// ... Ticket Interface ...
interface Ticket {
  id: number
  user_id: number
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  has_unread_messages: boolean
}

interface TicketMessage {
  id: number
  content: string
  is_admin: boolean
  created_at: string
  attachment_url?: string
}

const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await axios.get('/api/v1/tickets/')
  return response.data
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'tickets' | 'coupons'>('orders')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

  // Queries
  const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
    enabled: activeTab === 'orders' || true, // Keep fetching for counts/unread
    refetchInterval: 10000 // Poll for new orders/messages
  })

  const { data: tickets, isLoading: isLoadingTickets, isError: isErrorTickets } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: fetchTickets,
    enabled: activeTab === 'tickets' || true,
    refetchInterval: 10000
  })

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
        await axios.put(`/api/v1/orders/${id}`, { status })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    }
  })

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status, priority }: { id: number, status?: string, priority?: string }) => {
        await axios.put(`/api/v1/tickets/${id}`, { status, priority })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    }
  })

  const handleOrderStatusUpdate = (id: number, status: string) => {
    if (confirm(`Are you sure you want to mark this order as ${status}?`)) {
        updateOrderStatusMutation.mutate({ id, status })
    }
  }

  // Derived State (Unread Counts)
  const unreadOrdersCount = orders?.filter(o => o.has_unread_messages).length || 0
  const unreadTicketsCount = tickets?.filter(t => t.has_unread_messages).length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b dark:border-gray-700 overflow-x-auto">
        <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'orders' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <div className="relative">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {unreadOrdersCount > 0 && <span className="absolute -top-1 -right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <span className="font-medium">Orders</span>
        </button>
        <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'tickets' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <div className="relative">
                <MessageCircle className="w-5 h-5 mr-2" />
                {unreadTicketsCount > 0 && <span className="absolute -top-1 -right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <span className="font-medium">Support Tickets</span>
        </button>
        <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'products' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <span className="font-medium">Products</span>
        </button>
        <button 
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'coupons' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
        >
            <Tag className="w-5 h-5 mr-2" />
            <span className="font-medium">Coupons</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <ProductList />
      ) : activeTab === 'coupons' ? (
        <AdminCoupons />
      ) : activeTab === 'tickets' ? (
        // --- TICKETS TAB ---
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {isLoadingTickets ? (
                <div className="p-8 text-center dark:text-gray-300">Loading Tickets...</div>
            ) : isErrorTickets ? (
                <div className="p-8 text-center text-red-500">Error loading tickets</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {tickets?.map((ticket) => (
                                <tr key={ticket.id} className={ticket.has_unread_messages ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{ticket.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                        {ticket.subject}
                                        {ticket.has_unread_messages && (
                                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" title="Unread messages"></span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                            ticket.priority === 'low' ? 'bg-gray-100 text-gray-800' : 
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={ticket.status}
                                            onChange={(e) => updateTicketStatusMutation.mutate({ id: ticket.id, status: e.target.value })}
                                            className="text-xs border rounded p-1 bg-transparent dark:text-white dark:border-gray-600"
                                        >
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(ticket.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <button 
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            <span>Reply</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      ) : (
        // --- ORDERS TAB ---
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoadingOrders ? (
            <div className="p-8 text-center dark:text-gray-300">Loading Orders...</div>
        ) : isErrorOrders ? (
            <div className="p-8 text-center text-red-500">Error loading orders</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proof</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders?.map((order) => (
                <tr key={order.id} className={order.has_unread_messages ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">EGP {order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 relative ${
                                order.has_unread_messages ? 'animate-pulse font-bold' : ''
                            }`}
                            title="Chat with Customer"
                        >
                            <MessageSquare className="w-5 h-5" />
                            {order.has_unread_messages && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                            )}
                        </button>
                        
                        {order.status === 'pending' && (
                            <>
                                <button 
                                    onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    title="Approve Order"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleOrderStatusUpdate(order.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Reject Order"
                                >
                                    <Ban className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        </div>
      )}

      {/* Order Chat Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold dark:text-white">Order #{selectedOrderId} Chat</h3>
                    <button 
                        onClick={() => {
                            setSelectedOrderId(null)
                            queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) // Refresh to clear unread flag
                        }} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <OrderChat orderId={selectedOrderId} />
                </div>
            </div>
        </div>
      )}

      {/* Ticket Chat Modal (Reusing structure for now, ideally make generic modal) */}
      {selectedTicketId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold dark:text-white">Ticket #{selectedTicketId}</h3>
                    <button 
                        onClick={() => {
                            setSelectedTicketId(null)
                            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }) // Refresh to clear unread flag
                        }} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <AdminTicketChat ticketId={selectedTicketId} />
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

function AdminTicketChat({ ticketId }: { ticketId: number }) {
    // Reusing the SupportWidget TicketChat logic but for Admin
    // Since SupportWidget's TicketChat uses the same endpoint, it should work fine, 
    // BUT we need to ensure we can import it or duplicate it. 
    // For speed, let's duplicate the relevant part of TicketChat here or extract it.
    // I'll create a simple inline version.
    
    // ... [Copy of TicketChat logic adjusted for context if needed] ...
    // Actually, let's just make sure TicketChat is exported or create a new component.
    // Since SupportWidget had TicketChat inline, I'll redefine it here.
    
    const [newMessage, setNewMessage] = useState('')
    const { user } = useAuth() // Assuming we have user context
    const queryClient = useQueryClient()
    const messagesEndRef = useState<HTMLDivElement | null>(null)[1] // Placeholder ref
    
    const { data: messages, isLoading } = useQuery({
        queryKey: ['ticket-messages', ticketId],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/tickets/${ticketId}/messages`)
            return res.data as TicketMessage[]
        },
        refetchInterval: 3000
    })

    const mutation = useMutation({
        mutationFn: async (content: string) => {
            const formData = new FormData()
            formData.append('content', content)
            await axios.post(`/api/v1/tickets/${ticketId}/messages`, formData)
        },
        onSuccess: () => {
            setNewMessage('')
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
        }
    })
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return
        mutation.mutate(newMessage)
    }

    // Scroll effect omitted for brevity but recommended

    if (isLoading) return <div className="p-8 text-center">Loading chat...</div>

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages?.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                         {/* Admin is ME here, so simple flip: if is_admin -> ME (right), else -> USER (left) */}
                        <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                            msg.is_admin 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                            <div className="text-[10px] opacity-70 mb-1">{msg.is_admin ? 'You' : 'User'}</div>
                            <p>{msg.content}</p>
                            {msg.attachment_url && (
                                <a href={`http://localhost:8000/${msg.attachment_url}`} target="_blank" className="block mt-2">
                                    <img src={`http://localhost:8000/${msg.attachment_url}`} className="max-h-32 rounded border" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="p-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex space-x-2">
                <input 
                    className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 text-sm dark:bg-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Reply to user..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                    <MessageSquare className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}

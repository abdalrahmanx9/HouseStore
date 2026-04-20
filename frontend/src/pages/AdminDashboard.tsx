import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ShoppingBag, Package, MessageCircle, X, Check, Ban, MessageSquare, Tag, Star, Trash2, Users, Menu, Search, ChevronLeft, BarChart3, Boxes } from 'lucide-react'
import ProductList from '../components/admin/ProductList'
import AdminCoupons from '../components/AdminCoupons'
import OrderChat from '../components/OrderChat'
import UserList from '../components/admin/UserList'
import AnalyticsTab from '../components/admin/AnalyticsTab'
import StockManager from '../components/admin/StockManager'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ---------- Types ----------
interface Order {
  id: number
  product_name: string
  amount: number
  status: string
  payment_method: string
  payment_proof_url: string
  created_at: string
  has_unread_messages: boolean
  delivery_key?: string
}

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

interface User {
    email: string
    full_name?: string
}

interface Review {
    id: number
    product_id: number
    user_id: number
    user?: User
    rating: number
    comment: string
    is_verified_purchase: boolean
    is_approved: boolean
    created_at: string
}

interface AdminStats {
  total_revenue: number
  total_orders: number
  pending_orders: number
  completed_orders: number
  rejected_orders: number
  total_products: number
  active_products: number
  total_users: number
  open_tickets: number
  total_reviews: number
}

// ---------- Priority Badge (dark-mode safe) ----------
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  )
}

// ---------- Status Badge ----------
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    open: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    closed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  )
}

// ---------- Fetchers ----------
const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await axios.get('/api/v1/tickets/')
  return response.data
}

const fetchReviews = async (): Promise<Review[]> => {
    const response = await axios.get('/api/v1/reviews/')
    return response.data
}

const fetchStats = async (): Promise<AdminStats> => {
    const response = await axios.get('/api/v1/admin/stats')
    return response.data
}

// ---------- Main Dashboard ----------
export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'tickets' | 'coupons' | 'reviews' | 'users' | 'analytics' | 'stock'>('orders')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deliveryKeyModalOpen, setDeliveryKeyModalOpen] = useState(false)
  const [currentApprovalOrderId, setCurrentApprovalOrderId] = useState<number | null>(null)
  const [deliveryKeyInput, setDeliveryKeyInput] = useState('')
  const [selectedStockProductId, setSelectedStockProductId] = useState<number | null>(null)
  const [selectedStockProductName, setSelectedStockProductName] = useState('')
  const [selectedStockProductDelivery, setSelectedStockProductDelivery] = useState('')

  // Product list for stock tab product selector
  const { data: allProducts } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/products/')
      return res.data as { id: number; name: string; delivery_type?: string }[]
    },
    enabled: activeTab === 'stock',
  })

  // Queries
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  })

  const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
    refetchInterval: 10000
  })

  const { data: tickets, isLoading: isLoadingTickets, isError: isErrorTickets } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: fetchTickets,
    refetchInterval: 10000
  })

  const { data: reviews, isLoading: isLoadingReviews, isError: isErrorReviews } = useQuery({
      queryKey: ['admin-reviews'],
      queryFn: fetchReviews,
      enabled: activeTab === 'reviews'
  })

   
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('orderId')
    const ticketId = params.get('ticketId')
    
    if (orderId) {
       setActiveTab('orders')
       setSelectedOrderId(parseInt(orderId))
       window.history.replaceState({}, document.title, window.location.pathname)
    } else if (ticketId) {
       setActiveTab('tickets')
       setSelectedTicketId(parseInt(ticketId))
       window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Filtered & searched orders
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders
      .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
      .filter(o =>
        searchQuery === '' ||
        o.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `#${o.id}`.includes(searchQuery)
      )
  }, [orders, orderStatusFilter, searchQuery])

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status, delivery_key }: { id: number, status: string, delivery_key?: string }) => {
        await axios.put(`/api/v1/orders/${id}`, { status, delivery_key })
    },
    onSuccess: (_, { status }) => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        toast.success(`Order ${status === 'completed' ? 'approved' : 'rejected'} successfully`)
    },
    onError: () => {
        toast.error('Failed to update order status')
    }
  })

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status, priority }: { id: number, status?: string, priority?: string }) => {
        await axios.put(`/api/v1/tickets/${id}`, { status, priority })
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
        toast.success('Ticket updated')
    }
  })

  const deleteReviewMutation = useMutation({
      mutationFn: async (id: number) => {
          await axios.delete(`/api/v1/reviews/${id}`)
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
          toast.success('Review deleted')
      },
      onError: () => {
          toast.error('Failed to delete review')
      }
  })

  // Handlers
  const handleOrderStatusUpdate = (id: number, status: string) => {
    if (status === 'completed') {
      // Instead of prompt, open the custom modal
      setCurrentApprovalOrderId(id)
      setDeliveryKeyInput('')
      setDeliveryKeyModalOpen(true)
      return
    }

    toast(`Mark order #${id} as ${status}?`, {
      action: {
        label: 'Confirm',
        onClick: () => updateOrderStatusMutation.mutate({ id, status })
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 8000,
    })
  }

  const submitOrderApproval = () => {
    if (currentApprovalOrderId) {
      updateOrderStatusMutation.mutate({ 
        id: currentApprovalOrderId, 
        status: 'completed', 
        delivery_key: deliveryKeyInput.trim() || undefined 
      })
      setDeliveryKeyModalOpen(false)
      setCurrentApprovalOrderId(null)
    }
  }

  const handleDeleteReview = (id: number) => {
    toast('Delete this review permanently?', {
      action: {
        label: 'Delete',
        onClick: () => deleteReviewMutation.mutate(id)
      },
      cancel: { label: 'Cancel', onClick: () => {} },
      duration: 8000,
    })
  }

  // Derived State
  const unreadOrdersCount = orders?.filter(o => o.has_unread_messages).length || 0
  const unreadTicketsCount = tickets?.filter(t => t.has_unread_messages).length || 0

  const NAV_ITEMS = [
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag, badge: unreadOrdersCount },
    { id: 'tickets' as const, label: 'Support', icon: MessageCircle, badge: unreadTicketsCount },
    { id: 'products' as const, label: 'Products', icon: Package, badge: 0 },
    { id: 'stock' as const, label: 'Stock', icon: Boxes, badge: 0 },
    { id: 'coupons' as const, label: 'Coupons', icon: Tag, badge: 0 },
    { id: 'reviews' as const, label: 'Reviews', icon: Star, badge: 0 },
    { id: 'users' as const, label: 'Users', icon: Users, badge: 0 },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, badge: 0 },
  ]

  const ORDER_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-background pt-24">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-24 left-0 z-40 h-full lg:h-[calc(100vh-6rem)]
        bg-surface border-r border-border/50 flex flex-col shrink-0
        transition-all duration-300 ease-out
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0 overflow-hidden'}
      `}>
         <div className="p-4 border-b border-border/50 flex items-center justify-between min-w-[15rem] lg:min-w-0">
            {sidebarOpen && <h2 className="text-lg font-bold text-foreground">Admin Portal</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-hover text-foreground/70 transition-colors hidden lg:block"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
         </div>
         <nav className="flex-1 p-2 space-y-1 min-w-[15rem] lg:min-w-0">
            {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all font-medium ${
                      activeTab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-400 hover:bg-surface-hover hover:text-foreground'
                  }`}
                  title={item.label}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 shrink-0" />
                        {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {item.badge > 0 && sidebarOpen && (
                      <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                    )}
                    {item.badge > 0 && !sidebarOpen && (
                      <span className="absolute left-10 top-1 w-2 h-2 bg-danger rounded-full" />
                    )}
                </button>
            ))}
         </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-16 flex items-center px-4 md:px-8 shrink-0 gap-4 border-b border-border/50 bg-surface/50 backdrop-blur-sm">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-foreground/70"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-foreground capitalize tracking-tight">{activeTab}</h1>
          </header>

          <div className="flex-1 p-4 md:p-8 pt-4 overflow-y-auto space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                   {activeTab === 'products' ? (
                      <ProductList />
                   ) : activeTab === 'users' ? (
                      <UserList />
                   ) : activeTab === 'coupons' ? (
                      <AdminCoupons />
                   ) : activeTab === 'reviews' ? (
                      /* --- REVIEWS TAB --- */
                      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                          {isLoadingReviews ? (
                              <div className="p-8 text-center text-foreground">Loading Reviews...</div>
                          ) : isErrorReviews ? (
                              <div className="p-8 text-center text-danger">Error loading reviews</div>
                          ) : (
                              <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-border/50">
                                      <thead className="bg-surface-hover">
                                          <tr>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">ID</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Product ID</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">User</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Rating</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Comment</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Date</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/50">
                                          {reviews?.map((review) => (
                                              <tr key={review.id} className="hover:bg-surface-hover/50 transition-colors">
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">#{review.id}</td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{review.product_id}</td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                      <div className="flex flex-col">
                                                          <span>{review.user?.email || `User #${review.user_id}`}</span>
                                                          {review.is_verified_purchase && (
                                                              <span className="text-xs text-success flex items-center">
                                                                  <Check className="w-3 h-3 mr-1" /> Verified
                                                              </span>
                                                          )}
                                                      </div>
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                      <div className="flex text-yellow-400">
                                                          {[...Array(5)].map((_, i) => (
                                                              <Star
                                                                  key={i}
                                                                  className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`}
                                                              />
                                                          ))}
                                                      </div>
                                                  </td>
                                                  <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate" title={review.comment}>
                                                      {review.comment || '-'}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                                      {new Date(review.created_at).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                      <button
                                                          onClick={() => handleDeleteReview(review.id)}
                                                          className="text-danger hover:text-red-300 transition-colors"
                                                          title="Delete Review"
                                                      >
                                                          <Trash2 className="w-5 h-5" />
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {reviews?.length === 0 && (
                                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No reviews yet</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                   ) : activeTab === 'analytics' ? (
                      <AnalyticsTab />
                   ) : activeTab === 'stock' ? (
                      /* --- STOCK TAB --- */
                      <div className="space-y-6">
                        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-foreground mb-4">Select a Product</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {allProducts?.map(p => (
                              <button
                                key={p.id}
                                onClick={() => { 
                                  setSelectedStockProductId(p.id)
                                  setSelectedStockProductName(p.name)
                                  setSelectedStockProductDelivery(p.delivery_type || 'manual')
                                }}
                                className={`text-left p-4 rounded-xl border transition-all ${
                                  selectedStockProductId === p.id
                                    ? 'border-primary bg-primary/10 shadow-sm'
                                    : 'border-border/50 hover:border-primary/30 hover:bg-surface-hover'
                                }`}
                              >
                                <span className="font-medium text-foreground text-sm block truncate">{p.name}</span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {p.delivery_type === 'auto' ? 'Auto Delivery' : 'Manual Delivery'} &middot; ID #{p.id}
                                </span>
                              </button>
                            ))}
                            {!allProducts?.length && (
                              <p className="text-gray-500 col-span-full text-center py-8">No products found</p>
                            )}
                          </div>
                        </div>
                        {selectedStockProductId && (
                          <StockManager 
                            productId={selectedStockProductId} 
                            productName={selectedStockProductName} 
                            deliveryType={selectedStockProductDelivery} 
                          />
                        )}
                      </div>
                   ) : activeTab === 'tickets' ? (
                      /* --- TICKETS TAB --- */
                      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                          {isLoadingTickets ? (
                              <div className="p-8 text-center text-foreground">Loading Tickets...</div>
                          ) : isErrorTickets ? (
                              <div className="p-8 text-center text-danger">Error loading tickets</div>
                          ) : (
                              <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-border/50">
                                      <thead className="bg-surface-hover">
                                          <tr>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">ID</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Subject</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Priority</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Status</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Last Update</th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/50">
                                          {tickets?.map((ticket) => (
                                              <tr key={ticket.id} className={`hover:bg-surface-hover/50 transition-colors ${ticket.has_unread_messages ? 'bg-primary/5' : ''}`}>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">#{ticket.id}</td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground flex items-center gap-2">
                                                      {ticket.subject}
                                                      {ticket.has_unread_messages && (
                                                          <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unread messages" />
                                                      )}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                      <PriorityBadge priority={ticket.priority} />
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                      <select
                                                          value={ticket.status}
                                                          onChange={(e) => updateTicketStatusMutation.mutate({ id: ticket.id, status: e.target.value })}
                                                          className="text-xs border border-border/50 rounded-lg px-2 py-1 bg-surface text-foreground outline-none focus:ring-1 focus:ring-primary"
                                                      >
                                                          <option value="open">Open</option>
                                                          <option value="closed">Closed</option>
                                                      </select>
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                                      {new Date(ticket.updated_at).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                      <button
                                                          onClick={() => setSelectedTicketId(ticket.id)}
                                                          className="text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                                                      >
                                                          <MessageSquare className="w-5 h-5" />
                                                          <span>Reply</span>
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {tickets?.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No support tickets</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                   ) : (
                      /* --- ORDERS TAB --- */
                      <>
                        {/* Filters bar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex gap-1 bg-surface border border-border/50 rounded-xl p-1">
                            {ORDER_FILTERS.map(f => (
                              <button
                                key={f.value}
                                onClick={() => setOrderStatusFilter(f.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  orderStatusFilter === f.value
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-foreground/60 hover:text-foreground hover:bg-surface-hover'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                          <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <input
                              type="text"
                              placeholder="Search by product or order #..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-surface border border-border/50 rounded-xl text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <span className="text-xs text-foreground/50">{filteredOrders.length} orders</span>
                          <button
                            onClick={() => {
                              const csv = ['Order #,Product,Amount,Status,Payment,Date']
                                .concat(filteredOrders.map(o => `${o.id},"${o.product_name}",${o.amount},${o.status},${o.payment_method},${new Date(o.created_at).toLocaleDateString()}`))
                                .join('\n')
                              const blob = new Blob([csv], { type: 'text/csv' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`
                              a.click()
                              URL.revokeObjectURL(url)
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-surface-hover hover:bg-surface border border-border/50 rounded-lg text-foreground/70 hover:text-foreground transition-colors"
                          >
                            Export CSV
                          </button>
                        </div>

                        <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                        {isLoadingOrders ? (
                            <div className="p-8 text-center text-foreground">Loading Orders...</div>
                        ) : isErrorOrders ? (
                            <div className="p-8 text-center text-danger">Error loading orders</div>
                        ) : (
                          <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-surface-hover">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Proof</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {filteredOrders.map((order) => (
                                <tr key={order.id} className={`hover:bg-surface-hover/50 transition-colors ${order.has_unread_messages ? 'bg-primary/5' : ''}`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">#{order.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.product_name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-bold">{order.amount} EGP</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={order.status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{order.payment_method}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {order.payment_proof_url ? (
                                          <a href={`${import.meta.env.VITE_API_URL || ''}/${order.payment_proof_url}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium break-all">
                                              View Proof
                                          </a>
                                      ) : <span className="text-foreground/40">N/A</span>}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className={`text-primary hover:text-primary-hover relative transition-colors ${
                                                order.has_unread_messages ? 'animate-pulse' : ''
                                            }`}
                                            title="Chat with Customer"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            {order.has_unread_messages && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface" />
                                            )}
                                        </button>

                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                                                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                                    title="Approve Order"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOrderStatusUpdate(order.id, 'rejected')}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
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
                              {filteredOrders.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No orders match your filters</td></tr>
                              )}
                            </tbody>
                          </table>
                          </div>
                        )}
                        </div>
                      </>
                   )}
                </motion.div>
              </AnimatePresence>
          </div>
      </main>

      {/* Order Chat Modal */}
      <AnimatePresence>
      {selectedOrderId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedOrderId(null); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-surface border border-border/50 rounded-2xl shadow-2xl w-full md:max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Order #{selectedOrderId} Chat</h3>
                  <button
                      onClick={() => { setSelectedOrderId(null); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) }}
                      className="p-2 rounded-full hover:bg-surface-hover text-foreground/70 transition-colors"
                  >
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="flex-1 overflow-hidden">
                  <OrderChat orderId={selectedOrderId} />
              </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Ticket Chat Modal */}
      <AnimatePresence>
      {selectedTicketId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedTicketId(null); queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }) }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-surface border border-border/50 rounded-2xl shadow-2xl w-full md:max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Ticket #{selectedTicketId}</h3>
                  <button
                      onClick={() => { setSelectedTicketId(null); queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }) }}
                      className="p-2 rounded-full hover:bg-surface-hover text-foreground/70 transition-colors"
                  >
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="flex-1 overflow-hidden">
                  <AdminTicketChat ticketId={selectedTicketId} />
              </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Delivery Key Modal */}
      <AnimatePresence>
        {deliveryKeyModalOpen && currentApprovalOrderId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeliveryKeyModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-surface border border-border/50 rounded-2xl shadow-2xl w-full md:max-w-md overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                <h3 className="text-lg font-bold text-foreground">Approve Order #{currentApprovalOrderId}</h3>
                <button
                  onClick={() => setDeliveryKeyModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-hover text-foreground/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-foreground/70">
                  You are about to approve this order. If this product requires a digital license or delivery key, you can provide it below so the customer can access it immediately on their dashboard.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Delivery Key / License (Optional)</label>
                  <textarea
                    value={deliveryKeyInput}
                    onChange={e => setDeliveryKeyInput(e.target.value)}
                    placeholder="e.g. XXXX-YYYY-ZZZZ"
                    className="w-full h-24 p-3 bg-background border border-border/50 rounded-xl text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-border/50 flex justify-end gap-3 bg-surface-hover/30">
                <button
                  onClick={() => setDeliveryKeyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background border border-border/50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitOrderApproval}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------- Admin Ticket Chat ----------
function AdminTicketChat({ ticketId }: { ticketId: number }) {
    const [newMessage, setNewMessage] = useState('')
    const queryClient = useQueryClient()

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

    if (isLoading) return <div className="p-8 text-center text-foreground/50">Loading chat...</div>

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                {messages?.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-foreground/30 space-y-2">
                    <MessageSquare className="w-12 h-12" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
                {messages?.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.is_admin
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-surface border border-border/50 text-foreground rounded-bl-sm'
                        }`}>
                            <div className="text-[10px] opacity-70 mb-1">{msg.is_admin ? 'You' : 'User'}</div>
                            <p className="leading-relaxed">{msg.content}</p>
                            {msg.attachment_url && (
                                <a href={`/${msg.attachment_url}`} target="_blank" className="block mt-2">
                                    <img src={`/${msg.attachment_url}`} className="max-h-32 rounded-lg border border-white/10" />
                                </a>
                            )}
                            <div className="text-[10px] opacity-50 mt-1 text-right">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="p-3 bg-surface border-t border-border/50 flex gap-2">
                <input
                    className="flex-1 border border-border/50 rounded-full px-4 py-2 text-sm bg-background text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-foreground/40"
                    placeholder="Reply to user..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50">
                    <MessageSquare className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}

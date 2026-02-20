import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle, MessageSquare, X, User as UserIcon, Star } from 'lucide-react'
import OrderChat from '../components/OrderChat'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

interface Order {
  id: number
  product_id: number
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
  const { user } = useAuth()
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    refetchInterval: 10000 // Poll for new messages/updates
  })

  const handleCloseChat = () => {
    setSelectedOrderId(null)
    queryClient.invalidateQueries({ queryKey: ['my-orders'] }) // Refresh to clear unread status
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-background pt-24">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 border-r border-border/50 bg-surface flex-col shrink-0">
         <div className="p-6 border-b border-border/50 flex flex-col gap-2">
             <h2 className="text-xl font-bold text-foreground tracking-tight">My Account</h2>
             <div className="flex items-center gap-2 text-sm text-gray-400">
                <UserIcon className="w-4 h-4" />
                <span className="truncate">{user?.full_name || user?.email || 'User'}</span>
             </div>
         </div>
         <nav className="flex-1 p-4 space-y-1">
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium bg-primary/10 text-primary">
                 <Package className="w-5 h-5" />
                 Order History
             </button>
         </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center px-6 md:px-8 shrink-0 relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Order History</h1>
          </header>
          
          <div className="flex-1 p-6 md:p-8 pt-0 overflow-y-auto">
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4 max-w-5xl"
              >
                  {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                           <Card key={i} className="h-32 animate-pulse bg-surface-hover/50" />
                        ))}
                      </div>
                  ) : isError ? (
                      <Card className="p-12 text-center flex flex-col items-center gap-4">
                         <XCircle className="w-12 h-12 text-danger" />
                         <p className="text-lg font-medium text-foreground">Failed to load orders.</p>
                         <p className="text-sm text-gray-400">Please try linking to google or logging in again.</p>
                      </Card>
                  ) : orders?.length === 0 ? (
                      <Card className="p-16 text-center flex flex-col items-center gap-4 border-dashed border-2 bg-transparent">
                          <Package className="w-16 h-16 text-gray-500 mb-2" />
                          <h3 className="text-xl font-semibold text-foreground">No orders yet</h3>
                          <p className="text-gray-400">When you place an order, it will appear here.</p>
                      </Card>
                  ) : (
                      <div className="grid gap-4">
                        {orders?.map((order, index) => (
                          <motion.div 
                             key={order.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: index * 0.05 }}
                          >
                            <Card className={`p-5 md:p-6 transition-colors hover:border-primary/50 ${order.has_unread_messages ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-primary/5' : ''}`}>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                      <h3 className="text-lg font-bold text-foreground">
                                          {order.product_name}
                                      </h3>
                                      {order.has_unread_messages && (
                                          <Badge variant="default" className="animate-pulse flex gap-1 items-center">
                                              <div className="w-1.5 h-1.5 rounded-full bg-white mb-[1px]" /> Unread
                                          </Badge>
                                      )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                      <span className="flex items-center gap-1 font-mono bg-surface-hover px-2 py-0.5 rounded-md text-gray-300">
                                          #{order.id}
                                      </span>
                                      <span className="font-semibold text-foreground">{order.amount.toFixed(2)} EGP</span>
                                      <span className="capitalize">{order.payment_method}</span>
                                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 md:flex-col md:items-end justify-between md:justify-center">
                                  {order.status === 'completed' ? (
                                      <Badge variant="success" className="gap-1.5 py-1 text-sm"><CheckCircle className="w-4 h-4" /> Completed</Badge>
                                  ) : order.status === 'rejected' ? (
                                      <Badge variant="destructive" className="gap-1.5 py-1 text-sm"><XCircle className="w-4 h-4" /> Rejected</Badge>
                                  ) : (
                                      <Badge variant="warning" className="gap-1.5 py-1 text-sm"><Clock className="w-4 h-4" /> Pending</Badge>
                                  )}
                                  
                                  <div className="flex gap-2 mt-2 md:mt-0">
                                      {order.status === 'completed' && (
                                          <Link to={`/products/${order.product_id}#reviews`}>
                                              <Button variant="secondary" size="sm" className="gap-2 relative">
                                                  <Star className="w-4 h-4" />
                                                  Review
                                              </Button>
                                          </Link>
                                      )}
                                      <Button 
                                          variant={order.has_unread_messages ? 'default' : 'outline'}
                                          size="sm"
                                          onClick={() => setSelectedOrderId(order.id)}
                                          className="gap-2 relative"
                                      >
                                          <MessageSquare className="w-4 h-4" />
                                          {order.has_unread_messages ? 'View Reply' : 'Support'}
                                      </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                  )}
              </motion.div>
          </div>
      </main>

      {/* Chat Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
              <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  className="bg-surface border border-border/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
              >
                  <div className="flex justify-between items-center p-4 border-b border-border/50 bg-surface-hover/50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                              <h3 className="text-sm font-semibold text-foreground leading-none">Order Support</h3>
                              <p className="text-xs text-gray-400 mt-1">Order #{selectedOrderId}</p>
                          </div>
                      </div>
                      <button 
                          onClick={handleCloseChat} 
                          className="p-2 text-gray-400 hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <OrderChat orderId={selectedOrderId} />
                  </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

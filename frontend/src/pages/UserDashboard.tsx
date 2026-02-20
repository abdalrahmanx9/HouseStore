import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Clock, CheckCircle, XCircle, MessageSquare, X, User as UserIcon, Star, ShoppingBag } from 'lucide-react'
import OrderChat from '../components/OrderChat'
import ReviewForm from '../components/ReviewForm'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'sonner'

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
  has_reviewed?: boolean
  delivery_key?: string
}

const fetchMyOrders = async (): Promise<Order[]> => {
  const response = await axios.get('/api/v1/orders/')
  return response.data
}

export default function UserDashboard() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<{productId: number, orderId: number} | null>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { addToCart } = useCart()
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    refetchInterval: 10000 // Poll for new messages/updates
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('orderId')
    if (orderId) {
       setSelectedOrderId(parseInt(orderId))
       window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

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
              {/* User Stats Cards */}
              {orders && orders.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 max-w-5xl">
                  {[
                    { label: 'Total Orders', value: orders.length, accent: 'text-blue-400 bg-blue-500/15' },
                    { label: 'Total Spent', value: `${orders.reduce((s, o) => s + o.amount, 0).toFixed(0)} EGP`, accent: 'text-emerald-400 bg-emerald-500/15' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, accent: 'text-amber-400 bg-amber-500/15' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, accent: 'text-primary bg-primary/15' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface border border-border/50 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-foreground/50 uppercase tracking-wider">{stat.label}</span>
                      <span className={`text-xl font-black ${stat.accent.split(' ')[0]}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}

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
                                          order.has_reviewed ? (
                                              <Button 
                                                  disabled
                                                  variant="outline" 
                                                  size="sm" 
                                                  className="gap-2 relative pointer-events-none"
                                              >
                                                  <CheckCircle className="w-4 h-4 text-success" />
                                                  Submitted
                                              </Button>
                                          ) : (
                                              <Button 
                                                  onClick={() => setSelectedReviewOrder({productId: order.product_id, orderId: order.id})} 
                                                  variant="secondary" 
                                                  size="sm" 
                                                  className="gap-2 relative hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                              >
                                                  <Star className="w-4 h-4" />
                                                  Review
                                              </Button>
                                          )
                                      )}
                                      {order.status === 'completed' && (
                                          <Button 
                                              onClick={() => {
                                                addToCart({ id: order.product_id, name: order.product_name, price: order.amount, category: '', stock_count: 1 } as any)
                                                toast.success(`${order.product_name} added to cart!`)
                                              }}
                                              variant="outline" 
                                              size="sm" 
                                              className="gap-2"
                                          >
                                              <ShoppingBag className="w-4 h-4" />
                                              Buy Again
                                          </Button>
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

                              {/* NEW: Delivery Key Section */}
                              {order.status === 'completed' && order.delivery_key && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                      <p className="text-sm text-primary font-semibold mb-1">Your License / Download Key</p>
                                      <code className="text-foreground font-mono select-all bg-background px-3 py-1.5 rounded-lg border border-border/50 block w-full items-center md:w-auto break-all">
                                          {order.delivery_key}
                                      </code>
                                    </div>
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.delivery_key!)
                                            toast.success('Key copied to clipboard!')
                                        }}
                                        className="shrink-0"
                                    >
                                        Copy Key
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Card>
                            
                            {order.status !== 'rejected' && (
                              <div className="bg-surface/50 border-x border-b border-border/50 rounded-b-2xl px-6 py-4 mx-2 -mt-4 relative z-[-1]">
                                <div className="flex items-center justify-between w-full max-w-sm mx-auto relative pt-4">
                                  {/* Progress Bar Background */}
                                  <div className="absolute top-1/2 left-0 w-full h-1 bg-border/50 -translate-y-1/2 rounded-full" />
                                  {/* Active Progress Bar */}
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: order.status === 'completed' ? '100%' : '50%' }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                  />
                                  
                                  {/* Step 1: Placed */}
                                  <div className="relative flex flex-col items-center gap-2 z-10 w-1/3">
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground">Placed</span>
                                  </div>

                                  {/* Step 2: Processing */}
                                  <div className="relative flex flex-col items-center gap-2 z-10 w-1/3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-surface transition-colors duration-500 delay-500 ${order.status === 'completed' || order.status === 'pending' ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-surface-hover border-2 border-border/80'}`}>
                                      {order.status === 'completed' ? <CheckCircle className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                    </div>
                                    <span className={`text-[10px] font-bold ${order.status === 'completed' || order.status === 'pending' ? 'text-foreground' : 'text-foreground/40'}`}>Processing</span>
                                  </div>

                                  {/* Step 3: Delivered */}
                                  <div className="relative flex flex-col items-center gap-2 z-10 w-1/3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-surface transition-colors duration-500 delay-1000 ${order.status === 'completed' ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-surface-hover border-2 border-border/80'}`}>
                                      {order.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-[10px] font-bold ${order.status === 'completed' ? 'text-foreground' : 'text-foreground/40'}`}>Delivered</span>
                                  </div>
                                </div>
                              </div>
                            )}
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

        {/* Review Modal */}
        {selectedReviewOrder && (
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
                  className="bg-surface border border-border/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col relative p-6"
              >
                  <button 
                      onClick={() => setSelectedReviewOrder(null)} 
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors z-10"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>
                  <ReviewForm productId={selectedReviewOrder.productId} orderId={selectedReviewOrder.orderId} onSuccess={() => setSelectedReviewOrder(null)} />
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

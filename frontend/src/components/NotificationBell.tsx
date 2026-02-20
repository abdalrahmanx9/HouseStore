import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: number
  originalId: number
  type: 'order' | 'ticket'
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch unread counts based on user role
  const { data: orders } = useQuery({
    queryKey: user?.is_superuser ? ['admin-orders', 'notifications'] : ['my-orders'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/orders/')
      return res.data
    },
    enabled: !!user,
    refetchInterval: 10000,
  })

  const { data: tickets } = useQuery({
    queryKey: ['admin-tickets', 'notifications'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/tickets/')
      return res.data
    },
    enabled: !!user?.is_superuser,
    refetchInterval: 10000,
  })

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const unreadOrders = orders?.filter((o: { has_unread_messages: boolean }) => o.has_unread_messages) || []
  const unreadTickets = tickets?.filter((t: { status: string, has_unread_messages: boolean }) => {
    if (t.status === 'closed') return false;
    return t.has_unread_messages;
  }) || []
  
  const unreadCount = unreadOrders.length + unreadTickets.length

  const notifications: Notification[] = [
    ...unreadOrders.map((o: { id: number, product_name: string, created_at: string }) => ({
      id: o.id + 100000,
      originalId: o.id,
      type: 'order' as const,
      title: `Order #${o.id}`,
      message: `Reply on "${o.product_name}"`,
      time: new Date(o.created_at).toLocaleDateString(),
      read: false,
    })),
    ...unreadTickets.map((t: { id: number, subject: string, created_at: string }) => ({
      id: t.id + 200000,
      originalId: t.id,
      type: 'ticket' as const,
      title: `Ticket #${t.id}`,
      message: `Unread: ${t.subject}`,
      time: new Date(t.created_at).toLocaleDateString(),
      read: false,
    }))
  ].slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-foreground/40">You're all caught up!</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border/30 last:border-0 cursor-pointer"
                    onClick={() => {
                      setIsOpen(false)
                      const basePath = user.is_superuser ? '/admin' : '/dashboard'
                      const param = n.type === 'order' ? `?orderId=${n.originalId}` : `?ticketId=${n.originalId}`
                      window.location.href = basePath + param
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-foreground/50 truncate">{n.message}</p>
                        <p className="text-[10px] text-foreground/30 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

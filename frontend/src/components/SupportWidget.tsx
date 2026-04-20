import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Plus, ChevronLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

// Types
interface Ticket {
  id: number
  subject: string
  status: string
  priority: string
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

export default function SupportWidget() {
    const { user } = useAuth()
    const { pathname } = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<'list' | 'create' | 'chat'>('list')
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

    const [guestTicketIds, setGuestTicketIds] = useState<number[]>(() => {
        const stored = localStorage.getItem('guest_tickets')
        return stored ? JSON.parse(stored) : []
    })

    // Fetch Tickets
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', user ? 'auth' : 'guest', guestTicketIds],
        queryFn: async () => {
            if (user) {
                const res = await axios.get('/api/v1/tickets/')
                return res.data as Ticket[]
            } else {
                if (guestTicketIds.length === 0) return []
                const res = await axios.get('/api/v1/tickets/', { params: { guest_ids: guestTicketIds.join(',') }})
                return res.data as Ticket[]
            }
        },
        enabled: isOpen,
        refetchInterval: isOpen ? 5000 : false
    })

    const unreadCount = tickets?.filter(t => t.has_unread_messages).length || 0

    if (pathname.startsWith('/admin')) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {/* Widget Window */}
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                        className="mb-4 w-[350px] h-[500px] bg-surface rounded-2xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-border/50 overflow-hidden flex flex-col will-change-transform transform-origin-bottom-right backdrop-blur-xl"
                    >
                    {/* Header */}
                    <div className="bg-primary/10 border-b border-border/50 p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {view !== 'list' && (
                                <button onClick={() => { setView('list'); setSelectedTicketId(null) }} className="hover:bg-surface-hover p-1 rounded-full transition-colors text-foreground/70">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div className="p-1.5 bg-primary/20 rounded-lg">
                                <MessageCircle className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-foreground text-sm">
                                {view === 'list' && 'Support'}
                                {view === 'create' && 'New Ticket'}
                                {view === 'chat' && `Ticket #${selectedTicketId}`}
                            </h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-surface-hover p-1.5 rounded-full transition-colors text-foreground/70">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {isLoading && view === 'list' ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                        ) : (
                            <>
                                {view === 'list' && (
                                    <TicketList 
                                        tickets={tickets || []} 
                                        onSelect={(id) => { setSelectedTicketId(id); setView('chat') }}
                                        onCreate={() => setView('create')}
                                    />
                                )}
                                {view === 'create' && (
                                    <CreateTicket 
                                        onSuccess={(newTicketId) => {
                                            if (!user && newTicketId) {
                                                const updated = [...guestTicketIds, newTicketId]
                                                setGuestTicketIds(updated)
                                                localStorage.setItem('guest_tickets', JSON.stringify(updated))
                                            }
                                            setView('list')
                                        }} 
                                        onCancel={() => setView('list')} 
                                    />
                                )}
                                {view === 'chat' && selectedTicketId && (
                                    <TicketChat ticketId={selectedTicketId} />
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* FAB */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 relative"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!isOpen && unreadCount > 0 && (
                     <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ring-2 ring-background animate-bounce">
                        {unreadCount}
                     </span>
                )}
            </button>
        </div>
    )
}

function TicketList({ tickets, onSelect, onCreate }: { tickets: Ticket[], onSelect: (id: number) => void, onCreate: () => void }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {tickets.length === 0 ? (
                    <div className="text-center mt-10 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                            <MessageCircle className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-foreground font-medium">No tickets yet</p>
                        <p className="text-sm text-gray-400">Need help? Create one!</p>
                    </div>
                ) : (
                    tickets.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => onSelect(t.id)}
                            className={`bg-background/50 p-3 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors border border-border/50 relative ${
                                t.has_unread_messages ? 'border-l-4 border-l-primary' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className={`font-medium truncate flex-1 max-w-[180px] text-sm ${t.has_unread_messages ? 'text-primary font-bold' : 'text-foreground'}`}>
                                    {t.subject}
                                </h4>
                                <Badge 
                                    variant={t.status === 'open' ? 'success' : 'secondary'} 
                                    className="text-[10px] px-2 py-0.5 capitalize ml-2"
                                >
                                    {t.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex justify-between">
                                <span>{new Date(t.updated_at).toLocaleDateString()}</span>
                                {t.has_unread_messages && (
                                    <span className="text-primary font-bold text-[10px] animate-pulse">New Message</span>
                                )}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <div className="p-3 border-t border-border/50">
                <Button 
                    onClick={onCreate}
                    className="w-full gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </Button>
            </div>
        </div>
    )
}

function CreateTicket({ onSuccess, onCancel }: { onSuccess: (id?: number) => void, onCancel: () => void }) {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post('/api/v1/tickets/', { 
                subject, 
                initial_message: message,
                priority: 'normal'
            })
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            onSuccess(data.id)
        }
    })

    return (
        <div className="p-4 flex flex-col h-full space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Subject</label>
                <input 
                    className="w-full p-2.5 bg-background border border-border/50 rounded-xl text-foreground text-sm placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-primary transition-all"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Briefly describe the issue..."
                />
            </div>
            <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
                <textarea 
                    className="w-full h-full p-2.5 bg-background border border-border/50 rounded-xl resize-none text-foreground text-sm placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-primary transition-all"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help?"
                />
            </div>
            <div className="flex space-x-2">
                <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
                <Button 
                    onClick={() => mutation.mutate()}
                    disabled={!subject || !message || mutation.isPending}
                    className="flex-1 rounded-xl"
                >
                    {mutation.isPending ? 'Sending...' : 'Create Ticket'}
                </Button>
            </div>
        </div>
    )
}

function TicketChat({ ticketId }: { ticketId: number }) {
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    const { data: messages, isLoading } = useQuery({
        queryKey: ['ticket-messages', ticketId],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/tickets/${ticketId}/messages`)
            return res.data as TicketMessage[]
        },
        refetchInterval: 3000
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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

    if (isLoading) return <div className="p-4 text-center text-sm text-gray-400">Loading...</div>

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                {messages?.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.is_admin 
                                ? 'bg-surface border border-border/50 text-foreground rounded-bl-md' 
                                : 'bg-primary text-white rounded-br-md'
                        }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] mt-1 block ${msg.is_admin ? 'text-gray-500' : 'text-white/60'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 bg-surface border-t border-border/50 flex gap-2">
                <input 
                    className="flex-1 border border-border/50 rounded-full px-4 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500 transition-all"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Plus, ChevronLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

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

    // Fetch Tickets
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            if (!user) return []
            const res = await axios.get('/api/v1/tickets/')
            return res.data as Ticket[]
        },
        enabled: !!user && isOpen,
        refetchInterval: isOpen ? 5000 : false
    })

    const unreadCount = tickets?.filter(t => t.has_unread_messages).length || 0

    if (!user || pathname.startsWith('/admin')) return null

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
                        className="mb-4 w-[350px] h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden flex flex-col will-change-transform transform-origin-bottom-right"
                    >
                    {/* Header */}
                    <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {view !== 'list' && (
                                <button onClick={() => { setView('list'); setSelectedTicketId(null) }} className="hover:bg-blue-700 p-1 rounded-full">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <h3 className="font-bold">
                                {view === 'list' && 'Support'}
                                {view === 'create' && 'New Ticket'}
                                {view === 'chat' && `Ticket #${selectedTicketId}`}
                            </h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {isLoading && view === 'list' ? (
                            <div className="absolute inset-0 flex items-center justify-center dark:text-gray-300">Loading...</div>
                        ) : (
                            <>
                                {view === 'list' && tickets && (
                                    <TicketList 
                                        tickets={tickets} 
                                        onSelect={(id) => { setSelectedTicketId(id); setView('chat') }}
                                        onCreate={() => setView('create')}
                                    />
                                )}
                                {view === 'create' && (
                                    <CreateTicket 
                                        onSuccess={() => setView('list')}
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
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 relative"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!isOpen && unreadCount > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {tickets.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No tickets yet.</p>
                        <p className="text-sm">Need help? Create one!</p>
                    </div>
                ) : (
                    tickets.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => onSelect(t.id)}
                            className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border dark:border-gray-600 relative ${
                                t.has_unread_messages ? 'border-l-4 border-l-blue-500' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className={`font-medium truncate flex-1 md:max-w-[180px] ${t.has_unread_messages ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {t.subject}
                                </h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                    t.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                                }`}>
                                    {t.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                                <span>{new Date(t.updated_at).toLocaleDateString()}</span>
                                {t.has_unread_messages && (
                                    <span className="text-blue-500 font-bold text-[10px] animate-pulse">New Message</span>
                                )}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 border-t dark:border-gray-700">
                <button 
                    onClick={onCreate}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Ticket</span>
                </button>
            </div>
        </div>
    )
}

function CreateTicket({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async () => {
            await axios.post('/api/v1/tickets/', { 
                subject, 
                initial_message: message,
                priority: 'normal'
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            onSuccess()
        }
    })

    return (
        <div className="p-4 flex flex-col h-full space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Briefly describe the issue..."
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea 
                    className="w-full h-full p-2 border rounded-lg resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help?"
                />
            </div>
            <div className="flex space-x-2">
                <button onClick={onCancel} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                <button 
                    onClick={() => mutation.mutate()}
                    disabled={!subject || !message || mutation.isPending}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {mutation.isPending ? 'Sending...' : 'Create Ticket'}
                </button>
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

    if (isLoading) return <div className="p-4 text-center">Loading...</div>

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages?.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                            msg.is_admin 
                                ? 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200' 
                                : 'bg-blue-600 text-white'
                        }`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex space-x-2">
                <input 
                    className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 text-sm dark:bg-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full dark:hover:bg-gray-700">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}

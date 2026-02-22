import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Send, MessageSquare, Shield, Paperclip, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface Message {
  id: number
  order_id: number
  user_id: number
  content: string
  is_admin: boolean
  created_at: string
  attachment_url?: string
}

interface OrderChatProps {
  orderId: number
}

export default function OrderChat({ orderId }: OrderChatProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: messages, isLoading } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/orders/${orderId}/messages`)
      return res.data as Message[]
    },
    refetchInterval: 2000 // Poll every 2s for new messages
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await axios.post(`/api/v1/orders/${orderId}/messages`, formData)
    },
    onSuccess: () => {
      setNewMessage('')
      setSelectedFile(null)
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] })
    }
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return

    const formData = new FormData()
    formData.append('content', newMessage || ' ') // Send space if empty to satisfy backend
    if (selectedFile) {
        formData.append('file', selectedFile)
    }
    
    mutation.mutate(formData)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0])
    }
  }

  if (isLoading) return <div className="p-4 text-center text-foreground/50">Loading chat...</div>

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-foreground/30 space-y-2">
                <MessageSquare className="w-12 h-12 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
            </div>
        )}
        
        {messages?.map((msg) => {
            const isMe = user?.id === msg.user_id
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe 
                            ? 'bg-primary text-white rounded-br-sm' 
                            : 'bg-surface border border-border/50 text-foreground rounded-bl-sm'
                    }`}>
                        <div className={`text-xs font-bold mb-1 opacity-90 ${isMe ? 'text-white/70' : 'text-foreground/50'}`}>
                            {msg.is_admin ? (
                                <span className="flex items-center space-x-1 text-primary">
                                    <Shield className="w-3 h-3" /> <span>SUPPORT TEAM</span>
                                </span>
                            ) : isMe ? 'You' : 'Customer'}
                        </div>
                        
                        {msg.attachment_url && (
                            <div className="mb-2">
                                <a href={`/${msg.attachment_url}`} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={`/${msg.attachment_url}`} 
                                        alt="Attachment" 
                                        className="rounded-lg max-h-48 object-cover border border-border/20"
                                    />
                                </a>
                            </div>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface border-t border-border/50">
        {selectedFile && (
            <div className="flex items-center mb-2 bg-surface-hover px-3 py-1 rounded-full w-fit">
                <span className="text-xs text-foreground/70 truncate max-w-[200px]">{selectedFile.name}</span>
                <button 
                    onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                    }} 
                    className="ml-2 text-foreground/40 hover:text-danger transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
        <form onSubmit={handleSend} className="flex space-x-2">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-foreground/50 hover:text-primary transition-colors"
                title="Attach Image"
            >
                <Paperclip className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
                <input
                    type="text"
                    className="w-full border border-border/50 rounded-full pl-5 pr-4 py-2 bg-background text-foreground focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={mutation.isPending}
                />
            </div>
            <button 
                type="submit" 
                disabled={mutation.isPending || (!newMessage.trim() && !selectedFile)}
                className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform active:scale-95"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>
    </div>
  )
}

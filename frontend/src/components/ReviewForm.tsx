import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import type { ReviewCreate } from '../types'

interface ReviewFormProps {
    productId: number
    orderId: number
    onSuccess?: () => void
}

export default function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [error, setError] = useState('')

    const queryClient = useQueryClient()

    const submitMutation = useMutation({
        mutationFn: async (data: ReviewCreate) => {
            const response = await axios.post('/api/v1/reviews/', data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId.toString()] })
            setRating(0)
            setComment('')
            toast.success('Review submitted successfully!')
            if (onSuccess) onSuccess()
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to submit review')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a rating')
            return
        }
        setError('')
        submitMutation.mutate({ product_id: productId, order_id: orderId, rating, comment } as any)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-foreground">Write a Review</h3>
            
            {error && (
                <div className="mb-4 bg-danger/10 text-danger p-3 rounded-lg text-sm font-semibold border border-danger/20">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">Rating</label>
                <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-125 focus-visible:scale-125"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <Star 
                                className={`w-8 h-8 transition-colors duration-200 ${
                                    star <= (hoverRating || rating) 
                                        ? 'text-yellow-400 fill-current drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                                        : 'text-gray-600 hover:text-gray-400'
                                }`} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">Comment (Optional)</label>
                <textarea
                    className="w-full px-4 py-3 bg-surface/50 border border-border/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-gray-600 transition-all resize-none font-medium"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review here..."
                />
            </div>

            <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold px-4 py-3.5 rounded-xl disabled:opacity-50 transition-all uppercase tracking-widest text-sm shadow-[0_0_15px_-3px_var(--color-primary)] active:scale-95"
            >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    )
}

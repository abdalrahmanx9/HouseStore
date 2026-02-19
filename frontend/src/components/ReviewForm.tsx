import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Star } from 'lucide-react'
import type { ReviewCreate } from '../types'

interface ReviewFormProps {
    productId: number
    onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
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
        submitMutation.mutate({ product_id: productId, rating, comment })
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Write a Review</h3>
            
            {error && (
                <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <Star 
                                className={`w-6 h-6 ${
                                    star <= (hoverRating || rating) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300 dark:text-gray-600'
                                }`} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment (Optional)</label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                />
            </div>

            <button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    )
}

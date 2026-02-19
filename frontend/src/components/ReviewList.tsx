import type { Review } from '../types'
import { Star } from 'lucide-react'

interface ReviewListProps {
    reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                                {review.user?.full_name || 'Anonymous User'}
                            </span>
                            {review.is_verified_purchase && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                    Verified Purchase
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                        ))}
                    </div>

                    {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}

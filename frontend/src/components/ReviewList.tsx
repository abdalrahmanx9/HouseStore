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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-surface/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                {(review.user?.full_name || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                                <span className="font-bold text-foreground block">
                                    {review.user?.full_name || 'Anonymous User'}
                                </span>
                                {review.is_verified_purchase ? (
                                    <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">
                                        Verified Purchase
                                    </span>
                                ) : (
                                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Guest</span>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                            {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    
                    <div className="flex items-center mb-4 space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]' : 'text-gray-700'}`} 
                            />
                        ))}
                    </div>

                    {review.comment && (
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}

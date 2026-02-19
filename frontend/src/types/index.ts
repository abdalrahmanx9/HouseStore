export interface Product {
    id: number
    name: string
    price: number
    category: string
    stock_count: number
    description?: string
    subcategory?: string
    delivery_type?: string
    is_active?: boolean
    image_url?: string
}

export interface Review {
    id: number
    product_id: number
    user_id: number
    rating: number
    comment?: string
    is_verified_purchase: boolean
    created_at: string
    user?: {
        full_name: string
    }
}

export interface ReviewCreate {
    product_id: number
    rating: number
    comment?: string
}

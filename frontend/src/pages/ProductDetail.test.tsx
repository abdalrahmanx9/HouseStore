import { render, screen, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import ProductDetail from './ProductDetail'
import '../setupTests'

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        create: vi.fn().mockReturnThis(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    }
}))

describe('Product Detail Page', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders product details after fetch', async () => {
        const mockProduct = { 
            id: 1, 
            name: 'Elden Ring', 
            price: 60, 
            category: 'Gaming', 
            stock_count: 5,
            description: 'Best RPG of the year',
            delivery_type: 'key'
        };
        const mockReviews: any[] = [];
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('/api/v1/products/1')) {
                return Promise.resolve({ data: mockProduct })
            }
            if (url.includes('/api/v1/reviews/product/1')) {
                return Promise.resolve({ data: mockReviews })
            }
            if (url.includes('/api/v1/users/me')) {
                return Promise.reject({ response: { status: 401 } }) // Not logged in
            }
            return Promise.resolve({ data: {} })
        })

        render(
            <Routes>
                <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>,
            { route: '/products/1' }
        )

        expect(screen.getByText(/loading/i)).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('Elden Ring')).toBeInTheDocument()
            expect(screen.getByText('Best RPG of the year')).toBeInTheDocument()
            // Price might be formatted. Check "EGP" or "60"
            expect(screen.getByText(/60/)).toBeInTheDocument()
            expect(screen.getByText(/In Stock/i)).toBeInTheDocument()
        })
    })
})

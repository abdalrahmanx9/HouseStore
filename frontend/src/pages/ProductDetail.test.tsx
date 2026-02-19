import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import ProductDetail from './ProductDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../setupTests'

vi.mock('axios')

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('Product Detail Page', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders product details after fetch', async () => {
        const queryClient = createTestQueryClient()
        const mockProduct = { 
            id: 1, 
            name: 'Elden Ring', 
            price: 60, 
            category: 'Gaming', 
            stock_count: 5,
            description: 'Best RPG of the year',
            delivery_type: 'key'
        };
        
        (axios.get as any).mockResolvedValue({ data: mockProduct })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/products/1']}>
                    <Routes>
                        <Route path="/products/:id" element={<ProductDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        expect(screen.getByText(/loading/i)).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('Elden Ring')).toBeInTheDocument()
            expect(screen.getByText('Best RPG of the year')).toBeInTheDocument()
            expect(screen.getByText('EGP 60')).toBeInTheDocument()
            expect(screen.getByText(/In Stock/i)).toBeInTheDocument()
        })
    })
})

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import ProductList from './ProductList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../setupTests'

// Mock axios
vi.mock('axios')

// Setup QueryClient for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('Product List Page', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders loading state initially', async () => {
        const queryClient = createTestQueryClient();
        // Mock pending promise
        (axios.get as any).mockImplementation(() => new Promise(() => {}))

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ProductList />
                </MemoryRouter>
            </QueryClientProvider>
        )
        // Use findByText to allow for microtask queue to process
        expect(await screen.findByText(/loading products/i)).toBeInTheDocument()
    })

    it('renders products after fetch', async () => {
        const queryClient = createTestQueryClient()
        const mockProducts = [
            { id: 1, name: 'Elden Ring', price: 60, category: 'Gaming', stock_count: 5 },
            { id: 2, name: 'Netflix', price: 10, category: 'Streaming', stock_count: 100 }
        ]
        
        // Mock successful response
        ;(axios.get as any).mockResolvedValue({ data: mockProducts })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ProductList />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('Elden Ring')).toBeInTheDocument()
            expect(screen.getByText('Netflix')).toBeInTheDocument()
            expect(screen.getByText('$60')).toBeInTheDocument()
        })
    })

    it('renders empty state if no products', async () => {
        const queryClient = createTestQueryClient()
        ;(axios.get as any).mockResolvedValue({ data: [] })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ProductList />
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText(/no products found/i)).toBeInTheDocument()
        })
    })
})

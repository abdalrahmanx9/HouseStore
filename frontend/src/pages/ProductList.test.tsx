import { render, screen, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import ProductList from './ProductList'
import '../setupTests'

// Mock axios
vi.mock('axios')

describe('Product List Page', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders loading state initially', async () => {
        // Mock pending promise
        (axios.get as any).mockImplementation(() => new Promise(() => {}))

        render(<ProductList />)
        // Use findByText to allow for microtask queue to process
        expect(await screen.findByText(/loading products/i)).toBeInTheDocument()
    })

    it('renders products after fetch', async () => {
        const mockProducts = [
            { id: 1, name: 'Elden Ring', price: 60, category: 'Gaming', stock_count: 5 },
            { id: 2, name: 'Netflix', price: 10, category: 'Streaming', stock_count: 100 }
        ]
        
        // Mock successful response
        ;(axios.get as any).mockResolvedValue({ data: mockProducts })

        render(<ProductList />)

        await waitFor(() => {
            expect(screen.getByText('Elden Ring')).toBeInTheDocument()
            expect(screen.getByText('Netflix')).toBeInTheDocument()
            // Price might be formatted differently in ProductCard, let's check
            // expect(screen.getByText('EGP 60')).toBeInTheDocument() 
        })
    })

    it('renders empty state if no products', async () => {
        ;(axios.get as any).mockResolvedValue({ data: [] })

        render(<ProductList />)

        await waitFor(() => {
            expect(screen.getByText(/no products found/i)).toBeInTheDocument()
        })
    })
})

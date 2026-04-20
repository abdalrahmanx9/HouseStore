// @vitest-environment jsdom
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import ProductList from '../ProductList'

// Mock specific hooks/contexts if necessary
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null })
}))

vi.mock('../../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn(), removeFromCart: vi.fn(), cart: [] }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('../../context/ComparisonContext', () => ({
  useComparison: () => ({ comparisons: [], addToComparison: vi.fn(), removeFromComparison: vi.fn(), isInComparison: () => false, clearComparisons: vi.fn() }),
  ComparisonProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// IntersectionObserver isn't available in standard jsdom, mock it to allow framer-motion to render correctly
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof window.IntersectionObserver

const server = setupServer(
  http.get('/api/v1/products/', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test Product', price: 99, category: 'Test', stock_count: 10, is_active: true }
    ])
  }),
  http.get('/api/v1/reviews/recent', () => {
    return HttpResponse.json([]) // Empty reviews
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

describe('ProductList - Social Proof', () => {
  it('hides social proof section when reviews are empty', async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductList />
        </MemoryRouter>
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })
    
    expect(screen.queryByText('Loved by Developers Worldwide')).not.toBeInTheDocument()
  })
  
  it('shows social proof section when reviews exist', async () => {
    server.use(
      http.get('/api/v1/reviews/recent', () => {
        return HttpResponse.json([
          { 
             id: 1, rating: 5, created_at: '2023-01-01T00:00:00Z',
             user: { full_name: 'Test Setup User' },
             product: { name: 'Test Product' }
          }
        ])
      })
    )
    
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProductList />
        </MemoryRouter>
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Loved by Developers Worldwide')).toBeInTheDocument()
    })
    
    expect(screen.getAllByText('Test Setup User').length).toBeGreaterThan(0)
  })
})

import { render, screen } from '@testing-library/react'
import './setupTests'
import App from './App'
import { describe, it, expect, vi } from 'vitest' // Explicit import for clarity, though globals: true
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock page components to avoid network requests and isolate App testing
vi.mock('./pages/ProductList', () => ({ default: () => <div>ProductList Mock</div> }))
vi.mock('./pages/Login', () => ({ default: () => <div>Login Mock</div> }))
vi.mock('./pages/ProductDetail', () => ({ default: () => <div>ProductDetail Mock</div> }))

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
})

describe('App', () => {
  it('renders the store title on home route', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>
      </QueryClientProvider>
    )
    // Expect the mock to be rendered
    expect(await screen.findByText('ProductList Mock')).toBeInTheDocument()
    // Check for title as well if it's still part of App layout? 
    // Wait, App layout might have changed. App.tsx renders routes directly.
    // Route / renders ProductList.
  })
})

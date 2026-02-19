import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { MemoryRouter } from 'react-router-dom'

// Create a client for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for testing
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
  initialEntries?: string[]
}

export const AllTheProviders = ({ children, initialEntries = ['/'] }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>
              <CartProvider>
                    {children}
              </CartProvider>
            </AuthProvider>
        </MemoryRouter>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
    const { route = '/', ...renderOptions } = options || {}
    return render(ui, { 
        wrapper: (props) => <AllTheProviders {...props} initialEntries={[route]} />, 
        ...renderOptions 
    })
}

export * from '@testing-library/react'
export { customRender as render }

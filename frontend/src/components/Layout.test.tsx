import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Layout from './Layout'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

// Mock CartContext to avoid wrapping complex provider
vi.mock('../context/CartContext', () => ({
  useCart: () => ({ cart: [] }),
  CartProvider: ({ children }: any) => <div>{children}</div>
}))

const renderLayout = (user: any) => {
  return render(
    <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn(), isLoading: false }}>
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Layout Component', () => {
  it('renders Login button when user is null', () => {
    renderLayout(null)
    expect(screen.getByText(/Login/i)).toBeInTheDocument()
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument()
  })

  it('renders Dashboard link when user is logged in', () => {
    renderLayout({ email: 'test@example.com' })
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
  })

  it('renders Admin link when user is superuser', () => {
    renderLayout({ email: 'admin@example.com', is_superuser: true })
    expect(screen.getByText(/Admin/i)).toBeInTheDocument()
  })
})

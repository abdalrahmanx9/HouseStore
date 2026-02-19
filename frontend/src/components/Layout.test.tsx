import { render, screen } from '../test-utils'
import { describe, it, expect, vi, type Mock } from 'vitest'
import Layout from './Layout'
import { useAuth } from '../context/AuthContext'

// Mock CartContext
vi.mock('../context/CartContext', () => ({
  useCart: () => ({ cart: [] }),
  CartProvider: ({ children }: any) => <div>{children}</div>
}))

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: any) => <div>{children}</div>
}))

vi.mock('./SupportWidget', () => ({
    default: () => <div data-testid="support-widget">Support Widget</div>
}))

const renderLayout = (user: any) => {
  (useAuth as Mock).mockReturnValue({
      user,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false
  })
  return render(<Layout />)
}

describe('Layout Component', () => {
  it('renders Login button when user is null', () => {
    renderLayout(null)
    expect(screen.getByText(/Login/i)).toBeInTheDocument()
    expect(screen.queryByText(/My Orders/i)).not.toBeInTheDocument()
  })

  it('renders Dashboard link when user is logged in', () => {
    renderLayout({ email: 'test@example.com' })
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument()
    expect(screen.getByText(/My Orders/i)).toBeInTheDocument()
  })

  it('renders Admin link when user is superuser', () => {
    renderLayout({ email: 'admin@example.com', is_superuser: true })
    expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument()
  })
})

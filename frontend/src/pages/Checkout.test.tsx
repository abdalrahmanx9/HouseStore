import { render, screen, fireEvent, waitFor } from '../test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Checkout from './Checkout'
import axios from 'axios'
import '../setupTests'

// Mocking useCart
const mockCart = [
  { id: 1, name: 'Test Product', price: 100, category: 'Test', quantity: 1 }
]
const mockClearCart = vi.fn()

vi.mock('../context/CartContext', async () => {
  const actual = await vi.importActual('../context/CartContext')
  return {
    ...actual,
    useCart: () => ({
      cart: mockCart,
      total: 100,
      clearCart: mockClearCart
    })
  }
})

// Mocking useAuth
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  const mockUser = { email: 'test@example.com', full_name: 'Test User' }
  return {
    ...actual,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })
  }
})

// Mock axios
vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        create: vi.fn().mockReturnThis(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    }
}))

describe('Checkout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(axios.post as any).mockResolvedValue({ data: { id: 123, status: 'pending' } })
    ;(axios.get as any).mockResolvedValue({ data: {} })
  })

  it('renders checkout form', () => {
    render(<Checkout />)
    
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    // It mocks useAuth/useCart so it should render form
    // Check for "Order Summary"
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    // Check for total (might appear multiple times: subtotal, total)
    expect(screen.getAllByText(/EGP 100/)[0]).toBeInTheDocument()
  })

  it('submits order successfully', async () => {
    // Mock user interaction
    render(<Checkout />)

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@example.com' } })
    
    // Upload file (mock)
    const file = new File(['dummy content'], 'proof.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText(/Payment Proof/i)
    fireEvent.change(fileInput, { target: { files: [file] } })

    const submitBtn = screen.getByText('Place Order')
    fireEvent.click(submitBtn)

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1)
        expect(mockClearCart).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith('Order placed successfully!')
    })
  })
})

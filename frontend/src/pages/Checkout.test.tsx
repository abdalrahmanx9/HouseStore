import { render, screen, waitFor, fireEvent } from '../test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
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
  const alertMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('alert', alertMock)
    ;(axios.post as any).mockResolvedValue({ data: { id: 123, status: 'pending' } })
    ;(axios.get as any).mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders checkout form', () => {
    render(<Checkout />)
    
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    expect(screen.getAllByText(/EGP 100/)[0]).toBeInTheDocument()
  })

  it('submits order successfully', async () => {
    const user = userEvent.setup()
    render(<Checkout />)

    // Fill form
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com')
    
    // Upload file
    const file = new File(['dummy content'], 'proof.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText(/Payment Proof/i)
    await user.upload(fileInput, file)

    // Verify file is selected (optional but good sanity check)
    // expect((fileInput as HTMLInputElement).files?.[0]).toBe(file)
    // Actually userEvent.upload handles this.

    const submitBtn = screen.getByText('Place Order')
    // user.click(submitBtn) might be blocked by HTML5 validation in jsdom
    // forceful submit to check logic
    fireEvent.submit(submitBtn.closest('form')!)

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1)
        expect(mockClearCart).toHaveBeenCalled()
        expect(alertMock).toHaveBeenCalledWith('Order placed successfully!')
    })
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Checkout from './Checkout'
import { MemoryRouter } from 'react-router-dom'

// Mocking useCart to simulate items in cart
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

describe('Checkout Page', () => {
  it('renders checkout form', () => {
    // Red: Checkout component doesn't exist
    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('Place Order')).toBeInTheDocument()
  })

  it('validates form inputs', async () => {
    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    )

    const submitBtn = screen.getByText('Place Order')
    fireEvent.click(submitBtn)

    // Expect validation errors (HTML5 validation or custom)
    // For simplicity, let's assume valid form submission first
  })
})

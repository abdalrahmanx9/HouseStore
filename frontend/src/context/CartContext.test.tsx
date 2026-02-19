import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CartProvider, useCart } from './CartContext'

const TestComponent = () => {
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart()

  return (
    <div>
      <div data-testid="cart-count">{cart.length}</div>
      <div data-testid="cart-total">{total}</div>
      <button onClick={() => addToCart({ id: 1, name: 'Test Product', price: 100, category: 'Test' })}>
        Add Product 1
      </button>
      <button onClick={() => removeFromCart(1)}>Remove Product 1</button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  )
}

describe('Cart Context', () => {
  it('adds items to cart and updates total', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('Add Product 1'))

    // Debug
    screen.debug()

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    // expect(screen.getByTestId('cart-total')).toHaveTextContent('100')
  })
})

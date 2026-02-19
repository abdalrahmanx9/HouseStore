import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '../setupTests'
import Login from './Login'
// import { renderWithProviders } from '../test-utils' # verify path? 
// Actually test-utils is in src/test-utils.tsx, Login is in src/pages/Login.tsx
// So path is '../test-utils'

// Mock window.location for redirect test
const mockAssign = vi.fn()
Object.defineProperty(window, 'location', {
  value: { assign: mockAssign },
  writable: true,
})

describe('Login Page', () => {
  it('renders sign in button', () => {
    render(<Login />)
    const button = screen.getByRole('button', { name: /sign in with google/i })
    expect(button).toBeInTheDocument()
  })

  it('redirects to backend auth on click', () => {
    render(<Login />)
    const button = screen.getByRole('button', { name: /sign in with google/i })
    fireEvent.click(button)
    expect(mockAssign).toHaveBeenCalledWith('http://127.0.0.1:8000/api/v1/auth/login')
  })
})

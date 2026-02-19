import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
// import Dashboard from './Dashboard' - removed
import { AuthProvider, useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import '../setupTests'

// Mock the module
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

describe('Protected Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to login if not authenticated', () => {
    // Setup mock return value
    (useAuth as any).mockReturnValue({ user: null, isLoading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<h1>Login Page</h1>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <h1>Dashboard</h1>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders children if authenticated', () => {
    (useAuth as any).mockReturnValue({ user: { email: 'test@example.com' }, isLoading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
         <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <h1>Dashboard</h1>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

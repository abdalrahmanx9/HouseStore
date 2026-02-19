import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import '../setupTests'
import axios from 'axios'

// Mock axios
vi.mock('axios')

function TestComponent() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>No User</div>
  return <div>User: {user.email}</div>
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches user on mount', async () => {
    // Mock API response
    (axios.get as any).mockResolvedValue({ data: { email: 'test@example.com', name: 'Test User' } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should start with loading
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Should eventually show user
    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument()
    })
  })

  it('handles 401 (not logged in)', async () => {
    (axios.get as any).mockRejectedValue({ response: { status: 401 } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument()
    })
  })
})

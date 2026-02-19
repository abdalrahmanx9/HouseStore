import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import './setupTests' // for jest-dom matchers

describe('App Minimal React', () => {
  it('renders div', () => {
    render(<div>Hello</div>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

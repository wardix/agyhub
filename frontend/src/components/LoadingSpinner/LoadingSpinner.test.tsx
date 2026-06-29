import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSpinner } from './LoadingSpinner'
import styles from './LoadingSpinner.module.css'

describe('LoadingSpinner', () => {
  it('renders default message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<LoadingSpinner message="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('does not render message if empty', () => {
    render(<LoadingSpinner message="" />)
    const container = document.querySelector(`.${styles.container}`)
    expect(container).toBeInTheDocument()
    expect(
      container?.querySelector(`.${styles.message}`),
    ).not.toBeInTheDocument()
  })

  it('applies fullPage class when fullPage prop is true', () => {
    render(<LoadingSpinner fullPage />)
    const container = document.querySelector(`.${styles.container}`)
    expect(container).toHaveClass(styles.fullPage)
  })

  it('does not apply fullPage class when fullPage prop is false', () => {
    render(<LoadingSpinner />)
    const container = document.querySelector(`.${styles.container}`)
    expect(container).not.toHaveClass(styles.fullPage)
  })
})

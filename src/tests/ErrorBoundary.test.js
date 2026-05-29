import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../components/ErrorBoundary.js'

let shouldThrow = true

const MaybeCrashingChild = () => {
  if (shouldThrow) {
    throw new Error('Render exploded')
  }

  return <p>Recovered content</p>
}

afterEach(() => {
  shouldThrow = true
  jest.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('lets the user reset after a render-time crash', async () => {
    const user = userEvent.setup()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <MaybeCrashingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Render exploded')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
  })
})

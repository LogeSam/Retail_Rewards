import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RewardsDashboard } from '../pages/RewardsDashboard.jsx'
import { ClientError, ServerError } from '../services/apiErrors.js'
import { fetchTransactions } from '../services/mockApi.js'
import { MuiTestWrapper } from '../test/MuiTestWrapper.js'

jest.mock('../services/mockApi.js', () => ({
  fetchTransactions: jest.fn(),
}))

const sampleRow = {
  transactionId: 't-int-1',
  customerId: 'c-int-1',
  customerName: 'Test User',
  purchaseDate: '2024-02-15T15:00:00.000Z',
  productPurchased: 'Coat',
  purchaseAmount: 120,
}

const renderDashboard = () =>
  render(<RewardsDashboard />, { wrapper: MuiTestWrapper })

describe('RewardsDashboard', () => {
  beforeEach(() => {
    fetchTransactions.mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows loading then table headers after data loads', async () => {
    let resolveLoad
    fetchTransactions.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve
        }),
    )

    renderDashboard()

    expect(screen.getByText('Loading reward data…')).toBeInTheDocument()

    resolveLoad([sampleRow])

    await waitFor(() => {
      expect(screen.getByText('t-int-1')).toBeInTheDocument()
    })

    expect(
      screen.getByRole('heading', { name: /Customer monthly rewards/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Transaction ID' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('columnheader', { name: /Customer Name/i }),
    ).toHaveLength(3)
    expect(
      screen.getByRole('columnheader', { name: /Purchase Date/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: /Product Purchased/i }),
    ).toBeInTheDocument()
    const purchaseAmountHeader = screen.getByRole('columnheader', {
      name: /Purchase Amount/i,
    })
    expect(purchaseAmountHeader).toBeInTheDocument()
    expect(purchaseAmountHeader).not.toHaveAttribute('title')
    expect(purchaseAmountHeader).toHaveClass('data-table__cell--numeric')
    expect(
      screen.getByRole('columnheader', { name: 'Customer ID' }),
    ).toBeInTheDocument()
    const rewardPointsHeaders = screen.getAllByRole('columnheader', {
      name: /^Reward Points Sort by Reward Points/i,
    })
    expect(rewardPointsHeaders).toHaveLength(2)
    expect(
      rewardPointsHeaders.every((header) =>
        header.classList.contains('data-table__cell--numeric'),
      ),
    ).toBe(true)

    const totalRewardPointsHeader = screen.getByRole('columnheader', {
      name: /^Total Reward Points Sort by Total Reward Points/i,
    })
    expect(totalRewardPointsHeader).toBeInTheDocument()
    expect(totalRewardPointsHeader).not.toHaveAttribute('title')
    expect(totalRewardPointsHeader).toHaveClass('data-table__cell--numeric')
  })

  it('shows error and recovers on retry', async () => {
    const user = userEvent.setup()

    fetchTransactions
      .mockRejectedValueOnce(new ServerError(503))
      .mockResolvedValueOnce([sampleRow])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Customer monthly rewards/i }),
      ).toBeInTheDocument()
    })
  })

  it('hides retry for client errors', async () => {
    fetchTransactions.mockRejectedValueOnce(new ClientError(404))

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByText(/not found/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /try again/i }),
    ).not.toBeInTheDocument()
  })

  it('shows empty state when there are no transactions', async () => {
    fetchTransactions.mockResolvedValue([])

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No transactions')).toBeInTheDocument()
    })
  })
})

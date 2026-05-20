import { describe, expect, it } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../components/DataTable.jsx'
import { MuiTestWrapper } from '../test/MuiTestWrapper.js'

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
]

const numericColumns = [
  { key: 'label', header: 'Label' },
  {
    key: 'points',
    header: 'Reward Points',
    align: 'right',
    sortable: true,
    sortType: 'number',
  },
]

const makeRows = (n) =>
  Array.from({ length: n }, (_, i) => ({
    rowKey: `r-${i}`,
    id: `id-${i}`,
    name: `Name ${i}`,
  }))

const renderTable = (ui) => render(ui, { wrapper: MuiTestWrapper })

describe('DataTable', () => {
  it('hides pagination and shows all rows when total is 10 or fewer', () => {
    const rows = makeRows(10)
    renderTable(
      <DataTable caption="Test table" columns={columns} rows={rows} />,
    )

    expect(screen.queryByRole('navigation', { name: /Test table/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(11)
  })

  it('shows pagination and pages of 10 when total exceeds 10', async () => {
    const user = userEvent.setup()
    const rows = makeRows(11)
    renderTable(
      <DataTable caption="Paged table" columns={columns} rows={rows} />,
    )

    expect(
      screen.getByRole('navigation', { name: /Paged table/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Showing 1–10 of 11/)).toBeInTheDocument()
    expect(screen.getByText('id-0')).toBeInTheDocument()
    expect(screen.queryByText('id-10')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getByText(/Showing 11–11 of 11/)).toBeInTheDocument()
    expect(screen.getByText('id-10')).toBeInTheDocument()
    expect(screen.queryByText('id-0')).not.toBeInTheDocument()
  })

  it('keeps header names tooltip-free and right-aligns numeric columns', () => {
    renderTable(
      <DataTable
        caption="Numeric table"
        columns={numericColumns}
        rows={[{ rowKey: 'r-1', label: 'Sample', points: 42 }]}
      />,
    )

    expect(
      screen.getByRole('columnheader', { name: 'Label' }),
    ).not.toHaveAttribute('title')

    const pointsHeader = screen.getByRole('columnheader', {
      name: /^Reward Points Sort by Reward Points/i,
    })
    expect(pointsHeader).not.toHaveAttribute('title')
    expect(pointsHeader).toHaveClass('data-table__cell--numeric')
    expect(screen.getByRole('cell', { name: '42' })).toHaveClass(
      'data-table__cell--numeric',
    )
  })
})

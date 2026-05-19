import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { ErrorMessage } from '../components/ErrorMessage.jsx'
import { TableSkeleton } from '../components/TableSkeleton.jsx'
import {
  MONTHLY_COLUMNS,
  TOTAL_COLUMNS,
  TRANSACTION_COLUMNS,
} from '../config/rewardTableColumns.jsx'
import { useRewardsData } from '../hooks/useRewardsData.js'
import {
  monthlyRewardShape,
  totalRewardShape,
  transactionShape,
  childrenPropType,
} from '../types/componentTypes.js'
import {
  withMonthlyRowKeys,
  withTotalRowKeys,
  withTransactionRowKeys,
} from '../utils/rewardRows.js'
import '../styles/dashboard.css'

const SKELETON_ROW_COUNT = 10

const TABLE_SECTIONS = [
  {
    id: 'monthly',
    heading: 'Customer monthly rewards',
    caption: 'Monthly reward points by customer',
    columns: MONTHLY_COLUMNS,
    emptyLabel: 'No monthly summaries.',
  },
  {
    id: 'totals',
    heading: 'Total rewards',
    caption: 'Total reward points by customer',
    columns: TOTAL_COLUMNS,
    emptyLabel: 'No customer totals.',
  },
  {
    id: 'transactions',
    heading: 'Transactions',
    caption: 'Transaction history with calculated reward points',
    columns: TRANSACTION_COLUMNS,
    emptyLabel: 'No transactions.',
  },
]

const DashboardHeader = () => (
  <header className="dashboard-header">
    <h1 className="dashboard-title">Retailer Rewards</h1>
    <p className="dashboard-subtitle">
      Customer reward points from purchase transactions.
    </p>
  </header>
)

const DashboardSection = ({ id, title, children }) => (
  <section className="dashboard-section" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="section-title">
      {title}
    </h2>
    {children}
  </section>
)

DashboardSection.propTypes = {
  children: childrenPropType,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

DashboardSection.defaultProps = {
  children: null,
}

const LoadingDashboard = () => (
  <div className="dashboard" aria-busy="true">
    <p className="visually-hidden" role="status">
      Loading reward data…
    </p>
    <DashboardHeader />

    {TABLE_SECTIONS.map((section) => (
      <DashboardSection
        key={section.id}
        id={section.id}
        title={section.heading}
      >
        <TableSkeleton
          caption={section.caption}
          columns={section.columns}
          rowCount={SKELETON_ROW_COUNT}
        />
      </DashboardSection>
    ))}
  </div>
)

const RewardsDashboardView = ({
  isEmpty,
  monthlyRows,
  totalRows,
  transactionRows,
}) => (
  <div className="dashboard">
    <DashboardHeader />

    {isEmpty ? (
      <EmptyState
        title="No transactions"
        description="There are no records to display yet."
      />
    ) : null}

    <DashboardSection id="monthly" title="Customer monthly rewards">
      <DataTable
        caption="Monthly reward points by customer"
        columns={MONTHLY_COLUMNS}
        rows={monthlyRows}
        emptyLabel="No monthly summaries."
      />
    </DashboardSection>

    <DashboardSection id="totals" title="Total rewards">
      <DataTable
        caption="Total reward points by customer"
        columns={TOTAL_COLUMNS}
        rows={totalRows}
        emptyLabel="No customer totals."
      />
    </DashboardSection>

    <DashboardSection id="transactions" title="Transactions">
      <DataTable
        caption="Transaction history with calculated reward points"
        columns={TRANSACTION_COLUMNS}
        rows={transactionRows}
        emptyLabel="No transactions."
      />
    </DashboardSection>
  </div>
)

RewardsDashboardView.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  monthlyRows: PropTypes.arrayOf(monthlyRewardShape).isRequired,
  totalRows: PropTypes.arrayOf(totalRewardShape).isRequired,
  transactionRows: PropTypes.arrayOf(transactionShape).isRequired,
}

export const RewardsDashboard = () => {
  const { transactions, monthlyRewards, totals, loading, error, retry } =
    useRewardsData()

  const monthlyRows = useMemo(() => {
    const extractNum = (id) => {
      const m = String(id).match(/(\d+)$/)
      return m ? Number(m[1]) : NaN
    }

    const sorted = [...monthlyRewards].sort((a, b) => {
      const aNum = extractNum(a.customerId)
      const bNum = extractNum(b.customerId)
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
        return aNum - bNum
      }

      const idCompare = String(a.customerId).localeCompare(String(b.customerId))
      if (idCompare !== 0) return idCompare

      if (a.year !== b.year) return a.year - b.year

      const aMonth = new Date(`${a.month} 1, ${a.year}`).getMonth()
      const bMonth = new Date(`${b.month} 1, ${b.year}`).getMonth()
      return aMonth - bMonth
    })

    return withMonthlyRowKeys(sorted)
  }, [monthlyRewards])

  const totalRows = useMemo(
    () => withTotalRowKeys(totals),
    [totals],
  )

  const transactionRows = useMemo(
    () => withTransactionRowKeys(transactions),
    [transactions],
  )

  if (loading) {
    return <LoadingDashboard />
  }

  if (error) {
    return (
      <div className="dashboard dashboard--centered">
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    )
  }

  return (
    <RewardsDashboardView
      isEmpty={transactions.length === 0}
      monthlyRows={monthlyRows}
      totalRows={totalRows}
      transactionRows={transactionRows}
    />
  )
}

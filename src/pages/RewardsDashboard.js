import PropTypes from "prop-types";
import { DataTable } from "../components/DataTable.js";
import { EmptyState } from "../components/EmptyState.js";
import { ErrorMessage } from "../components/ErrorMessage.js";
import { TableSkeleton } from "../components/TableSkeleton.js";
import {
  MONTHLY_COLUMNS,
  TOTAL_COLUMNS,
  TRANSACTION_COLUMNS,
} from "../config/rewardTableColumns.js";
import { useRewardsData } from "../hooks/useRewardsData.js";
import {
  monthlyRewardShape,
  totalRewardShape,
  transactionShape,
  childrenPropType,
} from "../types/componentTypes.js";
import "../styles/dashboard.css";

const SKELETON_ROW_COUNT = 10;

const TABLE_SECTIONS = [
  {
    id: "monthly",
    heading: "Customer monthly rewards",
    caption: "Monthly reward points by customer",
    columns: MONTHLY_COLUMNS,
  },
  {
    id: "totals",
    heading: "Total rewards",
    caption: "Total reward points by customer",
    columns: TOTAL_COLUMNS,
  },
  {
    id: "transactions",
    heading: "Transactions",
    caption: "Transaction history with calculated reward points",
    columns: TRANSACTION_COLUMNS,
  },
];

const DashboardHeader = () => (
  <header className="dashboard-header">
    <h1 className="dashboard-title">Retailer Rewards</h1>
    <p className="dashboard-subtitle">
      Customer reward points from purchase transactions.
    </p>
  </header>
);

const DashboardSection = ({ id, title, children }) => (
  <section className="dashboard-section" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="section-title">
      {title}
    </h2>
    {children}
  </section>
);

DashboardSection.propTypes = {
  children: childrenPropType,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

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
);

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
    ) : (
      <>
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
      </>
    )}
  </div>
);

RewardsDashboardView.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  monthlyRows: PropTypes.arrayOf(monthlyRewardShape).isRequired,
  totalRows: PropTypes.arrayOf(totalRewardShape).isRequired,
  transactionRows: PropTypes.arrayOf(transactionShape).isRequired,
};

export const RewardsDashboard = () => {
  const { transactions, monthlyRewards, totals, loading, error, retryable, retry } =
    useRewardsData();

  if (loading) {
    return <LoadingDashboard />;
  }

  if (error) {
    return (
      <div className="dashboard dashboard--centered">
        <ErrorMessage message={error} onRetry={retryable ? retry : undefined} />
      </div>
    );
  }

  return (
    <RewardsDashboardView
      isEmpty={transactions.length === 0}
      monthlyRows={monthlyRewards}
      totalRows={totals}
      transactionRows={transactions}
    />
  );
};

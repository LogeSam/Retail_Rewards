import { formatCurrency } from '../utils/formatCurrency.js'
import { formatPurchaseDate } from '../utils/formatDate.js'

const renderPurchaseDate = (row) => formatPurchaseDate(row.purchaseDate)
const renderPurchaseAmount = (row) => formatCurrency(row.purchaseAmount)

export const MONTHLY_COLUMNS = [
  {
    key: 'customerId',
    header: 'Customer ID',
    width: '11%',
  },
  {
    key: 'customerName',
    header: 'Customer Name',
    width: '38%',
    sortable: true,
    sortType: 'string',
  },
  {
    key: 'month',
    header: 'Month',
    width: '15%',
  },
  {
    key: 'year',
    header: 'Year',
    width: '13%',
  },
  {
    key: 'rewardPoints',
    header: 'Reward Points',
    align: 'right',
    width: '23%',
    sortable: true,
    sortType: 'number',
  },
]

export const TOTAL_COLUMNS = [
  {
    key: 'customerName',
    header: 'Customer Name',
    width: '58%',
    sortable: true,
    sortType: 'string',
  },
  {
    key: 'totalRewardPoints',
    header: 'Total Reward Points',
    align: 'right',
    width: '42%',
    sortable: true,
    sortType: 'number',
  },
]

export const TRANSACTION_COLUMNS = [
  {
    key: 'transactionId',
    header: 'Transaction ID',
    width: '13%',
  },
  {
    key: 'customerName',
    header: 'Customer Name',
    width: '20%',
    sortable: true,
    sortType: 'string',
  },
  {
    key: 'purchaseDate',
    header: 'Purchase Date',
    width: '17%',
    sortable: true,
    sortType: 'date',
    render: renderPurchaseDate,
  },
  {
    key: 'productPurchased',
    header: 'Product Purchased',
    width: '28%',
    sortable: true,
    sortType: 'string',
  },
  {
    key: 'purchaseAmount',
    header: 'Purchase Amount',
    align: 'right',
    width: '12%',
    sortable: true,
    sortType: 'number',
    render: renderPurchaseAmount,
  },
  {
    key: 'rewardPoints',
    header: 'Reward Points',
    align: 'right',
    width: '10%',
    sortable: true,
    sortType: 'number',
  },
]

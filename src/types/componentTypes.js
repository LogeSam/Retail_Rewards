import PropTypes from 'prop-types'

export const childrenPropType = PropTypes.node

export const tableColumnShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'right', 'center']),
  render: PropTypes.func,
  sortable: PropTypes.bool,
  sortType: PropTypes.oneOf(['date', 'number', 'string']),
  width: PropTypes.string,
})

export const transactionShape = PropTypes.shape({
  customerId: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  productPurchased: PropTypes.string,
  purchaseAmount: PropTypes.number.isRequired,
  purchaseDate: PropTypes.string.isRequired,
  rewardPoints: PropTypes.number.isRequired,
  rowKey: PropTypes.string.isRequired,
  transactionId: PropTypes.string,
})

export const monthlyRewardShape = PropTypes.shape({
  customerId: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  rewardPoints: PropTypes.number.isRequired,
  rowKey: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
})

export const totalRewardShape = PropTypes.shape({
  customerId: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  rowKey: PropTypes.string.isRequired,
  totalRewardPoints: PropTypes.number.isRequired,
})

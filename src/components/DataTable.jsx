import PropTypes from 'prop-types'
import { DataTableMrt, DATA_TABLE_PAGINATION_THRESHOLD } from './DataTableMrt.jsx'
import { tableColumnShape } from '../types/componentTypes.js'

export { DATA_TABLE_PAGINATION_THRESHOLD }

export const DataTable = ({
  caption,
  columns,
  rows,
  emptyLabel = 'No rows to display.',
  pageSize,
}) => {
  if (rows.length === 0) {
    return (
      <p className="table-empty" role="status">
        {emptyLabel}
      </p>
    )
  }

  return (
    <DataTableMrt
      caption={caption}
      columns={columns}
      rows={rows}
      pageSize={pageSize}
    />
  )
}

DataTable.propTypes = {
  caption: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(tableColumnShape).isRequired,
  emptyLabel: PropTypes.string,
  pageSize: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
}

DataTable.defaultProps = {
  emptyLabel: 'No rows to display.',
  pageSize: undefined,
}

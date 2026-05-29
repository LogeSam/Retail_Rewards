import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { tableColumnShape } from '../types/componentTypes.js'

const resolveColWidths = (columns) => {
  const raw = columns.map((col) => col.width)
  if (!raw.some(Boolean)) {
    return null
  }
  const fallback = `${(100 / columns.length).toFixed(4)}%`
  return raw.map((w) => w ?? fallback)
}

const skeletonBarClass = (variant) => {
  if (variant === 'short') return 'skeleton-bar skeleton-bar--short'
  if (variant === 'medium') return 'skeleton-bar skeleton-bar--medium'
  if (variant === 'narrow') return 'skeleton-bar skeleton-bar--narrow'
  return 'skeleton-bar skeleton-bar--long'
}

export const TableSkeleton = ({
  caption,
  columns,
  rowCount = 10,
}) => {
  const resolvedColWidths = useMemo(
    () => resolveColWidths(columns),
    [columns],
  )

  const tableClassName =
    resolvedColWidths !== null
      ? 'data-table data-table--fixed data-table--skeleton'
      : 'data-table data-table--skeleton'

  const rows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div className="data-table-wrap">
      <div className="table-scroll">
        <table className={tableClassName}>
          <caption className="table-caption">{caption}</caption>
          {resolvedColWidths ? (
            <colgroup>
              {resolvedColWidths.map((width, index) => (
                <col key={columns[index].key} style={{ width }} />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr>
              {columns.map((col) => {
                const numericClass =
                  col.align === 'right' ? 'data-table__cell--numeric' : undefined
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={numericClass}
                  >
                    {col.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowIndex) => (
              <tr key={`skeleton-row-${rowIndex}`}>
                {columns.map((col, colIndex) => {
                  const numericClass =
                    col.align === 'right'
                      ? 'data-table__cell--numeric'
                      : undefined
                  const variant =
                    col.align === 'right'
                      ? 'narrow'
                      : (rowIndex + colIndex) % 3 === 0
                        ? 'short'
                        : (rowIndex + colIndex) % 3 === 1
                          ? 'medium'
                          : 'long'
                  return (
                    <td key={`${rowIndex}-${col.key}`} className={numericClass}>
                      <span className={skeletonBarClass(variant)} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

TableSkeleton.propTypes = {
  caption: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(tableColumnShape).isRequired,
  rowCount: PropTypes.number,
}

TableSkeleton.defaultProps = {
  rowCount: 10,
}

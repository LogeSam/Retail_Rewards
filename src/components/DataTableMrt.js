import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { tableColumnShape } from '../types/componentTypes.js'

export const DATA_TABLE_PAGINATION_THRESHOLD = 10

const DEFAULT_PAGE_SIZE = 10

const cellWidthSx = (width) =>
  width
    ? {
        width,
        maxWidth: width,
        minWidth: 0,
      }
    : { minWidth: 0 }

const headerAlignmentSx = (numeric) =>
  numeric
    ? {
        textAlign: 'right',
        '& .Mui-TableHeadCell-Content': {
          flexDirection: 'row',
          justifyContent: 'flex-end',
        },
        '& .Mui-TableHeadCell-Content-Labels': {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          textAlign: 'right',
          width: '100%',
        },
        '& .Mui-TableHeadCell-Content-Wrapper': {
          textAlign: 'right',
        },
      }
    : {
        textAlign: 'left',
      }

const buildMrtColumns = (columns) =>
  columns.map((col) => {
    const numeric = col.align === 'right'
    const sortable = col.sortable === true
    const sortingFn =
      col.sortType === 'date'
        ? 'datetime'
        : col.sortType === 'number'
          ? 'basic'
          : 'alphanumeric'

    return {
      accessorKey: col.key,
      id: col.key,
      header: col.header,
      enableSorting: sortable,
      sortingFn: sortable ? sortingFn : undefined,
      Cell: ({ row }) =>
        typeof col.render === 'function'
          ? col.render(row.original)
          : row.original[col.key],
      muiTableHeadCellProps: {
        className: numeric ? 'data-table__cell--numeric' : undefined,
        sx: [
          cellWidthSx(col.width),
          {
            ...headerAlignmentSx(numeric),
            '& .MuiTableSortLabel-root': {
              color: 'inherit',
              fontWeight: 600,
            },
            '& .MuiTableSortLabel-icon': {
              color: 'var(--text) !important',
              opacity: '0.35 !important',
            },
            '& .Mui-active .MuiTableSortLabel-icon': {
              opacity: '1 !important',
            },
          },
        ],
      },
      muiTableBodyCellProps: {
        align: numeric ? 'right' : 'left',
        className: numeric ? 'data-table__cell--numeric' : undefined,
        sx: cellWidthSx(col.width),
      },
    }
  })

export const DataTableMrt = ({
  caption,
  columns,
  rows,
  pageSize: pageSizeProp = DEFAULT_PAGE_SIZE,
}) => {
  const total = rows.length
  const showPagination = total > DATA_TABLE_PAGINATION_THRESHOLD
  const resolvedPageSize = showPagination ? pageSizeProp : Math.max(total, 1)

  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    rows,
    pageSize: resolvedPageSize,
    showPagination,
  })

  const mrtColumns = useMemo(() => buildMrtColumns(columns), [columns])

  const pageCount = showPagination
    ? Math.max(1, Math.ceil(total / resolvedPageSize))
    : 1
  const isPaginationCurrent =
    paginationState.rows === rows &&
    paginationState.pageSize === resolvedPageSize &&
    paginationState.showPagination === showPagination
  const pagination = useMemo(
    () => ({
      pageIndex:
        isPaginationCurrent && showPagination
          ? Math.min(paginationState.pageIndex, pageCount - 1)
          : 0,
      pageSize: resolvedPageSize,
    }),
    [
      isPaginationCurrent,
      pageCount,
      paginationState.pageIndex,
      resolvedPageSize,
      showPagination,
    ],
  )

  const table = useMaterialReactTable({
    columns: mrtColumns,
    data: rows,
    getRowId: (row) => String(row.rowKey),
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: showPagination,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableColumnResizing: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enableStickyHeader: false,
    enableSorting: true,
    sortDescFirst: false,
    autoResetPageIndex: true,
    state: { pagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater

      setPaginationState({
        pageIndex: next.pageIndex ?? 0,
        rows,
        pageSize: resolvedPageSize,
        showPagination,
      })
    },
    defaultColumn: {
      muiTableBodyCellProps: {
        sx: {
          borderColor: 'var(--border)',
          borderBottom: '1px solid',
          fontSize: '0.9375rem',
          py: '0.625rem',
          px: '1rem',
        },
      },
      muiTableHeadCellProps: {
        sx: {
          borderColor: 'var(--border)',
          borderBottom: '1px solid',
          backgroundColor: '#f9fafb',
          fontSize: '0.9375rem',
          fontWeight: 600,
          py: '0.625rem',
          px: '1rem',
          whiteSpace: 'normal',
        },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderRadius: 0,
        width: '100%',
      },
    },
    muiTableContainerProps: {
      sx: {
        overflowX: 'auto',
        backgroundColor: 'transparent',
        borderRadius: 0,
      },
    },
    muiTableProps: {
      className: 'data-table data-table--fixed',
      sx: {
        tableLayout: 'fixed',
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9375rem',
      },
    },
    muiTableHeadRowProps: {
      sx: { boxShadow: 'none' },
    },
    muiTableBodyRowProps: {
      hover: true,
      sx: {
        '&:hover': {
          backgroundColor: '#fafbff',
        },
        '&:last-of-type td': {
          borderBottom: 'none',
        },
      },
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const tablePageCount = Math.max(1, table.getPageCount())
  const rangeStart = showPagination ? pageIndex * pageSize + 1 : 1
  const rangeEnd = showPagination
    ? Math.min((pageIndex + 1) * pageSize, total)
    : total

  return (
    <div className="data-table-wrap">
      <div className="table-scroll">
        <p className="table-caption">{caption}</p>
        <MaterialReactTable table={table} />
      </div>

      {showPagination ? (
        <nav
          className="table-pagination"
          aria-label={`Pagination for ${caption}`}
        >
          <p className="table-pagination__summary">
            Showing {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="table-pagination__controls">
            <div
              className="table-pagination__btn-group"
              role="group"
              aria-label="Earlier pages"
            >
              <button
                type="button"
                className="table-pagination__btn table-pagination__btn--icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="First page"
                title="Go to first page"
              >
                <span aria-hidden="true">«</span>
              </button>
              <button
                type="button"
                className="table-pagination__btn table-pagination__btn--icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
                title="Go to previous page"
              >
                <span aria-hidden="true">‹</span>
              </button>
            </div>
            <span className="table-pagination__status" aria-live="polite">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <div
              className="table-pagination__btn-group"
              role="group"
              aria-label="Later pages"
            >
              <button
                type="button"
                className="table-pagination__btn table-pagination__btn--icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
                title="Go to next page"
              >
                <span aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="table-pagination__btn table-pagination__btn--icon"
                onClick={() => table.setPageIndex(tablePageCount - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Last page"
                title="Go to last page"
              >
                <span aria-hidden="true">»</span>
              </button>
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  )
}

DataTableMrt.propTypes = {
  caption: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(tableColumnShape).isRequired,
  pageSize: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
}

DataTableMrt.defaultProps = {
  pageSize: DEFAULT_PAGE_SIZE,
}

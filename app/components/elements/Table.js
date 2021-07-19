import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { default as Base, TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import Pagination from './Pagination';
import map from 'lodash/map';
import get from 'lodash/get';
import noop from 'lodash/noop';
import toUpper from 'lodash/toUpper';
import flatten from 'lodash/flatten';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import isFunction from 'lodash/isFunction';
import styled from 'styled-components';

import i18next from '../../core/language';
const t = i18next.t.bind(i18next);

function descendingComparator(a, b, orderBy) {
  const compA = get(a, orderBy);
  const compB = get(b, orderBy);

  if (compB < compA) return -1;
  return (compB > compA) ? 1 : 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = map(array, (el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return map(stabilizedThis, (el) => el[0]);
}

function filterData(data, fields, queryText, cb) {
  const filteredData = filter([...data], d => {
    let matchesQuery = false;
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      if (includes(toUpper(get(d, field)), toUpper(queryText))) {
        matchesQuery = true;
      }
      if (matchesQuery) break;
    }
    return matchesQuery;
  });

  if (cb) cb(filteredData);

  return filteredData;
}

const StyledTable = styled(Base)`
  .MuiTableCell-head,
  .MuiTableCell-root,
  .MuiTableCell-body {
    color: inherit;
    font-size: inherit;
    font-family: inherit;
  }

  .MuiTableCell-stickyHeader {
    color: inherit;
  }

  .MuiTableSortLabel-root {
    color: inherit;
  }

  .MuiTableRow-root {
    cursor: ${props => (isFunction(props.onClickRow) ? 'pointer' : 'auto')}
  }
`;

export const Table = props => {
  const {
    columns,
    data,
    emptyText,
    id,
    label,
    onFilter,
    rowHover,
    rowsPerPage,
    searchText,
    variant,
    pagination,
    paginationProps,
    ...tableProps
  } = props;

  const [order, setOrder] = useState(props.order || 'asc');
  const [orderBy, setOrderBy] = useState(props.orderBy || columns[0].field);
  const [page, setPage] = React.useState(1);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowClick = (event, datum) => {
    if (isFunction(tableProps.onClickRow)) tableProps.onClickRow(datum);
  };

  const sortedData = stableSort(data, getComparator(order, orderBy));

  const searchFields = filter(
    flatten(map(columns, col => col.searchable && (col.searchBy || col.field))),
    Boolean,
  );

  const filteredData = searchText
    ? filterData(sortedData, searchFields, searchText, onFilter)
    : sortedData;

  const count = Math.ceil(filteredData.length / rowsPerPage);

  const pageIndex = page - 1;
  const pagedData = rowsPerPage && rowsPerPage < filteredData.length
    ? filteredData.slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage)
    : filteredData;

  useEffect(() => {
    setPage(1);
  }, [searchText, filteredData.length, rowsPerPage]);

  return (
    <TableContainer>
      <Box as={StyledTable} id={id} variant={`tables.${variant}`} aria-label={label} {...tableProps}>
        <TableHead>
          <TableRow>
            {map(columns, (col, index) => {
              const InnerCell = col.sortable ? TableSortLabel : 'span';
              const colSortBy = (col.sortBy || col.field);

              return (
                <TableCell
                  id={`${id}-header-${col.field}`}
                  key={`${id}-header-${col.field}`}
                  align={col.align || (index === 0 ? 'left' : 'right')}
                  sortDirection={orderBy === colSortBy ? order : false}
                >
                  <Box
                    as={InnerCell}
                    active={orderBy === colSortBy}
                    direction={orderBy.split('.')[0] === colSortBy ? order : 'asc'}
                    onClick={col.sortable ? createSortHandler(colSortBy) : noop}
                  >
                    {col.title}
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {map(pagedData, (d, rowIndex) => (
            <TableRow
              id={`${id}-row-${rowIndex}`}
              key={`${id}-row-${rowIndex}`}
              hover={rowHover}
              onClick={e => handleRowClick(e, d)}
            >
              {map(columns, (col, index) => (
                <TableCell
                  id={`${id}-row-${rowIndex}-${col.field}`}
                  key={`${id}-row-${rowIndex}-${col.field}`}
                  component={index === 0 ? 'th' : 'td'}
                  scope={index === 0 ? 'row' : undefined}
                  align={col.align || (index === 0 ? 'left' : 'right')}
                  size={get(col, 'size', 'medium')}
                  padding={get(col, 'padding', 'default')}
                >
                  {isFunction(col.render) ? col.render(d) : d[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Box>

      {pagedData.length === 0 && emptyText && <Text p={3} fontSize={1} color="text.primary" textAlign="center">{emptyText}</Text>}

      {pagination && <Pagination
        id={`${id}-pagination`}
        page={page}
        count={count}
        onChange={handlePageChange}
        disabled={count < 2}
        variant="default"
        buttonVariant="paginationLight"
        my={3}
        {...paginationProps}
      />}
    </TableContainer>
  );
};

Table.propTypes = {
  ...TableProps,
  ...BoxProps,
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    align: PropTypes.oneOf(['left', 'right', 'center', 'inherit', 'justify']),
    sortable: PropTypes.bool,
    sortBy: PropTypes.string,
    searchable: PropTypes.bool,
    searchBy: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    render: PropTypes.func,
    size: PropTypes.string,
    padding: PropTypes.string,
  })).isRequired,
  data: PropTypes.array.isRequired,
  emptyText: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClickRow: PropTypes.func,
  onFilter: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  pagination: PropTypes.bool,
  paginationProps: PropTypes.object,
  rowHover: PropTypes.bool,
  rowsPerPage: PropTypes.number,
  searchText: PropTypes.string,
  stickyHeader: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'condensed']),
};

Table.defaultProps = {
  emptyText: t('There are no results to show.'),
  order: 'asc',
  rowHover: true,
  variant: 'default',
  paginationProps: {
    style: { fontSize: '14px' },
  },
};

export default Table;

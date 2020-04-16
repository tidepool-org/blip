import React from 'react';
import PropTypes from 'prop-types';
import { default as Base, TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Box, BoxProps } from 'rebass/styled-components';
import map from 'lodash/map';
import get from 'lodash/get';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import styled from 'styled-components';

function descendingComparator(a, b, orderBy) {
  const compA = get(a, orderBy);
  const compB = get(b, orderBy);

  if (compB < compA) {
    return -1;
  }
  if (compB > compA) {
    return 1;
  }
  return 0;
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

const StyledTable = styled(Base)`
  .MuiTableCell-head,
  .MuiTableCell-root,
  .MuiTableCell-body {
    color: inherit;
    font-size: inherit;
    font-family: inherit;
  }
`;

export const Table = props => {
  const {
    id,
    label,
    columns,
    data,
    rowHover,
    variant,
    ...tableProps
  } = props;

  const [order, setOrder] = React.useState(props.order || 'asc');
  const [orderBy, setOrderBy] = React.useState(props.orderBy || columns[0].field);
  // const [orderByProperty, setOrderByProperty] = React.useState(props.orderByProperty);
  // const [selected, setSelected] = React.useState([]);
  // const [page, setPage] = React.useState(0);
  // const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const sortedData = stableSort(data, getComparator(order, orderBy));

  return (
    <Box as={StyledTable} id={id} variant={`tables.${variant}`} aria-label={label} {...tableProps}>
      <TableHead>
        <TableRow>
          {map(columns, (col, index) => {
            const Cell = col.sortable ? TableSortLabel : 'span';

            return (
              <TableCell
                id={`${id}-header-${col.field}`}
                key={`${id}-header-${col.field}`}
                align={col.align || index === 0 ? 'left' : 'right'}
                sortDirection={orderBy === col.field ? order : false}
              >
                <Box
                  as={Cell}
                  active={orderBy === col.field}
                  direction={orderBy.split('.')[0] === col.field ? order : 'asc'}
                  onClick={col.sortable ? createSortHandler(col.orderBy || col.field) : noop}
                >
                  {col.title}
                </Box>
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {map(sortedData, (d, rowIndex) => (
          <TableRow
            id={`${id}-row-${rowIndex}`}
            key={`${id}-row-${rowIndex}`}
            hover={rowHover}
          >
            {map(columns, (col, index) => (
              <TableCell
                id={`${id}-row-${rowIndex}-${col.field}`}
                key={`${id}-row-${rowIndex}-${col.field}`}
                component={index === 0 ? 'th' : 'td'}
                scope={index === 0 ? 'row' : undefined}
                align={col.align || index === 0 ? 'left' : 'right'}
              >
                {isFunction(col.render) ? col.render(d) : d[col.field]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Box>
  );
};

Table.propTypes = {
  ...TableProps,
  ...BoxProps,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    sortable: PropTypes.bool,
    orderBy: PropTypes.string,
    searchable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array.isRequired,
  rowHover: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'condensed']),
  order: PropTypes.oneOf('asc', 'desc'),
  orderBy: PropTypes.string,
};

Table.defaultProps = {
  variant: 'default',
  order: 'asc',
};

export default Table;

import React from 'react';
import PropTypes from 'prop-types';
import { default as Base, TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Box, BoxProps } from 'rebass/styled-components';
import cx from 'classnames';
import map from 'lodash/map';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import styled from 'styled-components';

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
              >
                <Box as={Cell}>{col.title}</Box>
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {map(data, (d, rowIndex) => (
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
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array.isRequired,
  rowHover: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'condensed']),
};

Table.defaultProps = {
  variant: 'default',
};

export default Table;

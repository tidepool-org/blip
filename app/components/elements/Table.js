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
import styled from 'styled-components';

const StyledTable = styled(Base)`
  .MuiTableCell-head,
  .MuiTableCell-root,
  .MuiTableCell-body {
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
  }
`;

export const Table = props => {
  const {
    id,
    label,
    rows,
    rowHover,
    variant,
    ...tableProps
  } = props;

  return (
    <Box as={StyledTable} id={id} variant={`tables.${variant}`} aria-label={label} {...tableProps}>
      <TableHead>
        <TableRow>
          <TableCell>Dessert (100g serving)</TableCell>
          <TableCell align="right">
            {/* TODO: use custom icon */}
            <TableSortLabel scope="calories" iconSortLabel={undefined}>Calories</TableSortLabel>
          </TableCell>
          <TableCell align="right">Fat&nbsp;(g)</TableCell>
          <TableCell align="right">Carbs&nbsp;(g)</TableCell>
          <TableCell align="right">Protein&nbsp;(g)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {map(rows, (row) => (
          <TableRow hover={rowHover} key={row.name}>
            <TableCell component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="right">{row.calories}</TableCell>
            <TableCell align="right">{row.fat}</TableCell>
            <TableCell align="right">{row.carbs}</TableCell>
            <TableCell align="right">{row.protein}</TableCell>
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
  rowHover: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'condensed']),
};

Table.defaultProps = {
  themeProps: {},
  variant: 'default',
};

export default Table;

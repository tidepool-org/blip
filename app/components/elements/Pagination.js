import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';

import { PaginationProps } from '@material-ui/lab/Pagination';
// import { borders, colors, space } from '../../themes/baseTheme';
import { usePagination } from '@material-ui/lab/Pagination';

const StyledPagination = styled('nav')`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
  }
`;

export const Pagination = props => {
  const { variation, ...itemProps } = props;

  const classNames = cx({
    condensed: variation === 'condensed',
  })

  const { items } = usePagination(itemProps);

  return (
    <StyledPagination>
      <ul className={classNames}>
        {items.map(({ page, type, selected, ...item }, index) => {
          let children;

          if (type === 'start-ellipsis' || type === 'end-ellipsis') {
            children = '…';
          } else if (type === 'page') {
            children = (
              <button type="button" style={{ fontWeight: selected ? 'bold' : null }} {...item}>
                {page}
              </button>
            );
          } else {
            let icon;

            children = (
              <button type="button" {...item}>
                {type === 'previous' && '<'}
                {variation === 'default' && type}
                {type === 'next' && '>'}
              </button>
            );
          }

          return <li key={index}>{children}</li>;
        })}
      </ul>
    </StyledPagination>
  );
  // return <StyledPagination
  //   className={classNames}
  //   renderItem={CustomPaginationItem}
  //   {...props}
  // />;
};

Pagination.propTypes = {
  ...PaginationProps,
  variation: PropTypes.oneOf(['default', 'condensed']),
};

Pagination.defaultProps = {
  variation: 'default',
}

export default Pagination;

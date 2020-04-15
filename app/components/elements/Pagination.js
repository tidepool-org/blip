import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import map from 'lodash/map';
import remove from 'lodash/remove';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import FirstPageRoundedIcon from '@material-ui/icons/FirstPageRounded';
import LastPageRoundedIcon from '@material-ui/icons/LastPageRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import { usePagination, PaginationProps } from '@material-ui/lab/Pagination';

import Button from './Button';
import Icon from './Icon';
import baseTheme from '../../themes/baseTheme';

export const Pagination = props => {
  const { id, variant, themeProps, ...paginationProps } = props;

  const classNames = cx({
    condensed: variant === 'condensed',
  });

  const { items } = usePagination(paginationProps);
  const prevControls = remove(items, ({ type }) => includes(['first', 'previous'], type));
  const nextControls = remove(items, ({ type }) => includes(['next', 'last'], type));

  return (
    <Box as="nav" variant={`paginators.${variant}`} {...themeProps}>
      <ul className={classNames}>
        <li>
          <ul className="prev-controls">
            {map(prevControls, ({ type, ...item }) => (
              <li id={`${id}-${type}`} key={`${id}-${type}`}>
                <Button px={2} variant="pagination" {...item}>
                  {type === 'first' && <Icon variant="static" theme={baseTheme} label="Go to first page" icon={FirstPageRoundedIcon} />}
                  {type === 'previous' && <Icon variant="static" theme={baseTheme} label="Go to previous page" icon={NavigateBeforeRoundedIcon} />}
                  {variant === 'default' && <Text pl={1}>{capitalize(type)}</Text>}
                </Button>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <ul className="pages">
            {map(items, ({ page, type, selected, ...item }) => {
              const pageClassNames = cx({
                selected,
              });

              const itemId = type === 'page' ? `${id}-${page}` : `${id}-${type}`;
              let children;

              if (type === 'start-ellipsis' || type === 'end-ellipsis') {
                children = (
                  <Button disabled className="ellipsis" variant="pagination">
                    <Icon variant="static" theme={baseTheme} label="Ellipsis for skipped pages" icon={MoreHorizRoundedIcon} />
                  </Button>
                );
              } else if (type === 'page') {
                children = (
                  <Button className={pageClassNames} variant="pagination" {...item}>
                    {page}
                  </Button>
                );
              }

              return <li id={itemId} key={itemId}>{children}</li>;
            })}
          </ul>
        </li>
        <li>
          <ul className="next-controls">
            {map(nextControls, ({ type, ...item }) => (
              <li id={`${id}-${type}`} key={`${id}-${type}`}>
                <Button px={2} variant="pagination" {...item}>
                  {variant === 'default' && <Text pr={1}>{capitalize(type)}</Text>}
                  {type === 'next' && <Icon variant="static" theme={baseTheme} label="Go to next page" icon={NavigateNextRoundedIcon} />}
                  {type === 'last' && <Icon variant="static" theme={baseTheme} label="Go to last page" icon={LastPageRoundedIcon} />}
                </Button>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </Box>
  );
};

Pagination.propTypes = {
  id: PropTypes.string.isRequired,
  themeProps: PropTypes.shape(BoxProps),
  ...PaginationProps,
  variant: PropTypes.oneOf(['default', 'condensed']),
};

Pagination.defaultProps = {
  variant: 'default',
};

export default Pagination;

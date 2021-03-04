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
import i18next from '../../core/language';

import Button from './Button';
import Icon from './Icon';
import baseTheme from '../../themes/baseTheme';

const t = i18next.t.bind(i18next);

export const Pagination = props => {
  const { id, variant, buttonVariant, controlLabels, ...paginationProps } = props;

  const classNames = cx({
    condensed: variant === 'condensed',
  });

  const { items } = usePagination(paginationProps);
  const prevControls = remove(items, ({ type }) => includes(['first', 'previous'], type));
  const nextControls = remove(items, ({ type }) => includes(['next', 'last'], type));

  return (
    <Box as="nav" variant={`paginators.${variant}`} {...paginationProps}>
      <ul className={classNames}>
        <li>
          <ul className="prev-controls">
            {map(prevControls, ({ type, ...item }) => (
              <li id={`${id}-${type}`} key={`${id}-${type}`}>
                <Button px={2} variant={buttonVariant} {...item}>
                  {type === 'first' && <Icon variant="static" theme={baseTheme} label="Go to first page" icon={FirstPageRoundedIcon} />}
                  {type === 'previous' && <Icon variant="static" theme={baseTheme} label="Go to previous page" icon={NavigateBeforeRoundedIcon} />}
                  {variant === 'default' && <Text pl={1}>{capitalize(controlLabels[type])}</Text>}
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
                  <Button className={pageClassNames} variant={buttonVariant} {...item}>
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
                <Button px={2} variant={buttonVariant} {...item}>
                  {variant === 'default' && <Text pr={1}>{capitalize(controlLabels[type])}</Text>}
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
  ...PaginationProps,
  ...BoxProps,
  controlLabels: PropTypes.shape({
    first: PropTypes.string.isRequired,
    last: PropTypes.string.isRequired,
    previous: PropTypes.string.isRequired,
    next: PropTypes.string.isRequired,
  }),
  variant: PropTypes.oneOf(['default', 'condensed']),
  buttonVariant: PropTypes.oneOf(['pagination', 'paginationLight']),
};

Pagination.defaultProps = {
  variant: 'default',
  buttonVariant: 'pagination',
  controlLabels: {
    first: t('First'),
    last: t('Last'),
    previous: t('Previous'),
    next: t('Next'),
  },
};

export default Pagination;

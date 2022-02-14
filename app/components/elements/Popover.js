import React from 'react';
import PropTypes from 'prop-types';
import { default as Base, PopoverProps } from '@material-ui/core/Popover';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';

import { borders, radii, shadows, space } from '../../themes/baseTheme';

const StyledPopover = styled(Base)`
  .MuiPopover-paper {
    margin-top: ${space[2]}px;
    margin-bottom: ${space[2]}px;
    border: ${borders.modal};
    box-shadow: ${shadows.large};
    border-radius: ${radii.default}px;
    width: ${({ width }) => width};
    min-width: ${({ minWidth }) => minWidth};
    max-width: calc(100% - ${space[5]}px);
  }
`;

const PopoverContentWrapper = React.forwardRef((props, ref) => (
  <Box {...props} ref={ref} />
));

const Popover = props => {
  const {
    themeProps,
    PaperProps,
    ...popoverProps
  } = props;

  return (
    <StyledPopover
      PaperProps={{ component: PopoverContentWrapper }}
      {...popoverProps}
    />
  );
};

Popover.propTypes = {
  ...PopoverProps,
  themeProps: PropTypes.shape(BoxProps),
};

Popover.defaultProps = {
  width: 'auto',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  keepMounted: true,
};

export default Popover;

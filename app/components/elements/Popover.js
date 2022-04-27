import React from 'react';
import PropTypes from 'prop-types';
import { default as Base, PopoverProps } from '@material-ui/core/Popover';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';

import { borders, radii, shadows, space, fonts } from '../../themes/baseTheme';
import Icon from '../../components/elements/Icon';

const StyledPopover = (Component) => styled(Component)`
  .MuiPopover-paper {
    font-family: ${fonts.default};
    margin-top: ${({ marginTop = `${space[2]}px` }) => marginTop};
    margin-bottom: ${space[2]}px;
    border: ${borders.modal};
    box-shadow: ${({ boxShadow = shadows.large }) => boxShadow};
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
    children,
    closeIcon,
    PaperProps,
    useHoverPopover,
    ...popoverProps
  } = props;

  const [Component, setComponent] = React.useState((Base));

  React.useEffect(() => {
    setComponent(StyledPopover(useHoverPopover ? HoverPopover : Base));
  }, []);

  return (
    <Component
      PaperProps={{ component: PopoverContentWrapper }}
      {...popoverProps}
    >
      {closeIcon && (
        <Icon
          label="close dialog"
          onClick={popoverProps?.onClose}
          icon={CloseRoundedIcon}
          variant="button"
          fontSize={1}
          sx={{
            position: 'absolute !important',
            top: 1,
            right: 1,
          }}
        />
      )}
      {children}
    </Component>
  );
};

Popover.propTypes = {
  ...PopoverProps,
  ...BoxProps,
  useHoverPopover: PropTypes.bool,
  closeIcon: PropTypes.bool,
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

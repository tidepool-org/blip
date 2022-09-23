import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
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
    margin-top: ${({ margintop = `${space[2]}px` }) => margintop};
    margin-bottom: ${space[2]}px;
    border: ${borders.modal};
    box-shadow: ${({ boxshadow = shadows.large }) => boxshadow};
    border-radius: ${radii.default}px;
    width: ${({ width }) => width};
    min-width: ${({ minwidth }) => minwidth};
    max-width: calc(100% - ${space[5]}px);
  }
`;

const PopoverContentWrapper = React.forwardRef((props, ref) => (
  <Box {...props} ref={ref} />
));

const PaperProp = { component: PopoverContentWrapper };

const Popover = props => {
  const {
    children,
    closeIcon,
    PaperProps,
    useHoverPopover,
    minWidth,
    boxShadow,
    marginTop,
    onClickCloseIcon,
    ...popoverProps
  } = props;

  const [Component, setComponent] = React.useState((Base));

  React.useEffect(() => {
    setComponent(StyledPopover(useHoverPopover ? HoverPopover : Base));
  }, [useHoverPopover]);

  return (
    <Component
      PaperProps={PaperProp}
      boxshadow={boxShadow}
      margintop={marginTop}
      minwidth={minWidth}
      {...popoverProps}
    >
      {closeIcon && (
        <Icon
          label="close dialog"
          onClick={() => {
            onClickCloseIcon();
            if (popoverProps?.onClose) popoverProps.onClose();
          }}
          icon={CloseRoundedIcon}
          variant="button"
          fontSize={1}
          sx={{
            position: 'absolute !important',
            top: 1,
            right: 1,
            zIndex: 1,
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
  onClickCloseIcon: PropTypes.func,
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
  onClickCloseIcon: noop,
};

export default Popover;

import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { default as Base, PopoverProps } from '@material-ui/core/Popover';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import styled from '@emotion/styled';
import { Box, BoxProps } from 'theme-ui';

import { borders, radii, shadows, space, fonts } from '../../themes/baseTheme';
import Icon from '../../components/elements/Icon';

const StyledPopover = (Component) => styled(Component)`
  .MuiPopover-paper {
    font-family: ${fonts.default};
    padding: ${({ padding = `${space[2]}px` }) => padding};
    margin-top: ${({ margintop = `${space[2]}px` }) => margintop};
    margin-left: ${({ marginleft = 0 }) => marginleft};
    margin-bottom: ${space[2]}px;
    border: ${({ border = borders.modal }) => border};
    background-color: ${({ backgroundcolor = 'white' }) => backgroundcolor};
    box-shadow: ${({ boxshadow = shadows.large }) => boxshadow};
    border-radius: ${({ borderradius = `${radii.default}px` }) => borderradius};  ;
    width: ${({ width }) => width};
    min-width: ${({ minwidth }) => minwidth};
    max-width: ${({ maxWidth }) => maxWidth || `calc(100% - ${space[5]}px)`};
  }
`;

const PopoverContentWrapper = React.forwardRef((props, ref) => (
  <Box {...props} ref={ref} />
));

const PaperProp = { component: PopoverContentWrapper };

function Popover(props) {
  const {
    children,
    closeIcon,
    PaperProps,
    useHoverPopover,
    minWidth,
    backgroundColor,
    border,
    borderRadius,
    boxShadow,
    marginLeft,
    marginTop,
    onClickCloseIcon,
    padding,
    ...popoverProps
  } = props;

  const [Component, setComponent] = React.useState((Base));

  React.useEffect(() => {
    setComponent(StyledPopover(useHoverPopover ? HoverPopover : Base));
  }, [useHoverPopover]);

  return (
    <Component
      PaperProps={PaperProp}
      backgroundcolor={backgroundColor}
      border={border}
      borderradius={borderRadius}
      boxshadow={boxShadow}
      marginleft={marginLeft}
      margintop={marginTop}
      minwidth={minWidth}
      padding={padding}
      container={() => document.getElementById('dialog-container')}
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
          sx={{
            fontSize: 1,
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
}

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

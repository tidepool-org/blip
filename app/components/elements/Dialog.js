import React from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from 'styled-components';
import { Flex, FlexProps, Box, BoxProps } from 'rebass/styled-components';

import { Icon } from './Icon';

import {
  borders,
  radii,
  space,
  shadows,
} from '../../themes/baseTheme';

/* Dialog Title Start */
export const DialogTitle = props => {
  const {
    children,
    closeIcon,
    onClose,
    ...dialogTitleProps
  } = props;

  return (
    <Flex
      p={3}
      justifyContent="space-between"
      alignItems="center"
      sx={{ borderBottom: props.divider ? borders.divider : 'unset' }}
      {...dialogTitleProps}
    >
      {children}
      {closeIcon && (
        <Icon
          label="close dialog"
          onClick={onClose}
          icon={CloseRoundedIcon}
          variant="button"
          sx={{
            zIndex: 1,
          }}
        />
      )}
    </Flex>
  );
};

DialogTitle.propTypes = {
  ...FlexProps,
  closeIcon: PropTypes.bool,
  divider: PropTypes.bool,
};

DialogTitle.defaultProps = {
  closeIcon: true,
  divider: true,
};
/* Dialog Title End */

/* Dialog Content Start */
const StyledDialogContent = styled(Box)`
  > div:first-child {
    margin-top: 0;
  }

  > div:last-child {
    margin-bottom: 0;
  }
`;

export const DialogContent = props => (
  <StyledDialogContent
    p={3}
    sx={{ borderBottom: props.divider ? borders.divider : 'unset' }}
    {...props}
  />
);

DialogContent.propTypes = {
  ...BoxProps,
  divider: PropTypes.bool,
};

DialogContent.defaultProps = {
  divider: true,
};
/* Dialog Content End */

/* Dialog Actions Start */
const StyledDialogActions = styled(Flex)`
  button {
    margin-left: ${space[2]}px;
  }
`;

export const DialogActions = props => (
  <StyledDialogActions
    justifyContent="flex-end"
    p={3}
    {...props}
  />
);

DialogActions.propTypes = {
  ...FlexProps,
};
/* Dialog Actions End */

/* Dialog Start */
const StyledDialog = styled(MuiDialog)`
  z-index: ${props => (props.zIndex || '1310')} !important;

  .MuiBackdrop-root {
    background-color: rgba(66, 90, 112, 0.81);
  }
  .MuiDialog-paper {
    border: ${borders.modal};
    box-shadow: ${shadows.large};
    border-radius: ${radii.default}px;
  }
`;

export const Dialog = props => <StyledDialog {...props} />;

Dialog.propTypes = {
  ...DialogProps,
  id: PropTypes.string.isRequired,
};

Dialog.defaultProps = {
  keepMounted: true,
};
/* Dialog End */

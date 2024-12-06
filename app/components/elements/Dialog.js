import React from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from '@emotion/styled';
import { Flex, FlexProps, Box, BoxProps } from 'theme-ui';

import { Icon } from './Icon';

import {
  borders,
  radii,
  space,
  shadows,
} from '../../themes/baseTheme';

/* Dialog Title Start */
export function DialogTitle(props) {
  const {
    children,
    closeIcon,
    onClose,
    sx = {},
    ...dialogTitleProps
  } = props;

  const ICON_WIDTH = 28;

  return (
    <Flex
      p={3}
      sx={{ alignItems: 'center', borderBottom: props.divider ? borders.divider : 'unset', ...sx }}
      {...dialogTitleProps}
    >
      <Flex
        // offset by Icon width to ensure Title is properly centered when closeIcon is present
        pl={closeIcon ? ICON_WIDTH : 0}
        mx={[0, 'auto']}
      >
        {children}
      </Flex>
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
}

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

  overflow-y: auto;
`;

export function DialogContent({ sx = {}, ...props }) {
  return <StyledDialogContent
    p={3}
    sx={{ borderBottom: props.divider ? borders.divider : 'unset', ...sx }}
    {...props}
  />;
}

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

  margin-top: 0;
`;

export function DialogActions(props) {
  return <StyledDialogActions
    sx={{ justifyContent: 'flex-end' }}
    p={3}
    {...props}
  />;
}

DialogActions.propTypes = {
  ...FlexProps,
};
/* Dialog Actions End */

/* Dialog Start */
const StyledDialog = styled(MuiDialog)`
  z-index: ${props => (props.zIndex || '1310')} !important;

  &[aria-hidden] {
    z-index: -1 !important;
  }

  .MuiBackdrop-root {
    background-color: rgba(66, 90, 112, 0.81);
  }
  .MuiDialog-paper {
    border: ${borders.modal};
    box-shadow: ${shadows.large};
    border-radius: ${radii.default}px;
  }
`;

export function Dialog(props) {
  return <StyledDialog {...props} container={() => document.getElementById('dialog-container')} />;
}

Dialog.propTypes = {
  ...DialogProps,
  id: PropTypes.string.isRequired,
};

Dialog.defaultProps = {
  keepMounted: true,
};
/* Dialog End */

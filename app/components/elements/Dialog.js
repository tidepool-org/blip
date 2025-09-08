import React from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import styled from '@emotion/styled';
import { Flex, FlexProps, Box, BoxProps, Text } from 'theme-ui';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';

import { Icon } from './Icon';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

import {
  borders,
  breakpoints,
  radii,
  space,
  shadows,
} from '../../themes/baseTheme';

const MOBILE_BREAKPOINT = breakpoints[1];

/* Dialog Title Start */
export function DialogTitle(props) {
  const {
    children,
    closeIcon,
    onBack,
    onClose,
    sx = {},
    ...dialogTitleProps
  } = props;

  return (
    <Flex
      p={3}
      sx={{ overflowX: 'hidden', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', borderBottom: props.divider ? borders.dividerDarkThin : 'unset', ...sx }}
      {...dialogTitleProps}
    >
      <Box sx={{ flexGrow: 1, flexBasis: onBack ? 'auto' : 0, textAlign: 'left' }}>
        {onBack && (
          <Icon
            as={Flex}
            label="dialog back button"
            onClick={onBack}
            icon={ArrowBackRoundedIcon}
            variant="button"
            sx={{
              zIndex: 1,
              position: 'absolute',
              alignItems: 'center',
            }}
          >
            <Text p={1} sx={{ fontWeight: 'medium', fontSize: 2 }}>
              {t('Back')}
            </Text>
          </Icon>
        )}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        {children}
      </Box>

      <Box sx={{ flexGrow: 1, flexBasis: closeIcon ? 'auto' : 0, textAlign: 'right' }}>
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
      </Box>
    </Flex>
  );
}

DialogTitle.propTypes = {
  ...FlexProps,
  closeIcon: PropTypes.bool,
  divider: PropTypes.bool,
  onBack: PropTypes.func,
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

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    // Set main content area to fill the remaining vertical space on the screen
    flex: 1;
  }
`;

export function DialogContent({ sx = {}, ...props }) {
  return <StyledDialogContent
    p={4}
    sx={{
      borderBottom: props.divider ? borders.dividerDarkThin : 'unset',
      [`@media screen and (max-width: ${breakpoints[1]})`]: { minWidth: '100vw' },
      ...sx,
    }}
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
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    gap: 16px;
  }

  button {
    margin-left: ${space[2]}px;

    @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
      margin: 0;
    }
  }

  margin-top: 0;
`;

export function DialogActions(props) {
  return <StyledDialogActions
    sx={{ overflowX: 'hidden', justifyContent: 'flex-end' }}
    px={4}
    py={3}
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

    @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
      border: none;
      margin: 0;
      height: 100%;
      max-height: 100%;
    }
  }

  .MuiDialog-paperWidthSm {
    max-width: ${breakpoints[0]};
  }

  .MuiDialog-paperWidthMd {
    max-width: ${breakpoints[1]};
  }

  .MuiDialog-paperWidthLg {
    max-width: ${breakpoints[2]};
  }

  .MuiDialog-paperWidthXl {
    max-width: ${breakpoints[3]};
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

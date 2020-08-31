import React from 'react';
import PropTypes from 'prop-types';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import { Flex } from 'rebass/styled-components';

import { Body1 } from './FontStyles';
import Icon from './Icon';
import baseTheme from '../../themes/baseTheme';

export const Toast = props => {
  const {
    message,
    onClose,
    open,
    variant,
    ...snackbarProps
  } = props;

  const feedbackIcon = {
    danger: ErrorRoundedIcon,
    info: InfoRoundedIcon,
    warning: WarningRoundedIcon,
    success: CheckCircleRoundedIcon,
  };

  const handleClose = (event, reason) => {
    if (reason !== 'clickaway') onClose();
  };

  return (
    <Snackbar open={open} onClose={handleClose} {...snackbarProps}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className={variant}
        px={3}
        py={2}
        theme={baseTheme}
        variant={`toasts.${variant}`}
      >
        <Flex alignItems="center">
          <Icon className="feedback" label="feedback" icon={feedbackIcon[variant]} />
          <Body1 pl={2} pr={4}>{message}</Body1>
        </Flex>
        <Icon
          className="close"
          icon={CloseRoundedIcon}
          label="close message"
          onClick={onClose}
          variant="button"
        />
      </Flex>
    </Snackbar>
  );
};

Toast.displayName = 'Toast';

Toast.propTypes = {
  ...SnackbarProps,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info']).isRequired,
};

Toast.defaultProps = {
  anchorOrigin: {
    horizontal: 'center',
    vertical: 'top',
  },
  autoHideDuration: 4000,
  variant: 'info',
};

export default Toast;

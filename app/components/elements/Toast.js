import React from 'react';
import PropTypes from 'prop-types';
import Snackbar, { SnackbarProps } from '@material-ui/core/Snackbar';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import { isEmpty } from 'lodash';
import { Flex } from 'theme-ui';

import { Body1 } from './FontStyles';
import Icon from './Icon';
import baseTheme from '../../themes/baseTheme';

export function Toast(props) {
  const {
    action,
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

  return message && !isEmpty(message) ? (
    <Snackbar open={open} onClose={handleClose} {...snackbarProps}>
      <Flex
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        className={variant}
        px={3}
        py={2}
        theme={baseTheme}
        variant={`toasts.${variant}`}
      >
        <Flex sx={{ alignItems: 'center' }} pr={2}>
          <Icon className="feedback" label="feedback" icon={feedbackIcon[variant]} />
          <Body1 pl={2} pr={action ? 2 : 0}>{message}</Body1>
          {action}
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
  ) : null;
}

Toast.displayName = 'Toast';

Toast.propTypes = {
  ...SnackbarProps,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info']).isRequired,
};

Toast.defaultProps = {
  action: null,
  anchorOrigin: {
    horizontal: 'center',
    vertical: 'top',
  },
  autoHideDuration: 4000,
  variant: 'info',
};

export default Toast;

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, Box, FlexProps } from 'theme-ui';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import noop from 'lodash/noop';

import baseTheme from '../../themes/baseTheme';
import Icon from './Icon';
import Button from './Button';

export function Banner(props) {
  const {
    actionText,
    dismissable,
    label,
    message,
    onAction,
    onDismiss,
    title,
    variant,
    ...themeProps
  } = props;

  const iconMap = {
    danger: ErrorRoundedIcon,
    info: InfoRoundedIcon,
    warning: WarningRoundedIcon,
    success: CheckCircleRoundedIcon,
  };

  const TypeIcon = iconMap[variant];

  return (
    <Flex
      aria-label={label}
      variant={`banners.${variant}`}
      sx={{ gap: 3 }}
      {...themeProps}
    >
      <Flex px={2} sx={{ gap: 2, flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon className="icon" theme={baseTheme} variant="static" icon={TypeIcon} label={variant} />
        <Box>
          <Text className="title">{title}</Text>
          <Text className="message">{message}</Text>
        </Box>
        {!!actionText && (
          <Button variant="primaryCondensed" className="action" onClick={onAction}>{actionText}</Button>
        )}
      </Flex>

      {dismissable && (
        <Icon
          className="close-icon"
          icon={CloseRoundedIcon}
          label="Close banner"
          onClick={() => onDismiss()}
        />
      )}
    </Flex>
  );
}

Banner.propTypes = {
  ...FlexProps,
  actionText: PropTypes.string,
  dismissable: PropTypes.bool,
  label: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onAction: PropTypes.func,
  onDismiss: PropTypes.func,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'warning', 'danger', 'success']),
};

Banner.defaultProps = {
  dismissable: true,
  onDismiss: noop,
  onAction: noop,
  variant: 'info',
};

export default Banner;

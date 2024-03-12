import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, FlexProps } from 'rebass/styled-components';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import noop from 'lodash/noop';

import baseTheme from '../../themes/baseTheme';
import Icon from './Icon';
import Button from './Button';

const Banner = (props) => {
  const {
    actionText,
    label,
    variant,
    message,
    dismissable,
    onAction,
    onDismiss,
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
        <Text className="message">{message}</Text>
        {!!actionText && (
          <Button variant="primaryCondensed" className="action" onClick={onAction}>{actionText}</Button>
        )}
      </Flex>

      {dismissable && (
        <Icon
          className="close-icon"
          icon={CloseRoundedIcon}
          label="Close banner"
          onClick={onDismiss()}
        />
      )}
    </Flex>
  );
};

Banner.propTypes = {
  ...FlexProps,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'warning', 'danger', 'success']),
  label: PropTypes.string.isRequired,
  dismissable: PropTypes.bool,
  onAction: PropTypes.func,
  onDismiss: PropTypes.func,
  actionText: PropTypes.string,
};

Banner.defaultProps = {
  variant: 'info',
  dismissable: true,
  onDismiss: noop,
  onAction: noop,
};

export default Banner;

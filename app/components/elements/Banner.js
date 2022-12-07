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

const Banner = (props) => {
  const { label, variant, message, dismissable, onDismiss, ...themeProps } = props;

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
      {...themeProps}
      variant={`banners.${variant}`}
    >
      <Flex px={2} flexGrow={1} alignItems="center" justifyContent="center">
        <Icon mr={2} theme={baseTheme} variant="static" icon={TypeIcon} label={variant} />
        <Text className="message">{message}</Text>
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
  onDismiss: PropTypes.func,
};

Banner.defaultProps = {
  variant: 'info',
  dismissable: true,
  onDismiss: noop,
};

export default Banner;

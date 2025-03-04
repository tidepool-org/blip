import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, Box, Link, FlexProps } from 'theme-ui';
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
    messageLinkText,
    onAction,
    onClickMessageLink,
    onDismiss,
    showIcon,
    title,
    variant,
    ...themeProps
  } = props;

  const iconMap = {
    info: InfoRoundedIcon,
    danger: ErrorRoundedIcon,
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
      <Flex
        px={2}
        sx={{
          gap: 2,
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: ['wrap', 'wrap', 'nowrap'],
        }}>
        {showIcon && TypeIcon && <Icon className="icon" theme={baseTheme} variant="static" icon={TypeIcon} label={variant} sx={{ flexBasis: 0 }} />}
        <Box py={1} sx={{ flexBasis: ['85%', '85%', 'auto'] }}>
          {title && <Text className="title">{title}</Text>}
          <Box className="message">
            <Text className="message-text">{message}</Text>

            {messageLinkText && (
              <>
                &nbsp;
                <Link /* eslint-disable-line jsx-a11y/anchor-is-valid */
                  className="message-link"
                  onClick={onClickMessageLink}
                >
                  {messageLinkText}
                </Link>
              </>
            )}
          </Box>
        </Box>
        {!!actionText && (
          <Flex sx={{ flexBasis: ['100%', '100%', 'auto'], justifyContent: 'center' }}>
            <Button variant="primaryCondensed" className="action" onClick={onAction}>{actionText}</Button>
          </Flex>
        )}
      </Flex>

      {dismissable && (
        <Icon
          className="close-icon"
          icon={CloseRoundedIcon}
          label="Close banner"
          onClick={() => onDismiss()}
          sx={{ alignSelf: ['baseline', 'baseline', 'auto'] }}
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
  messageLinkText: PropTypes.string,
  onAction: PropTypes.func,
  onClickMessageLink: PropTypes.func,
  onDismiss: PropTypes.func,
  showIcon: PropTypes.bool,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['info', 'warning', 'danger', 'success']),
};

Banner.defaultProps = {
  dismissable: true,
  onAction: noop,
  onClickMessageLink: noop,
  onDismiss: noop,
  showIcon: true,
  variant: 'info',
};

export default Banner;

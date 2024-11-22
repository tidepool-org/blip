import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, FlexProps } from 'theme-ui';
import noop from 'lodash/noop';

import baseTheme from '../../themes/baseTheme';
import Icon from '../elements/Icon';
import Button from '../elements/Button';

export function DataConnection(props) {
  const {
    buttonHandler,
    buttonText,
    buttonVariant,
    icon,
    iconLabel,
    label,
    message,
    state,
    ...themeProps
  } = props;

  return (
    <Flex
      aria-label={label}
      sx={{ gap: 3 }}
      {...themeProps}
    >
      <Flex px={2} sx={{ gap: 2, flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        {icon && <Icon className="icon" theme={baseTheme} variant="static" label={iconLabel} icon={icon} />}
        <Text className="message">{message}</Text>
        {buttonHandler && <Button variant="primaryCondensed" className="action" onClick={buttonHandler}>{buttonText}</Button>}
      </Flex>
    </Flex>
  );
};

DataConnection.propTypes = {
  ...FlexProps,
  buttonHandler: PropTypes.func,
  buttonText: PropTypes.string,
  buttonVariant: PropTypes.oneOf(['primary', 'textPrimary']),
  icon: PropTypes.elementType,
  iconLabel: PropTypes.string,
  label: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  stateText: PropTypes.string.isRequired,
};

DataConnection.defaultProps = {};

export default DataConnection;

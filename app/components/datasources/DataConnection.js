import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, FlexProps } from 'theme-ui';

import { default as baseTheme, colors, radii } from '../../themes/baseTheme';
import Icon from '../elements/Icon';
import Button from '../elements/Button';
import { Body0, Body1 } from '../elements/FontStyles';
import { colors as vizColors } from '@tidepool/viz';

export function DataConnection(props) {
  const {
    buttonDisabled,
    buttonIcon,
    buttonHandler,
    buttonProcessing,
    buttonStyle,
    buttonText,
    icon,
    iconLabel,
    label,
    logoImage,
    logoImageLabel,
    messageColor,
    messageText,
    stateColor,
    stateText,
    ...themeProps
  } = props;

  const buttonStyles = {
    solid: {
      px: 3,
      py:'10px',
      sx: { bg: 'white', borderRadius: radii.input, fontSize: 1, fontWeight: 'medium' },
    },
    text: {
      px: 3,
      py:'10px',
      sx: { textDecoration: 'underline', fontSize: 1, fontWeight: 'medium' },
    },
    staticText: {
      px: 3,
      py:'10px',
      sx: { textDecoration: 'none', fontSize: 1, fontWeight: 'medium', pointerEvents: 'none', color: `${colors.grays[5]} !important` },
    },
    hidden: {
      sx: { display: 'none' },
    },
  };

  return (
    <Flex
      aria-label={label}
      className="data-connection"
      p={2}
      sx={{
        alignItems: 'center',
        borderRadius: radii.default,
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        bg: vizColors.blue00,
        flexWrap: ['wrap', null, 'nowrap']
      }}
      {...themeProps}
    >
      <Flex sx={{ order: 1 }}>
        {logoImage && <Icon className="icon" theme={baseTheme} variant="static" label={logoImageLabel} iconSrc={logoImage} />}
      </Flex>

      {(stateText || messageText) && <Flex
        className="state"
        sx={{
          alignItems: 'center',
          borderTop: [`1px solid ${colors.border.dividerDark}`, null, 'none'],
          pt: [1, null, 0],
          gap: [2, null, 1],
          justifyContent: 'space-between',
          order: [3, null, 2],
          width: ['100%', null, 'auto'],
          flexGrow: 1,
        }}
      >
        {icon && <Icon className="state-icon" theme={baseTheme} variant="static" label={iconLabel} icon={icon} sx={{ color: stateColor, fontSize: 3 }} />}

        <Box as="span" pr={2} sx={{ flexGrow: 1, display: 'inline-block', alignItems: 'center' }}>
          <Body1
            as="strong"
            className="state-text"
            sx={{ display: 'inline', fontWeight: 'bold', color: stateColor }}
          >
            {stateText}
          </Body1>

          {messageText && <Body0
            as="em"
            className="state-message"
            sx={{ color: messageColor, display: 'inline', fontWeight: 'medium' }}
          >
            {` - ${messageText}`}
          </Body0>}
        </Box>
      </Flex>}

      <Box sx={{ order: [2, null, 3] }}>
        {buttonHandler && <Button
          variant="textPrimary"
          {...buttonStyles[buttonStyle]}
          className="action"
          icon={buttonIcon}
          iconPosition="left"
          onClick={buttonHandler}
          processing={buttonProcessing}
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>}
      </Box>
    </Flex>
  );
};

DataConnection.propTypes = {
  ...FlexProps,
  buttonDisabled: PropTypes.bool,
  buttonIcon: PropTypes.elementType,
  buttonHandler: PropTypes.func,
  buttonProcessing: PropTypes.bool,
  buttonStyle: PropTypes.oneOf(['solid', 'text', 'staticText', 'hidden']),
  buttonText: PropTypes.string,
  icon: PropTypes.elementType,
  iconLabel: PropTypes.string,
  label: PropTypes.string.isRequired,
  logoImage: PropTypes.elementType,
  logoImageLabel: PropTypes.string.isRequired,
  messageColor: PropTypes.string.isRequired,
  messageText: PropTypes.string.isRequired,
  stateColor: PropTypes.string.isRequired,
  stateText: PropTypes.string.isRequired,
};

DataConnection.defaultProps = {};

export default DataConnection;

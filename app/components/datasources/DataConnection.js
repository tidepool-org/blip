import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, FlexProps } from 'theme-ui';

import { default as baseTheme, colors, radii } from '../../themes/baseTheme';
import Icon from '../elements/Icon';
import Button from '../elements/Button';
import { Body0, Body1 } from '../elements/FontStyles';

export function DataConnection(props) {
  const {
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
  };

  return (
    <Flex
      aria-label={label}
      p={2}
      sx={{
        alignItems: 'center',
        borderRadius: radii.default,
        justifyContent: 'space-between',
        gap: 3,
        width: '100%',
        bg: '#F0F5FF',
      }}
      {...themeProps}
    >
      <Flex px={2} sx={{ gap: 2, flexGrow: 1, flexWrap: ['wrap', null, 'nowrap'], alignItems: 'center', justifyContent: 'flex-start' }}>
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
            justifyContent: 'flex-start',
            order: [3, null, 2],
            width: ['100%', null, 'auto'],
          }}
        >
          {icon && <Icon className="state-icon" theme={baseTheme} variant="static" label={iconLabel} icon={icon} sx={{ color: stateColor, fontSize: 3 }} />}

          <Box>
            <Body1
              as="strong"
              className="state-text"
              pt="0.25em"
              mr="0.25em"
              sx={{ display: 'inline-block', fontWeight: 'bold', color: stateColor }}
            >
              {stateText}
            </Body1>

            {messageText && <Body0
              as="em"
              className="message"
              pt=".25em"
              sx={{ color: messageColor, display: 'inline', fontWeight: 'medium' }}
            >
              {`- ${messageText}`}
            </Body0>}
          </Box>
        </Flex>}

        <Box sx={{ flexGrow: 1, justifyItems: 'flex-end', order: [2, null, 3] }}>
          {buttonHandler && <Button
            variant="textPrimary"
            {...buttonStyles[buttonStyle]}
            className="action"
            onClick={buttonHandler}
            processing={buttonProcessing}
          >
            {buttonText}
          </Button>}
        </Box>
      </Flex>
    </Flex>
  );
};

DataConnection.propTypes = {
  ...FlexProps,
  buttonHandler: PropTypes.func,
  buttonProcessing: PropTypes.bool,
  buttonStyle: PropTypes.oneOf(['solid', 'text']),
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

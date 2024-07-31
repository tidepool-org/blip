import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box, FlexProps } from 'theme-ui';

import Button from './Button';

export function HoverButton(props) {
  const {
    children,
    hideChildrenOnHover,
    onClick,
    buttonText,
    buttonProps,
    ...wrapperProps
  } = props;

  const hoverStyles = !buttonProps.onClick ? {} : {
    button: {
      pointerEvents: 'initial',
      display: 'block',
    },
    '.wrappedContent': {
      width: hideChildrenOnHover ? 0 : 'auto',
      display: hideChildrenOnHover ? 'none' : 'block',
    },
  };

  return (
    <Flex
      sx={{
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 2,
        button: {
          display: 'none',
          pointerEvents: 'none',
        },
        ':hover': hoverStyles,
      }}
      {...wrapperProps}
    >
      <Box className="wrappedContent">
        {children}
      </Box>
      <Box>
        <Button {...buttonProps}>
          {buttonText}
        </Button>
      </Box>
    </Flex>
  );
}

HoverButton.propTypes = {
  ...FlexProps,
  buttonText: PropTypes.string,
  buttonProps: PropTypes.shape({ ...Button.propTypes }),
  onClick: PropTypes.func,
  hideChildrenOnHover: PropTypes.bool,
};

HoverButton.defaultProps = {
  buttonProps: {},
  hideChildrenOnHover: false,
};

export default HoverButton;

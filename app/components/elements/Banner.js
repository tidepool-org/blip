import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, BoxProps } from 'rebass/styled-components';

const Banner = (props) => {
  const { label, variant, message, ...themeProps } = props;

  return (
    <Box
      variant={`banners.${variant}`}
      aria-label={label}
      {...themeProps}
    >
      {props.children}
      <Text className="message">{message}</Text>
    </Box>
  );
};

Banner.propTypes = {
  ...BoxProps,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'warning', 'danger']),
  label: PropTypes.string.isRequired,
};

Banner.defaultProps = {
  message: 'Doggo floofer pat pat mlem',
  variant: 'default',
  label: 'banner',
};

export default Banner;

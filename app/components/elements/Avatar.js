import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, BoxProps } from 'rebass/styled-components';

const Avatar = (props) => {
  const { label, variant, initials, ...themeProps } = props;

  return (
    <Box
      variant={`avatars.${variant}`}
      aria-label={label}
      {...themeProps}
    >
      <Text className="initials">{initials}</Text>
    </Box>
  );
};

Avatar.propTypes = {
  initials: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'inverse']),
  label: PropTypes.string.isRequired,
};

Avatar.defaultProps = {
  ...BoxProps,
  variant: 'default',
  label: 'avatar',
};

export default Avatar;

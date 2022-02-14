import React from 'react';
import { Box, BoxProps } from 'rebass/styled-components';
import { colors, radii } from '../../themes/baseTheme';

const NotificationIcon = props => (
  <Box
    className="notification-icon"
    ml={2}
    bg={colors.pinks[5]}
    width="8px"
    height="8px"
    sx={{
      borderRadius: radii.full,
    }}
    {...props}
  />
);

NotificationIcon.propTypes = {
  ...BoxProps,
};

export default NotificationIcon;

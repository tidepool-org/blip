import React from 'react';
import { Box, BoxProps } from 'theme-ui';
import { colors, radii } from '../../themes/baseTheme';

function NotificationIcon(props) {
  return <Box
    className="notification-icon"
    ml={2}
    bg={colors.pinks[5]}
    width="8px"
    height="8px"
    sx={{
      borderRadius: radii.full,
    }}
    {...props}
  />;
}

NotificationIcon.propTypes = {
  ...BoxProps,
};

export default NotificationIcon;

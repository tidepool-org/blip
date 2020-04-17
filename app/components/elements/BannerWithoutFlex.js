import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, BoxProps } from 'rebass/styled-components';
import CloseIcon from '@material-ui/icons/Close';

const Banner = (props) => {
  const { label, variant, message, dismissable, ...themeProps } = props;
  let close = null;

  if (dismissable) {
    close = (
      <span style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 0,
      }}>
        <CloseIcon style={{ fontSize: 14, float: 'right' }} />
      </span>
    );
  }

  return (
    <Box
      variant={`banners.${variant}`}
      aria-label={label}
      {...themeProps}
    >
      {props.children}
      <Text className="message">{message}</Text>
      {close}
    </Box>
  );
};

Banner.propTypes = {
  ...BoxProps,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'warning', 'danger']),
  label: PropTypes.string.isRequired,
  dismissable: PropTypes.bool,
};

Banner.defaultProps = {
  message: 'Doggo floofer pat pat mlem',
  variant: 'default',
  label: 'banner',
  dismissable: false,
};

export default Banner;

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Flex, Text, Box, BoxProps } from 'rebass/styled-components';
import CloseIcon from '@material-ui/icons/Close';
import cx from 'classnames';

const StyledFlex = styled(Flex)`
  .closed {
    display: none;
  }
`;

const Banner = (props) => {
  const { label, variant, message, dismissable, ...themeProps } = props;
  let close = null;

  const classNames = cx({ closed });

  if (dismissable) {
    close = (
      <Box width={'3%'} px={0}>
        <span style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: 0,
        }}>
          <CloseIcon style={{ fontSize: 14 }} />
        </span>
      </Box>
    );
  }

  return (
    <StyledFlex
      className={classNames}
      aria-label={label}
      {...themeProps}
      variant={`banners.${variant}`}>
      <Box width={'97%'} sx={{ display: 'flex', justifyContent: 'center' }}>
        {props.children}
        <Text className="message">{message}</Text>
      </Box>
      {close}
    </StyledFlex>
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

import React from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps, Flex, Image } from 'theme-ui';
import noop from 'lodash/noop';

import { Body1, Title } from '../FontStyles';

export function Container(props) {
  const { onClick, title, subtitle, bannerImage, children, variant, ...themeProps } = props;

  return (
    <Box
      onClick={onClick}
      variant={variant}
    >
      {bannerImage && (
        <Flex className="card-banner-image">
          <Image
            src={bannerImage}
            sx={{
              width: '100%',
              height: '100%',
              margin: '0 auto',
              maxHeight: '100%',
              maxWidth: '796px',
              objectFit: 'cover',
              objectPosition: '50% 50%',
            }}
          />
        </Flex>
      )}

      <Box className="card-content">
        {!!title && (
          <Title
            className="card-title"
            sx={{
              mb: !!subtitle ? 1 : 0,
              color: 'text.primary',
              fontSize: 3,
              fontWeight: 'medium',
            }}
          >
            {title}
          </Title>
        )}

        {!!subtitle && (
          <Body1
            className="card-subtitle"
            sx={{
              mt: !!title ? 0 : 4,
              color: 'text.primary',
              fontWeight: 'medium',
            }}
          >
            {subtitle}
          </Body1>
        )}

        {!!children && (
          <Box
            className="card-body"
            mt={2}
            {...themeProps}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}

Container.propTypes = {
  ...BoxProps,
  bannerImage: PropTypes.elementType,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['containers.card', 'containers.cardHorizontal'])
};

Container.defaultProps = {
  variant: 'containers.card',
  bannerImage: true,
  onClick: noop,
};

export default Container;

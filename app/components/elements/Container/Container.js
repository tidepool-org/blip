import React from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps, Image, Text } from 'rebass/styled-components';
import BannerImage from './ContainerBanner.png';

const Container = (props) => {
  const { variant, title, subtitle, bannerImage, children, ...themeProps } = props;

  return (
    <Box
      variant={`containers.${variant}`}
    >
      {!!BannerImage && (
        <Box className="container-banner-image">
          <Image
            src={BannerImage}
            sx={{
              width: '100%',
              height: ['48px', '72px', '96px'],
              objectFit: ['cover', null, 'none'],
              objectPosition: '50% 0%',
            }}
          />
        </Box>
      )}

      {!!title && (
        <Text sx={{
          my: 2,
          color: 'text.primary',
          fontSize: 4,
          fontWeight: 'medium',
          lineHeight: 2,
          width: '100%',
          textAlign: 'center',
        }}>
          {title}
        </Text>
      )}

      {!!subtitle && (
        <Text sx={{
          my: 1,
          color: 'text.primary',
          fontSize: 2,
          fontWeight: 'medium',
          lineHeight: 2,
          width: '100%',
          textAlign: 'center',
        }}>
          {subtitle}
        </Text>
      )}

      <Box className="container-body" {...themeProps}>
        {children}
      </Box>
    </Box>
  );
};

Container.propTypes = {
  ...BoxProps,
  variant: PropTypes.oneOf([
    'fluid',
    'fluidRounded',
    'fluidBordered',
    'large',
    'largeBordered',
    'medium',
    'mediumBordered',
    'small',
    'smallBordered',
    'extraSmall',
    'extraSmallBordered',
  ]),
  bannerImage: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Container.defaultProps = {
  variant: 'fluid',
  bannerImage: BannerImage,
};

export default Container;

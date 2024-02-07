import React from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps, Flex, Image, Text } from 'rebass/styled-components';
import map from 'lodash/map';

import BannerImage from './ContainerBanner.png';
import Button from '../Button';
import { borders } from '../../../themes/baseTheme';

const Container = (props) => {
  const { variant, title, subtitle, bannerImage, children, actions, sx, ...themeProps } = props;

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
          mt: 4,
          mb: !!subtitle ? 0 : 2,
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
          mt: !!title ? 0 : 4,
          mb: 2,
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

      <Box
        className="container-body"
        {...themeProps}
      >
        {children}
      </Box>
      {actions.length && (
        <Flex
          className="container-actions"
          sx={{
            gap: 2,
            borderTop: borders.input,
            justifyContent: ['center', 'flex-end'],
          }}
          {...themeProps}
        >
          {map(actions, buttonProps => <Button {...buttonProps} />)}
        </Flex>
      )}
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

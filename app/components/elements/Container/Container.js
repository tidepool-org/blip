import React from 'react';
import PropTypes from 'prop-types';
import { Box, BoxProps, Flex, Image, Text } from 'theme-ui';
import { useSelector } from 'react-redux';
import get from 'lodash/get';
import map from 'lodash/map';

import ClinicianBannerImage from './ClinicianBanner.png';
import PersonalBannerImage from './PersonalBanner.png';
import Button from '../Button';
import { borders } from '../../../themes/baseTheme';
import personUtils from '../../../core/personutils';

export function Container(props) {
  const { variant, title, subtitle, showBannerImage, children, actions, sx, ...themeProps } = props;
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const user = get(allUsersMap, loggedInUserId);

  const BannerImage = personUtils.isClinicianAccount(user)
    ? ClinicianBannerImage
    : PersonalBannerImage;

  return (
    <Box
      variant={`containers.${variant}`}
    >
      {showBannerImage && (
        <Flex
          className="container-banner-image"
          sx={{
            bg: '#E6E9FF',
            height: ['64px', '86px', '102px'],
          }}
        >
          <Image
            src={BannerImage}
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

      {!!title && (
        <Text
          className="container-title"
          sx={{
            mt: 4,
            mb: !!subtitle ? 0 : 2,
            color: 'text.primary',
            fontSize: 4,
            fontWeight: 'medium',
            lineHeight: 2,
            width: '100%',
            textAlign: 'center',
            display: 'inline-block',
          }}
        >
          {title}
        </Text>
      )}

      {!!subtitle && (
        <Text
          className="container-subtitle"
          sx={{
            mt: !!title ? 0 : 4,
            mb: 2,
            color: 'text.primary',
            fontSize: 2,
            fontWeight: 'medium',
            lineHeight: 2,
            width: '100%',
            textAlign: 'center',
            display: 'inline-block',
          }}
        >
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
          p={3}
          sx={{
            gap: 2,
            borderTop: borders.input,
            justifyContent: ['center', 'flex-end'],
          }}
        >
          {map(actions, buttonProps => <Button {...buttonProps} />)}
        </Flex>
      )}
    </Box>
  );
}

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
  showBannerImage: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Container.defaultProps = {
  variant: 'fluid',
  showBannerImage: true,
};

export default Container;

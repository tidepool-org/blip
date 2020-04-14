import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Text } from 'rebass/styled-components';
import {
  // colors,
  fonts,
  fontSizes,
  fontWeights } from '../../themes/baseTheme';

const StyledAvatar = styled.div`
  display: flex;
  height: 32px;
  width: 32px;
  border-radius: 9999px;
  justify-content: center;
  align-items: center;
  `;
  // background-color: ${colors.purpleMedium}

const Initials = styled(Text)`
  font-family: ${fonts.default};
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
`;

const Avatar = (props) => {
  const { label, variant, initials } = props;

  return (
    <StyledAvatar
      variant={`avatars.${variant}`}
      aria-label={label}>
      <Initials>{initials}</Initials>
    </StyledAvatar>
  );
};

Avatar.propTypes = {
  initials: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'blue']),
  label: PropTypes.string.isRequired,
};

Avatar.defaultProps = {
  initials: 'JJ',
  variant: 'default',
  label: 'avatar',
};

export default Avatar;

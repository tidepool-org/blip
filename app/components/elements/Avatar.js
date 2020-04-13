import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Text } from 'rebass/styled-components';
import {
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

const Initials = styled(Text)`
  font-family: ${fonts.default};
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
`;

const Avatar = (props) => {
  const { bgColor, initials, textColor, label } = props;

  return (
    <StyledAvatar
      style={{ backgroundColor: bgColor, color: textColor }}
      aria-label={label}>
      <Initials>{initials}</Initials>
    </StyledAvatar>
  );
};

Avatar.propTypes = {
  initials: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

Avatar.defaultProps = {
  initials: 'JJ',
  bgColor: '#617DFF',
  textColor: '#FFFFFF',
  label: 'avatar',
};

export default Avatar;

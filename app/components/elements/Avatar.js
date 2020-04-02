import React from 'react';

import styled from 'styled-components';
import { Text } from 'rebass/styled-components';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights } from '../../themes/baseTheme';

const StyledAvatar = styled.div`
  background-color: #FAE2E2;
  display: flex;
  height: 32px;
  width: 32px;
  border-radius: 9999px;
  justify-content: center;
  align-items: center;
`;

const Initials = styled(Text)`
  color: ${colors.text.primary};
  font-family: ${fonts.default};
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
`;

const Avatar = (props) => {
  const { initials } = props;

  return (
    <StyledAvatar><Initials>{initials}</Initials></StyledAvatar>
  );
};

export default Avatar;

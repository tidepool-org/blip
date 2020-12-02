import React from 'react';
import styled from 'styled-components';

import logoSrc from './images/tidepool-logo-880x96.png'

const StyledLogo = styled.div`
  text-align: center;
  padding-top: 40px;
  img {
    height: 27px;
    @media(min-width: 512px) {
      height: 45px;
    }
  }
`;

export const LoginLogo = () => {
  return (
    <StyledLogo>
      <a href="/">
        <img src={logoSrc} alt="Tidepool" />
      </a>
    </StyledLogo>
  )
};

export default LoginLogo;

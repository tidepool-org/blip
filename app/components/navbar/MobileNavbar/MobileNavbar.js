import React from 'react';
import styled from '@emotion/styled';
import { Flex } from 'theme-ui';
import logo from '../images/tidepool-mobile.png';
import Header from './Header';
import Menu from './Menu';

const Logo = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 6px;
`;

const Container = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  height: '60px';
`;

const MobileNavbar = ({ api, trackMetric }) => {

  return (
    <Container>
      <Logo src={logo} alt="Tidepool"></Logo>
      <Header />
      <Menu />
    </Container>
  );
};

export default MobileNavbar;
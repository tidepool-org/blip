import React from 'react';
import styled from '@emotion/styled';
import { Flex } from 'theme-ui';
import logo from '../images/tidepool-t-icon.png';
import Title from './Title';
import Menu from './Menu';

const LOGO_SIZE = '34px';

const Logo = styled.img`
  width: ${LOGO_SIZE};
  height: ${LOGO_SIZE};
  border-radius: 6px;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: ${LOGO_SIZE} 1fr ${LOGO_SIZE};
  align-items: center;
  height: 56px;
  margin: 0 8px;
`;

const MobileNavbar = ({ api, trackMetric }) => {
  return (
    <Container>
      <Logo src={logo} alt="Tidepool"></Logo>
      <Title />
      <Menu api={api} trackMetric={trackMetric} />
    </Container>
  );
};

export default MobileNavbar;

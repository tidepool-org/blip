import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';

import Back from './Back';
import Name from './Name';
import DemographicInfo from './DemographicInfo';
import { isClinicianAccount } from '../../core/personutils';
import { useSelector } from 'react-redux';
import { mapStateToProps } from '../../pages/app/app';
import Data from './MenuOptions/Data';
import Profile from './MenuOptions/Profile';
import Share from './MenuOptions/Share';
import Upload from './MenuOptions/Upload';

const MenuOptions = ({ children }) => <Flex sx={{ ml: 'auto', columnGap: 32 }}>{children}</Flex>

const HeaderContainer = ({ children }) => (
  <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%'] }}>
    <Flex id="navPatientHeader" px={4} py={3} 
      sx={{
        columnGap: 5,
        flexWrap: 'wrap',
        justifyContent: ['center', 'space-between'],
        alignItems: 'center',
        rowGap: 2,
      }}
    >
      {children}
    </Flex>
  </Box>
);

const NavPatientHeader = () => {
  const { patient, user } = useSelector(mapStateToProps);

  if (!patient?.profile) return null;

  return (
    <div className="nav-patient-header">
      <HeaderContainer>
        { isClinicianAccount(user)
          ? <>
              <Back />
              <Name />
              <DemographicInfo />
              <MenuOptions>
                <Data />
                <Profile />
                <Upload />
              </MenuOptions>
            </>
          : <>
              <Name />
              <MenuOptions>
                <Data />
                <Profile />
                <Share />
                <Upload />
              </MenuOptions>
            </>
        }
      </HeaderContainer>
    </div>
  );
}

export default NavPatientHeader;
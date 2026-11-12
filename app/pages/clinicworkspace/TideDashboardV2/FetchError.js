import React from 'react';
import { Flex } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import * as ErrorMessages from '../../../redux/constants/errorMessages';

const FetchError = () => (
  <>
    <FilterByCategory />
    <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
      {ErrorMessages.ERR_FETCHING_TIDE_DASHBOARD_PATIENTS}
    </Flex>
  </>
);

export default FetchError;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageControls from '../components/PageControls';
import PatientCount from '../components/PatientCount';
import { Grid, Flex } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import { setOffset } from './tideDashboardSlice';

import { LIMIT } from './useTideDashboardPatients';

const PaginationController = ({ total }) => {
  const dispatch = useDispatch();
  const offset = useSelector(state => state.blip.tideDashboard.offset);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  return (
    <Grid sx={{ gridTemplateColumns: '1fr 2fr 1fr', borderBottom: `1px solid ${vizColors.gray10}` }}>
      <Flex sx={{ alignItems: 'flex-end', padding: '0 0 24px 12px' }}>
        <PatientCount offset={offset} limit={LIMIT} total={total} />
      </Flex>
      <Flex pb={4} sx={{ maxWidth: '640px', justifyContent: 'center', margin: '0 auto' }}>
        <PageControls
          limit={LIMIT}
          total={total}
          offset={offset}
          onOffsetChange={handleChangeOffset}
        />
      </Flex>
    </Grid>
  )
};

export default PaginationController;

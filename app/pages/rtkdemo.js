import React from 'react';
import { Box, Button, Grid, Flex } from 'theme-ui';

import { RTKQueryApi } from '../redux/api/baseApi';

const demoApi = RTKQueryApi.injectEndpoints({
  endpoints: (build) => ({
    patients: build.query({
      query: () => '/patients',
    }),
  }),
});

const { useLazyPatientsQuery } = demoApi;

const RTKDemo = () => {
  const [fetchPatients, { data, isFetching, isLoading, reset }] = useLazyPatientsQuery();

  return (
    <Grid sx={{ margin: '48px', gridTemplateColumns: '320px 1fr', width: '1024px', margin: '0 auto' }}>
      <Flex sx={{ flexDirection: 'column', gap: 4 }}>
        <Button onClick={() => fetchPatients()}>GET patients</Button>
        <Button onClick={reset}>Clear</Button>

        <Box>isFetching: {String(isFetching)}</Box>

        <Box>isLoading: {String(isLoading)}</Box>
      </Flex>

      <textarea
        style={{ width: '100%', height: '640px' }}
        value={data ? JSON.stringify(data, null, 2): ''}
      ></textarea>
    </Grid>
  );
};

export default RTKDemo;

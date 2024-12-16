import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Flex, Box, Text } from 'theme-ui';
import moment from 'moment';
import { utils as vizUtils } from '@tidepool/viz';

import getOpts from './getOpts';

const formatTime = (startEndpoint, endEndpoint, timezoneName) => {
  const startDate = moment.utc(startEndpoint).tz(timezoneName);
  const endDate   = moment.utc(endEndpoint).tz(timezoneName);
  const startYear = startDate.year();
  const endYear   = endDate.year();

  if (startYear !== endYear) {
    return `${startDate.format("MMMM Do, YYYY")} - ${endDate.format("MMMM Do, YYYY")}`;
  }

  return `${startDate.format("MMMM Do")} - ${endDate.format("MMMM Do")}, ${endDate.format("YYYY")}`;
}

const CGMStats = () => {
  const data = useSelector(state => state.blip.data);
  const opts = useMemo(() => getOpts(data), [data]);

  if (!data || !opts.agpCGM) return null;

  const [startEndpoint, endEndpoint] = opts.agpCGM.endpoints;
  const timezoneName = vizUtils.datetime.getTimezoneFromTimePrefs(data?.timePrefs);

  const dateRange = formatTime(startEndpoint, endEndpoint, timezoneName);

  return (
    <Flex>
      <Box>{ dateRange }</Box>
      <Box></Box>
      <Box></Box>
    </Flex>
  )
}

export default CGMStats;
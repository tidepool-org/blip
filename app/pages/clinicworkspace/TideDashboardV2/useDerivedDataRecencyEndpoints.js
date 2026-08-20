import React, { useMemo } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { utils as vizUtils } from '@tidepool/viz';
const { getLocalizedCeiling } = vizUtils.datetime;

const tideDashboardFilters = {
  lastData: 7,
  patientTags: [],
  clinicSites: [],
  summaryPeriod: '14d',
};

const useDerivedDataRecencyEndpoints = () => {
  const lastData = tideDashboardFilters.lastData;
  const timePrefs = useSelector((state) => state.blip.timePrefs);

  const lastDataTo = useMemo(() => {
    return getLocalizedCeiling(new Date().toISOString(), timePrefs).toISOString();
  }, [timePrefs]);

  const lastDataFrom = useMemo(() => {
    return moment(lastDataTo).subtract(lastData, 'days').toISOString();
  }, [lastDataTo, lastData]);

  return [lastDataFrom, lastDataTo];
};

export default useDerivedDataRecencyEndpoints;

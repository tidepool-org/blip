import React from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { utils as vizUtils } from '@tidepool/viz';
const { getLocalizedCeiling } = vizUtils.datetime;

// TEMPORARY, will be set in redux
const tideDashboardFilters = {
  lastData: 7,
  patientTags: [],
  clinicSites: [],
  summaryPeriod: '14d',
};

const useDerivedDataRecencyEndpoints = (
  filters = tideDashboardFilters // TEMPORARY, will be set in redux
) => {
  const lastData = filters.lastData;
  const timePrefs = useSelector((state) => state.blip.timePrefs);

  const lastDataTo = getLocalizedCeiling(new Date().toISOString(), timePrefs).toISOString();
  const lastDataFrom = moment(lastDataTo).subtract(lastData, 'days').toISOString();

  return [lastDataFrom, lastDataTo];
};

export default useDerivedDataRecencyEndpoints;

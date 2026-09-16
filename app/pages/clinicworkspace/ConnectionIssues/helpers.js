import React from 'react';
import { getPrimaryDeviceProvider } from '../../../components/datasources/DataConnections';
import pickBy from 'lodash/pickBy';
import maxBy from 'lodash/maxBy';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment-timezone';

const getLatestIssue = (deviceIssues) => {
  const [type, issue] = maxBy(Object.entries(deviceIssues), ([, di]) => di.effectiveTime) ?? [];

  return type ? { ...issue, _type: type } : null;
};

export const getActiveDeviceIssue = (patient) => {
  const { deviceIssues } = patient;

  if (!deviceIssues) return null;

  const primaryProvider = getPrimaryDeviceProvider(patient);

  // If primaryProvider exists, preferentially show deviceIssues of that provider
  if (primaryProvider) {
    const primaryProviderId = primaryProvider?.dataSourceFilter?.providerName;
    const filteredIssues = pickBy(deviceIssues, di => di.providerId === primaryProviderId);

    const hasDeviceIssuesForPrimaryProvider = !isEmpty(filteredIssues);

    if (hasDeviceIssuesForPrimaryProvider) {
      return getLatestIssue(filteredIssues);
    }
  }

  // Otherwise, show any deviceIssue
  return getLatestIssue(deviceIssues);
};

export const getDaysAgo = (time) => {
    if (!time) return null;

    const targetTime = moment.utc(time, moment.ISO_8601, true);

    if (!targetTime.isValid()) return null;

    const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    const startOfTargetDay = targetTime.tz(browserTimezone).startOf('day');
    const startOfCurrentDay = moment.utc().tz(browserTimezone).startOf('day');

    return startOfCurrentDay.diff(startOfTargetDay, 'days');
};

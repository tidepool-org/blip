import React from 'react';
import { getPrimaryDeviceProvider } from '../../../components/datasources/DataConnections';
import pickBy from 'lodash/pickBy';
import maxBy from 'lodash/maxBy';
import isEmpty from 'lodash/isEmpty';
import { CATEGORY } from './FilterByCategory';

const pickByDeviceIssueByCategory = (issues, category) => {
  const categoryKeyPreference = {
    [CATEGORY.STALE_DATA]: ['staleData'],
    [CATEGORY.ERROR_OR_DC]: ['disconnected', 'erroring'],
    [CATEGORY.INVITE_EXPIRED]: ['expiredConnectionInvitation'],
    [CATEGORY.INVITE_SENT]: ['staleConnectionInvitation'],
  };

  const preferredKeys = categoryKeyPreference[category];

  if (preferredKeys) {
    const match = preferredKeys.find(key => issues[key]);
    if (match) return { ...issues[match], _type: match };
  }

  // No category preference — fall back to the issue with the most recent effectiveTime
  const [type, issue] = maxBy(Object.entries(issues), ([, di]) => di.effectiveTime) ?? [];

  return type ? { ...issue, _type: type } : null;
};

export const getPrimaryDeviceIssue = (patient, category) => {
  const { deviceIssues } = patient;

  if (!deviceIssues) return null;

  const primaryProvider = getPrimaryDeviceProvider(patient);

  // If primaryProvider exists, preferentially show deviceIssues of that provider
  if (primaryProvider) {
    const primaryProviderId = primaryProvider?.dataSourceFilter?.providerName;
    const filteredIssues = pickBy(deviceIssues, di => di.providerId === primaryProviderId);

    const hasDeviceIssuesForPrimaryProvider = !isEmpty(filteredIssues);

    if (hasDeviceIssuesForPrimaryProvider) {
      return pickByDeviceIssueByCategory(filteredIssues, category);
    }
  }

  // Otherwise, show any deviceIssue
  return pickByDeviceIssueByCategory(deviceIssues, category);
};

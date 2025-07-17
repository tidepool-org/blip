/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
import { combineReducers } from 'redux';

import working from './working';
import pdf from './pdf';
import data from './data';
import patientListFilters from './patientListFilters';

import {
  bgPrefs,
  currentPatientInViewId,
  isLoggedIn,
  loggedInUserId,
  targetUserId,
  prescriptions,
  devices,
  messageThread,
  notification,
  passwordResetConfirmed,
  membersOfTargetCareTeam,
  membershipInOtherCareTeams,
  permissionsOfMembersInTargetCareTeam,
  membershipPermissionsInOtherCareTeams,
  allUsersMap,
  pendingSentInvites,
  pendingReceivedInvites,
  resentEmailVerification,
  sentEmailVerification,
  showingWelcomeMessage,
  timePrefs,
  signupKey,
  dataDonationAccounts,
  dataSources,
  authorizedDataSource,
  justConnectedDataSourceProviderName,
  smartCorrelationId,
  smartOnFhirData,
  clinics,
  selectedClinicId,
  pendingSentClinicianInvites,
  pendingReceivedClinicianInvites,
  clinicFlowActive,
  keycloakConfig,
  tideDashboardPatients,
  rpmReportPatients,
  ssoEnabledDisplay,
  pendoData,
} from './misc';

export default combineReducers({
  bgPrefs,
  currentPatientInViewId,
  isLoggedIn,
  loggedInUserId,
  targetUserId,
  prescriptions,
  devices,
  messageThread,
  notification,
  passwordResetConfirmed,
  membersOfTargetCareTeam,
  membershipInOtherCareTeams,
  permissionsOfMembersInTargetCareTeam,
  membershipPermissionsInOtherCareTeams,
  allUsersMap,
  pendingSentInvites,
  pendingReceivedInvites,
  resentEmailVerification,
  sentEmailVerification,
  showingWelcomeMessage,
  timePrefs,
  signupKey,
  dataDonationAccounts,
  dataSources,
  authorizedDataSource,
  justConnectedDataSourceProviderName,
  smartCorrelationId,
  smartOnFhirData,
  clinics,
  selectedClinicId,
  pendingSentClinicianInvites,
  pendingReceivedClinicianInvites,
  clinicFlowActive,
  keycloakConfig,
  tideDashboardPatients,
  rpmReportPatients,
  ssoEnabledDisplay,
  pdf,
  data,
  working,
  pendoData,
  patientListFilters,
});

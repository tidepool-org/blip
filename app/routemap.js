/**
 * Copyright (c) 2014, Tidepool Project
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
 */

// List of routes and associated handlers which display/render the routes
var routes = {
  '/': 'redirectToDefaultRoute',
  '/login': 'showLogin',
  '/signup': 'showSignup',
  '/email-verification' : 'showEmailVerification',
  '/profile': 'showProfile',
  '/patients': 'showPatients',
  '/patients/new': 'showPatientNew',
  '/patients/:id/profile': 'showPatient',
  '/patients/:id/share': 'showPatientShare',
  '/patients/:id/data': 'showPatientData',
  '/request-password-reset': 'showRequestPasswordReset',
  '/confirm-password-reset': 'showConfirmPasswordReset',
  '/request-password-from-uploader': 'handleExternalPasswordUpdate'
};

// List of routes that are accessible to logged-out users
var noAuthRoutes = [
  '/login',
  '/signup',
  '/email-verification',
  '/request-password-reset',
  '/confirm-password-reset'
];

// List of routes that are requested from other apps
// (like the Chrome Uploader, for example)
var externalAppRoutes = [
  '/request-password-from-uploader'
];

module.exports = {
  routes: routes,
  noAuthRoutes: noAuthRoutes,
  externalAppRoutes: externalAppRoutes,
  defaultNotAuthenticatedRoute: '/login',
  defaultAuthenticatedRoute : 'patients'
};
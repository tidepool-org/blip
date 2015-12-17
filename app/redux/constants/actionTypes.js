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

/**
 * Syncronous action types
 */
export const HIDE_WELCOME_MESSAGE = 'HIDE_WELCOME_MESSAGE';

export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';

export const CLEAR_USER_DATA = 'CLEAR_USER_DATA';

/*
 * Asyncronous action types
 */ 

// user.login
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

// user.logout
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

// user.signup
export const SIGNUP_REQUEST = 'SIGNUP_REQUEST';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';

// user.confirmSignup
export const CONFIRM_SIGNUP_REQUEST = 'CONFIRM_SIGNUP_REQUEST';
export const CONFIRM_SIGNUP_SUCCESS = 'CONFIRM_SIGNUP_SUCCESS';
export const CONFIRM_SIGNUP_FAILURE = 'CONFIRM_SIGNUP_FAILURE';

// user.acceptTerms
export const ACCEPT_TERMS_REQUEST = 'ACCEPT_TERMS_REQUEST';
export const ACCEPT_TERMS_SUCCESS = 'ACCEPT_TERMS_SUCCESS';
export const ACCEPT_TERMS_FAILURE = 'ACCEPT_TERMS_FAILURE';

// patient.post
export const CREATE_PATIENT_REQUEST = 'CREATE_PATIENT_REQUEST';
export const CREATE_PATIENT_SUCCESS = 'CREATE_PATIENT_SUCCESS';
export const CREATE_PATIENT_FAILURE = 'CREATE_PATIENT_FAILURE';

// access.leaveGroup
export const REMOVE_PATIENT_REQUEST = 'REMOVE_PATIENT_REQUEST';
export const REMOVE_PATIENT_SUCCESS = 'REMOVE_PATIENT_SUCCESS';
export const REMOVE_PATIENT_FAILURE = 'REMOVE_PATIENT_FAILURE';

// access.removeMember
export const REMOVE_MEMBER_REQUEST = 'REMOVE_MEMBER_REQUEST';
export const REMOVE_MEMBER_SUCCESS = 'REMOVE_MEMBER_SUCCESS';
export const REMOVE_MEMBER_FAILURE = 'REMOVE_MEMBER_FAILURE';

// invitation.send
export const SEND_INVITATION_REQUEST = 'SEND_INVITATION_REQUEST';
export const SEND_INVITATION_SUCCESS = 'SEND_INVITATION_SUCCESS';
export const SEND_INVITATION_FAILURE = 'SEND_INVITATION_FAILURE';

// invitation.cancel
export const CANCEL_INVITATION_REQUEST = 'CANCEL_INVITATION_REQUEST';
export const CANCEL_INVITATION_SUCCESS = 'CANCEL_INVITATION_SUCCESS';
export const CANCEL_INVITATION_FAILURE = 'CANCEL_INVITATION_FAILURE';

// invitation.accept
export const ACCEPT_INVITATION_REQUEST = 'ACCEPT_INVITATION_REQUEST';
export const ACCEPT_INVITATION_SUCCESS = 'ACCEPT_INVITATION_SUCCESS';
export const ACCEPT_INVITATION_FAILURE = 'ACCEPT_INVITATION_FAILURE';

// invitation.dismiss
export const DISMISS_INVITATION_REQUEST = 'DISMISS_INVITATION_REQUEST';
export const DISMISS_INVITATION_SUCCESS = 'DISMISS_INVITATION_SUCCESS';
export const DISMISS_INVITATION_FAILURE = 'DISMISS_INVITATION_FAILURE';

// access.setMemberPermissions
export const SET_MEMBERSHIP_PERMISSIONS_REQUEST = 'SET_MEMBERSHIP_PERMISSIONS_REQUEST';
export const SET_MEMBERSHIP_PERMISSIONS_SUCCESS = 'SET_MEMBERSHIP_PERMISSIONS_SUCCESS';
export const SET_MEMBERSHIP_PERMISSIONS_FAILURE = 'SET_MEMBERSHIP_PERMISSIONS_FAILURE';

// no api call in handler
export const UPDATE_PATIENT_DATA_REQUEST = 'UPDATE_PATIENT_DATA_REQUEST';
export const UPDATE_PATIENT_DATA_SUCCESS = 'UPDATE_PATIENT_DATA_SUCCESS';
export const UPDATE_PATIENT_DATA_FAILURE = 'UPDATE_PATIENT_DATA_FAILURE';

// patient.put
export const UPDATE_PATIENT_REQUEST = 'UPDATE_PATIENT_REQUEST';
export const UPDATE_PATIENT_SUCCESS = 'UPDATE_PATIENT_SUCCESS';
export const UPDATE_PATIENT_FAILURE = 'UPDATE_PATIENT_FAILURE';

// user.put
export const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST';
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';
export const UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE';


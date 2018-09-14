import * as types from './actionTypes';

export default (type) => {
  switch (type) {
    case types.FETCH_USER_REQUEST:
    case types.FETCH_USER_SUCCESS:
    case types.FETCH_USER_FAILURE:
      return 'fetchingUser';

    case types.FETCH_PENDING_SENT_INVITES_REQUEST:
    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
    case types.FETCH_PENDING_SENT_INVITES_FAILURE:
      return 'fetchingPendingSentInvites';

    case types.FETCH_PENDING_RECEIVED_INVITES_REQUEST:
    case types.FETCH_PENDING_RECEIVED_INVITES_SUCCESS:
    case types.FETCH_PENDING_RECEIVED_INVITES_FAILURE:
      return 'fetchingPendingReceivedInvites';

    case types.FETCH_PATIENTS_REQUEST:
    case types.FETCH_PATIENTS_SUCCESS:
    case types.FETCH_PATIENTS_FAILURE:
      return 'fetchingPatients';

    case types.FETCH_PATIENT_REQUEST:
    case types.FETCH_PATIENT_SUCCESS:
    case types.FETCH_PATIENT_FAILURE:
      return 'fetchingPatient';

    case types.FETCH_PATIENT_DATA_REQUEST:
    case types.FETCH_PATIENT_DATA_SUCCESS:
    case types.FETCH_PATIENT_DATA_FAILURE:
      return 'fetchingPatientData';

    case types.FETCH_MESSAGE_THREAD_REQUEST:
    case types.FETCH_MESSAGE_THREAD_SUCCESS:
    case types.FETCH_MESSAGE_THREAD_FAILURE:
      return 'fetchingMessageThread';

    case types.LOGIN_REQUEST:
    case types.LOGIN_SUCCESS:
    case types.LOGIN_FAILURE:
      return 'loggingIn';

    case types.LOGOUT_REQUEST:
    case types.LOGOUT_SUCCESS:
      return 'loggingOut';

    case types.SIGNUP_REQUEST:
    case types.SIGNUP_SUCCESS:
    case types.SIGNUP_FAILURE:
      return 'signingUp';

    case types.CONFIRM_SIGNUP_REQUEST:
    case types.CONFIRM_SIGNUP_SUCCESS:
    case types.CONFIRM_SIGNUP_FAILURE:
      return 'confirmingSignup';

    case types.CONFIRM_PASSWORD_RESET_REQUEST:
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
      return 'confirmingPasswordReset';

    case types.ACCEPT_TERMS_REQUEST:
    case types.ACCEPT_TERMS_SUCCESS:
    case types.ACCEPT_TERMS_FAILURE:
      return 'acceptingTerms';

    case types.RESEND_EMAIL_VERIFICATION_REQUEST:
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
      return 'resendingEmailVerification';

    case types.SETUP_DATA_STORAGE_REQUEST:
    case types.SETUP_DATA_STORAGE_SUCCESS:
    case types.SETUP_DATA_STORAGE_FAILURE:
      return 'settingUpDataStorage';

    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE:
      return 'removingMembershipInOtherCareTeam';

    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE:
      return 'removingMemberFromTargetCareTeam';

    case types.REQUEST_PASSWORD_RESET_REQUEST:
    case types.REQUEST_PASSWORD_RESET_SUCCESS:
    case types.REQUEST_PASSWORD_RESET_FAILURE:
      return 'requestingPasswordReset';

    case types.SEND_INVITE_REQUEST:
    case types.SEND_INVITE_SUCCESS:
    case types.SEND_INVITE_FAILURE:
      return 'sendingInvite';

    case types.CANCEL_SENT_INVITE_REQUEST:
    case types.CANCEL_SENT_INVITE_SUCCESS:
    case types.CANCEL_SENT_INVITE_FAILURE:
      return 'cancellingSentInvite';

    case types.ACCEPT_RECEIVED_INVITE_REQUEST:
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
    case types.ACCEPT_RECEIVED_INVITE_FAILURE:
      return 'acceptingReceivedInvite';

    case types.REJECT_RECEIVED_INVITE_REQUEST:
    case types.REJECT_RECEIVED_INVITE_SUCCESS:
    case types.REJECT_RECEIVED_INVITE_FAILURE:
      return 'rejectingReceivedInvite';

    case types.SET_MEMBER_PERMISSIONS_REQUEST:
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
      return 'settingMemberPermissions';

    case types.UPDATE_PATIENT_REQUEST:
    case types.UPDATE_PATIENT_SUCCESS:
    case types.UPDATE_PATIENT_FAILURE:
      return 'updatingPatient';

    case types.UPDATE_PATIENT_BG_UNITS_REQUEST:
    case types.UPDATE_PATIENT_BG_UNITS_SUCCESS:
    case types.UPDATE_PATIENT_BG_UNITS_FAILURE:
      return 'updatingPatientBgUnits';

    case types.UPDATE_USER_REQUEST:
    case types.UPDATE_USER_SUCCESS:
    case types.UPDATE_USER_FAILURE:
      return 'updatingUser';

    case types.VERIFY_CUSTODIAL_REQUEST:
    case types.VERIFY_CUSTODIAL_SUCCESS:
    case types.VERIFY_CUSTODIAL_FAILURE:
      return 'verifyingCustodial';

    case types.GENERATE_PDF_REQUEST:
    case types.GENERATE_PDF_SUCCESS:
    case types.GENERATE_PDF_FAILURE:
      return 'generatingPDF';

    case types.FETCH_DATA_DONATION_ACCOUNTS_REQUEST:
    case types.FETCH_DATA_DONATION_ACCOUNTS_SUCCESS:
    case types.FETCH_DATA_DONATION_ACCOUNTS_FAILURE:
      return 'fetchingDataDonationAccounts';

    case types.UPDATE_DATA_DONATION_ACCOUNTS_REQUEST:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_FAILURE:
      return 'updatingDataDonationAccounts';

    case types.FETCH_DATA_SOURCES_REQUEST:
    case types.FETCH_DATA_SOURCES_SUCCESS:
    case types.FETCH_DATA_SOURCES_FAILURE:
      return 'fetchingDataSources';

    case types.CONNECT_DATA_SOURCE_REQUEST:
    case types.CONNECT_DATA_SOURCE_SUCCESS:
    case types.CONNECT_DATA_SOURCE_FAILURE:
      return 'connectingDataSource';

    case types.DISCONNECT_DATA_SOURCE_REQUEST:
    case types.DISCONNECT_DATA_SOURCE_SUCCESS:
    case types.DISCONNECT_DATA_SOURCE_FAILURE:
      return 'disconnectingDataSource';

    case types.FETCH_SERVER_TIME_REQUEST:
    case types.FETCH_SERVER_TIME_SUCCESS:
    case types.FETCH_SERVER_TIME_FAILURE:
      return 'fetchingServerTime';

    default:
      return null;
  }
};

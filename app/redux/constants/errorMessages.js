import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

// relating to signup
export const ERR_ACCOUNT_ALREADY_EXISTS = t('That e-mail address already has an account.');
// relating to login
export const ERR_LOGIN_CREDS = t('Wrong username or password.');
// this one doesn't get surfaced to user; instead we redirect to /email-verification
export const ERR_EMAIL_NOT_VERIFIED = t('Looks like your e-mail address has not been verified.');

// relating to care team invitations
export const ERR_ALREADY_SENT_TO_EMAIL = t('Looks like you\'ve already sent an invitation to that email.');

// these get assigned based on HTTP status codes
// default
export const ERR_GENERIC = t('Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to investigate.');
// 401
export const ERR_AUTHORIZATION = t('Something went wrong with your account authorization. Maybe try logging out and then logging back in? If you\'re still having issues then please contact support.');
// 500
export const ERR_SERVICE_DOWN = t('Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to go investigate. Please try again in a few moments.');
// 503
export const ERR_OFFLINE = t('Sorry but it appears that you are offline. Tidepool requires that you be connected to the internet.');

// and fallbacks with some info about the step involved when the error happened (useful for debugging)
export const ERR_ACCEPTING_INVITE = t('Something went wrong while accepting a received care team invitation.');
export const ERR_ACCEPTING_TERMS = t('Something went wrong while accepting the terms and conditions.');
export const ERR_ACCOUNT_NOT_CONFIGURED = t('Sorry! It appears that this account hasn\'t been fully set up. Please notify the account owner that data storage may not be set up for this account.');
export const ERR_CANCELLING_INVITE = t('Something went wrong while cancelling an outgoing care team invitation.');
export const ERR_CHANGING_PERMS = t('Something went wrong while changing care team member permissions.');
export const ERR_CONFIRMING_PASSWORD_RESET = t('We couldn\'t change your password. You may have mistyped your email, or the reset link may have expired.');
export const ERR_CONFIRMING_SIGNUP = t('Something went wrong while confirming your sign-up.');
export const ERR_DSA_SETUP = t('Something went wrong while setting up data storage.');
export const ERR_FETCHING_MESSAGE_THREAD = t('Something went wrong while fetching a message thread.');
export const ERR_FETCHING_PATIENT = t('Something went wrong while fetching patient.');
export const ERR_FETCHING_PATIENT_DATA = t('Something went wrong while fetching data for the current patient.');
export const ERR_FETCHING_LATEST_PUMP_SETTINGS = t('Something went wrong while fetching latest pump settings for the current patient.');
export const ERR_FETCHING_LATEST_PUMP_SETTINGS_UPLOAD = t('Something went wrong while fetching latest pump settings upload record for the current patient.');
export const ERR_FETCHING_PATIENTS = t('Something went wrong while fetching patients.');
export const ERR_FETCHING_PENDING_RECEIVED_INVITES = t('Something went wrong while fetching received invitations to others\' care teams.');
export const ERR_FETCHING_PENDING_SENT_INVITES = t('Something went wrong while fetching pending outgoing care team invitations.');
export const ERR_FETCHING_SERVER_TIME = t('Something went wrong while fetching the server time.  Falling back to local machine time');
export const ERR_FETCHING_USER = t('Something went wrong while fetching user.');
export const ERR_LOGIN = t('An error occurred while logging in.');
export const ERR_REJECTING_INVITE = t('Something went wrong while rejecting a received care team invitation.');
export const ERR_REMOVING_MEMBER = t('Something went wrong trying to remove a member from a care team.');
export const ERR_REMOVING_MEMBERSHIP = t('Something went wrong trying to leave a care team.');
export const ERR_REQUESTING_PASSWORD_RESET = t('Something went wrong trying to request a password reset e-mail.');
export const ERR_RESENDING_EMAIL_VERIFICATION = t('Something went wrong trying to resend verification e-mail.');
export const ERR_SENDING_INVITE = t('Something went wrong sending an outgoing invitation to a care team.');
export const ERR_SIGNUP = t('Something went wrong trying to sign you up.');
export const ERR_UPDATING_PATIENT = t('Something went wrong while saving patient profile.');
export const ERR_FETCHING_PREFERENCES = t('Something went wrong while fetching patient preferences.');
export const ERR_UPDATING_PREFERENCES = t('Something went wrong while saving patient preferences.');
export const ERR_FETCHING_SETTINGS = t('Something went wrong while fetching patient settings.');
export const ERR_UPDATING_SETTINGS = t('Something went wrong while saving patient settings.');
export const ERR_UPDATING_PATIENT_BG_UNITS = t('Something went wrong while saving patient BG unit settings.');
export const ERR_UPDATING_USER = t('Something went wrong while updating user account.');
export const ERR_YOUR_ACCOUNT_NOT_CONFIGURED = t('Sorry! It appears that your account hasn\'t been fully set up.');
export const ERR_GENERATING_PDF = t('Something went wrong while generating your report.');
export const ERR_FETCHING_DATA_DONATION_ACCOUNTS = t('Something went wrong while fetching your data donation preferences.');
export const ERR_UPDATING_DATA_DONATION_ACCOUNTS = t('Something went wrong while updating your data donation preferences.');
export const ERR_FETCHING_DATA_SOURCES = t('Something went wrong while fetching your data sources.');
export const ERR_CONNECTING_DATA_SOURCE = t('Something went wrong while connecting the data source.');
export const ERR_DISCONNECTING_DATA_SOURCE = t('Something went wrong while disconnecting the data source.');

export const ERR_BIRTHDAY_INVALID = t('Birthday is invalid.');
export const ERR_BIRTHDAY_MISSING = t('Birthday is required.');
export const ERR_BIRTHDAY_MISMATCH = t('The birthday specified does not match what is in our system. Please contact the clinic that created your account and ask them to update your birthday.');
export const ERR_PASSWORD_MISSING = t('Password is required.');
export const ERR_PASSWORD_INVALID = t('Password is invalid.');

export const VERIFY_CUSTODIAL_ERRORS = {
  1001: ERR_PASSWORD_MISSING,
  1002: ERR_PASSWORD_MISSING,
  1003: ERR_PASSWORD_INVALID,
  1004: ERR_BIRTHDAY_MISSING,
  1005: ERR_BIRTHDAY_INVALID,
  1006: ERR_BIRTHDAY_MISMATCH
};

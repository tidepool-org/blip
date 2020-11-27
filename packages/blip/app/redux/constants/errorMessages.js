import i18n from '../../core/language';
import config from '../../config';

const ErrorMessages = {
  // relating to signup
  get ERR_ACCOUNT_ALREADY_EXISTS() { return i18n.t('That e-mail address already has an account.'); },
  // relating to login
  get ERR_LOGIN_CREDS() { return i18n.t('Wrong username or password.'); },
  get ERR_LOGIN_LOCKED() {
    const params = {
      delayBeforeNextLoginAttempt: config.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT,
    };
    return i18n.t('Your account has been locked for {{delayBeforeNextLoginAttempt}} minutes. You have reached the maximum number of login attempts.', params);
  },
  // this one doesn't get surfaced to user; instead we redirect to /email-verification
  get ERR_EMAIL_NOT_VERIFIED() { return i18n.t('Looks like your e-mail address has not been verified.'); },

  // relating to care team invitations
  get ERR_ALREADY_SENT_TO_EMAIL() { return i18n.t('Looks like you\'ve already sent an invitation to that email.'); },

  // these get assigned based on HTTP status codes
  // default
  get ERR_GENERIC() { return i18n.t('Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to investigate.'); },
  // 401
  get ERR_AUTHORIZATION() { return i18n.t('Something went wrong with your account authorization. Maybe try logging out and then logging back in? If you\'re still having issues then please contact support.'); },
  // 500
  get ERR_SERVICE_DOWN() { return i18n.t('Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to go investigate. Please try again in a few moments.'); },
  // 503
  get ERR_OFFLINE() { return i18n.t('Sorry but it appears that you are offline. Tidepool requires that you be connected to the internet.'); },

  // and fallbacks with some info about the step involved when the error happened (useful for debugging)
  get ERR_ACCEPTING_INVITE() { return i18n.t('Something went wrong while accepting a received care team invitation.'); },
  get ERR_ACCEPTING_TERMS() { return i18n.t('Something went wrong while accepting the terms and conditions.'); },
  get ERR_ACCOUNT_NOT_CONFIGURED() { return i18n.t('Sorry! It appears that this account hasn\'t been fully set up. Please notify the account owner that data storage may not be set up for this account.'); },
  get ERR_CANCELLING_INVITE() { return i18n.t('Something went wrong while cancelling an outgoing care team invitation.'); },
  get ERR_CHANGING_PERMS() { return i18n.t('Something went wrong while changing care team member permissions.'); },
  get ERR_CONFIRMING_PASSWORD_RESET() { return i18n.t('We couldn\'t change your password. You may have mistyped your email, or the reset link may have expired.'); },
  get ERR_CONFIRMING_SIGNUP() { return i18n.t('Something went wrong while confirming your sign-up.'); },
  get ERR_DSA_SETUP() { return i18n.t('Something went wrong while setting up data storage.'); },
  get ERR_FETCHING_MESSAGE_THREAD() { return i18n.t('Something went wrong while fetching a message thread.'); },
  get ERR_FETCHING_PATIENT() { return i18n.t('Something went wrong while fetching patient.'); },
  get ERR_FETCHING_PATIENT_DATA() { return i18n.t('Something went wrong while fetching data for the current patient.'); },
  get ERR_FETCHING_LATEST_PUMP_SETTINGS() { return i18n.t('Something went wrong while fetching latest pump settings for the current patient.'); },
  get ERR_FETCHING_LATEST_PUMP_SETTINGS_UPLOAD() { return i18n.t('Something went wrong while fetching latest pump settings upload record for the current patient.'); },
  get ERR_FETCHING_ASSOCIATED_ACCOUNTS() { return i18n.t('Something went wrong while fetching associated accounts.'); },
  get ERR_FETCHING_PENDING_RECEIVED_INVITES() { return i18n.t('Something went wrong while fetching received invitations to others\' care teams.'); },
  get ERR_FETCHING_PENDING_SENT_INVITES() { return i18n.t('Something went wrong while fetching pending outgoing care team invitations.'); },
  get ERR_FETCHING_SERVER_TIME() { return i18n.t('Something went wrong while fetching the server time.  Falling back to local machine time'); },
  get ERR_FETCHING_USER() { return i18n.t('Something went wrong while fetching user.'); },
  get ERR_LOGIN() { return i18n.t('An error occurred while logging in.'); },
  get ERR_REJECTING_INVITE() { return i18n.t('Something went wrong while rejecting a received care team invitation.'); },
  get ERR_REMOVING_MEMBER() { return i18n.t('Something went wrong trying to remove a member from a care team.'); },
  get ERR_REMOVING_MEMBERSHIP() { return i18n.t('Something went wrong trying to leave a care team.'); },
  get ERR_REQUESTING_PASSWORD_RESET() { return i18n.t('Something went wrong trying to request a password reset e-mail.'); },
  get ERR_RESENDING_EMAIL_VERIFICATION() { return i18n.t('Something went wrong trying to resend verification e-mail.'); },
  get ERR_SENDING_INVITE() { return i18n.t('Something went wrong sending an outgoing invitation to a care team.'); },
  get ERR_SIGNUP() { return i18n.t('Something went wrong trying to sign you up.'); },
  get ERR_UPDATING_PATIENT() { return i18n.t('Something went wrong while saving patient profile.'); },
  get ERR_FETCHING_PREFERENCES() { return i18n.t('Something went wrong while fetching patient preferences.'); },
  get ERR_UPDATING_PREFERENCES() { return i18n.t('Something went wrong while saving patient preferences.'); },
  get ERR_FETCHING_SETTINGS() { return i18n.t('Something went wrong while fetching patient settings.'); },
  get ERR_UPDATING_SETTINGS() { return i18n.t('Something went wrong while saving patient settings.'); },
  get ERR_UPDATING_PATIENT_BG_UNITS() { return i18n.t('Something went wrong while saving patient BG unit settings.'); },
  get ERR_UPDATING_USER() { return i18n.t('Something went wrong while updating user account.'); },
  get ERR_YOUR_ACCOUNT_NOT_CONFIGURED() { return i18n.t('Sorry! It appears that your account hasn\'t been fully set up.'); },
  get ERR_GENERATING_PDF() { return i18n.t('Something went wrong while generating your report.'); },
  get ERR_UPDATING_DATA_DONATION_ACCOUNTS() { return i18n.t('Something went wrong while updating your data donation preferences.'); },
  get ERR_FETCHING_DATA_SOURCES() { return i18n.t('Something went wrong while fetching your data sources.'); },
  get ERR_CONNECTING_DATA_SOURCE() { return i18n.t('Something went wrong while connecting the data source.'); },
  get ERR_DISCONNECTING_DATA_SOURCE() { return i18n.t('Something went wrong while disconnecting the data source.'); },

  get ERR_BIRTHDAY_INVALID() { return i18n.t('Birthday is invalid.'); },
  get ERR_BIRTHDAY_MISSING() { return i18n.t('Birthday is required.'); },
  get ERR_BIRTHDAY_MISMATCH() { return i18n.t('The birthday specified does not match what is in our system. Please contact the clinic that created your account and ask them to update your birthday.'); },
  get ERR_PASSWORD_MISSING() { return i18n.t('Password is required.'); },
  get ERR_PASSWORD_INVALID() { return i18n.t('Password is invalid.'); },

  verifyCustodialErrors: (/** @type {number} */ code) => {
    switch (code) {
    case 1001:
    case 1002:
      return ErrorMessages.ERR_PASSWORD_MISSING;
    case 1003:
      return ErrorMessages.ERR_PASSWORD_INVALID;
    case 1004:
      return ErrorMessages.ERR_BIRTHDAY_MISSING;
    case 1005:
      return ErrorMessages.ERR_BIRTHDAY_INVALID;
    case 1006:
      return ErrorMessages.ERR_BIRTHDAY_MISMATCH;
    default:
      return null;
    }
  },
};
export default ErrorMessages;

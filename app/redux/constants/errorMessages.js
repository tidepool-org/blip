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
export const ERR_CONFIRMING_SIGNUP_NOMATCH = t('Tidepool is unable to complete your sign-up as this verification link has expired. Please check your email for an updated link and try again.');
export const ERR_DSA_SETUP = t('Something went wrong while setting up data storage.');
export const ERR_FETCHING_CLINIC_PRESCRIPTIONS = t('Something went wrong while fetching your prescriptions.');
export const ERR_CREATING_PRESCRIPTION = t('Something went wrong while creating your prescription.');
export const ERR_CREATING_PRESCRIPTION_REVISION = t('Something went wrong while updating your prescription.');
export const ERR_DELETING_PRESCRIPTION = t('Something went wrong while deleting your prescription.');
export const ERR_FETCHING_DEVICES = t('Something went wrong while fetching the devices list.');
export const ERR_FETCHING_MESSAGE_THREAD = t('Something went wrong while fetching a message thread.');
export const ERR_CREATING_MESSAGE_THREAD = t('Something went wrong while creating a message thread.');
export const ERR_EDITING_MESSAGE_THREAD = t('Something went wrong while editing a message thread.');
export const ERR_FETCHING_PATIENT = t('Something went wrong while fetching patient.');
export const ERR_FETCHING_PATIENT_UNAUTHORIZED = t('Something went wrong while fetching patient. You are not authorized to view this patient.');
export const ERR_FETCHING_PATIENT_CLINICIAN_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_PATIENTS = t('Something went wrong while fetching patients.');
export const ERR_FETCHING_PATIENT_DATA = t('Something went wrong while fetching data for the current patient.');
export const ERR_FETCHING_PATIENT_DATA_UNAUTHORIZED = t('Something went wrong while fetching data for the current patient. You are not authorized to view this patient data.');
export const ERR_FETCHING_PATIENT_DATA_CLINICIAN_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_LATEST_PUMP_SETTINGS = t('Something went wrong while fetching latest pump settings for the current patient.');
export const ERR_FETCHING_LATEST_PUMP_SETTINGS_UPLOAD = t('Something went wrong while fetching latest pump settings upload record for the current patient.');
export const ERR_FETCHING_ASSOCIATED_ACCOUNTS = t('Something went wrong while fetching associated accounts.');
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
export const ERR_SENDING_CLINIC_INVITE = t('Something went wrong sending an outgoing invitation to a clinic.');
export const ERR_RESENDING_INVITE = t('Something went wrong resending an outgoing invitation to a care team.');
export const ERR_SIGNUP = t('Something went wrong trying to sign you up.');
export const ERR_UPDATING_PATIENT = t('Something went wrong while saving patient profile.');
export const ERR_FETCHING_PREFERENCES = t('Something went wrong while fetching patient preferences.');
export const ERR_UPDATING_PREFERENCES = t('Something went wrong while saving patient preferences.');
export const ERR_FETCHING_SETTINGS = t('Something went wrong while fetching patient settings.');
export const ERR_UPDATING_SETTINGS = t('Something went wrong while saving patient settings.');
export const ERR_UPDATING_PATIENT_BG_UNITS = t('Something went wrong while saving patient BG unit settings.');
export const ERR_UPDATING_USER = t('Something went wrong while updating user account.');
export const ERR_UPDATING_USER_EMAIL_IN_USE = t('That e-mail address is already in use.');
export const ERR_YOUR_ACCOUNT_NOT_CONFIGURED = t('Sorry! It appears that your account hasn\'t been fully set up.');
export const ERR_GENERATING_PDF = t('Something went wrong while generating your report.');
export const ERR_ADDING_DATA = t('Something went wrong while processing your data.');
export const ERR_REMOVING_DATA = t('Something went wrong while closing the connection to your data.');
export const ERR_UPDATING_DATUM = t('Something went wrong while updating your data.');
export const ERR_QUERYING_DATA = t('Something went wrong while querying your data.');
export const ERR_UPDATING_DATA_DONATION_ACCOUNTS = t('Something went wrong while updating your data donation preferences.');
export const ERR_FETCHING_DATA_SOURCES = t('Something went wrong while fetching your data sources.');
export const ERR_CONNECTING_DATA_SOURCE = t('Something went wrong while connecting the data source.');
export const ERR_DISCONNECTING_DATA_SOURCE = t('Something went wrong while disconnecting the data source.');
export const ERR_GETTING_CLINICS = t('Something went wrong while getting clinics.');
export const ERR_CREATING_CLINIC = t('Something went wrong while creating clinic.');
export const ERR_FETCHING_CLINIC = t('Something went wrong while fetching clinic.');
export const ERR_FETCHING_CLINICS_BY_IDS = t('Something went wrong while fetching one or more clinics.');
export const ERR_UPDATING_CLINIC = t('Something went wrong while updating clinic.');
export const ERR_FETCHING_CLINICIANS_FROM_CLINIC = t('Something went wrong while fetching clinicians from clinic.');
export const ERR_FETCHING_CLINICIANS_FROM_CLINIC_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_CLINICIAN = t('Something went wrong while fetching clinician.');
export const ERR_UPDATING_CLINICIAN = t('Something went wrong while updating clinician.');
export const ERR_UPDATING_CLINICIAN_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_DELETING_CLINICIAN_FROM_CLINIC = t('Something went wrong while deleting clinician from clinic.');
export const ERR_DELETING_CLINICIAN_FROM_CLINIC_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_DELETING_PATIENT_FROM_CLINIC = t('Something went wrong while deleting patient from clinic.');
export const ERR_DELETING_PATIENT_FROM_CLINIC_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_PATIENTS_FOR_CLINIC = t('Something went wrong while fetching patients for clinic.');
export const ERR_FETCHING_PATIENTS_FOR_CLINIC_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_PATIENT_FROM_CLINIC = t('Something went wrong while fetching patient from clinic.');
export const ERR_UPDATING_CLINIC_PATIENT = t('Something went wrong while updating clinic patient.');
export const ERR_UPDATING_CLINIC_PATIENT_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_CREATING_CUSTODIAL_ACCOUNT = t('Something went wrong while creating patient account.');
export const ERR_CREATING_CUSTODIAL_ACCOUNT_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_CREATING_CUSTODIAL_ACCOUNT_LIMIT_REACHED = t('Can\'t add a new patient: Your workspace has reached the maximum number of patient accounts supported by our Base Plan.');
export const ERR_SENDING_CLINICIAN_INVITE = t('Something went wrong while sending clinician invite.');
export const ERR_SENDING_CLINICIAN_INVITE_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_SENDING_CLINICIAN_INVITE_ALREADY_MEMBER = t('This clinician is already a member of the clinic.');
export const ERR_FETCHING_CLINICIAN_INVITE = t('Something went wrong while fetching clinician invite.');
export const ERR_FETCHING_CLINICIAN_INVITE_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_RESENDING_CLINICIAN_INVITE = t('Something went wrong while resending clinician invite.');
export const ERR_DELETING_CLINICIAN_INVITE = t('Something went wrong while deleting clinician invite.');
export const ERR_DELETING_CLINICIAN_INVITE_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_FETCHING_PATIENT_INVITES = t('Something went wrong while fetching patient invites.');
export const ERR_FETCHING_PATIENT_INVITES_UNAUTHORIZED = t('Something went wrong with your account authorization. Please check with your administrator to verify your level of access.');
export const ERR_ACCEPTING_PATIENT_INVITATION = t('Something went wrong while accepting patient invitation.');
export const ERR_DELETING_PATIENT_INVITATION = t('Something went wrong while deleting patient invitation.');
export const ERR_UPDATING_PATIENT_PERMISSIONS = t('Something went wrong while updating patient permissions.');
export const ERR_FETCHING_CLINIC_MRN_SETTINGS = t('Something went wrong while fetching clinic MRN settings.');
export const ERR_FETCHING_CLINIC_EHR_SETTINGS = t('Something went wrong while fetching clinic EHR settings.');
export const ERR_FETCHING_CLINICS_FOR_PATIENT = t('Something went wrong while fetching clinics for patient.');
export const ERR_FETCHING_CLINICIAN_INVITES = t('Something went wrong while fetching clinician invites.');
export const ERR_ACCEPTING_CLINICIAN_INVITE = t('Something went wrong while accepting clinician invite.');
export const ERR_DISMISSING_CLINICIAN_INVITE = t('Something went wrong while dismissing clinician invite.');
export const ERR_FETCHING_CLINICS_FOR_CLINICIAN = t('Something went wrong while getting clinics for clinician.');
export const ERR_TRIGGERING_INITIAL_CLINIC_MIGRATION = t('Something went wrong while migrating this clinic.');
export const ERR_SENDING_PATIENT_UPLOAD_REMINDER = t('Something went wrong while sending an upload reminder to the patient.');
export const ERR_SENDING_PATIENT_DATA_PROVIDER_CONNECT_REQUEST = t('Something went wrong while sending a data provider connect request to the patient.');
export const ERR_CREATING_CLINIC_SITE = t('Something went wrong while creating the site.');
export const ERR_CREATING_CLINIC_SITE_MAX_EXCEEDED = t('Sorry, you already have the maximum number of sites.');
export const ERR_CREATING_CLINIC_SITE_DUPLICATE = t('Sorry, you already have a site with that name.');
export const ERR_UPDATING_CLINIC_SITE = t('Something went wrong while updating the site.');
export const ERR_UPDATING_CLINIC_SITE_DUPLICATE = t('Sorry, you already have a site with that name.');
export const ERR_DELETING_CLINIC_SITE = t('Something went wrong while deleting the site.');
export const ERR_CREATING_CLINIC_PATIENT_TAG = t('Something went wrong while creating the patient tag.');
export const ERR_CREATING_CLINIC_PATIENT_TAG_MAX_EXCEEDED = t('Sorry, you already have the maximum number of patient tags.');
export const ERR_CREATING_CLINIC_PATIENT_TAG_DUPLICATE = t('Sorry, you already have a tag with that name.');
export const ERR_UPDATING_CLINIC_PATIENT_TAG = t('Something went wrong while updating the patient tag.');
export const ERR_UPDATING_CLINIC_PATIENT_TAG_DUPLICATE = t('Sorry, you already have a tag with that name.');
export const ERR_DELETING_CLINIC_PATIENT_TAG = t('Something went wrong while deleting the patient tag.');
export const ERR_FETCHING_INFO = t('Something went wrong while fetching server configuration.');
export const ERR_FETCHING_TIDE_DASHBOARD_PATIENTS = t('Something went wrong while fetching patients for the dashboard.');
export const ERR_FETCHING_RPM_REPORT_PATIENTS = t('Something went wrong while fetching patients for the report.');
export const ERR_FETCHING_CLINIC_PATIENT_COUNT = t('Something went wrong while fetching the clinic patient count.');
export const ERR_FETCHING_CLINIC_PATIENT_COUNT_SETTINGS = t('Something went wrong while fetching the clinic patient count settings.');
export const ERR_SETTING_CLINIC_PATIENT_LAST_REVIEWED = t('Something went wrong while setting the patient\'s last reviewed date.');
export const ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED = t('Something went wrong while reverting the patient\'s last reviewed date.');
export const ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED_UNAUTHORIZED = t('We were unable to revert the patient\'s last reviewed date, since it was set by a different clinic team member.');

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

// Smart on FHIR specific errors
export const ERR_SMARTONFHIR_MISSING_CORRELATION_ID = t('Missing correlation ID.');
export const ERR_SMARTONFHIR_PATIENT_INFO_NOT_FOUND = t('Patient information not found in token.');
export const ERR_SMARTONFHIR_MRN_NOT_FOUND = t('MRN not found in patient information.');
export const ERR_SMARTONFHIR_DOB_NOT_FOUND = t('Date of birth information not found in patient data.');
export const ERR_SMARTONFHIR_NO_PATIENTS_FOUND = t('No patients found with the provided MRN.');
export const ERR_SMARTONFHIR_MULTIPLE_PATIENTS_FOUND = t('Multiple patients found with the provided MRN and date of birth.');
export const ERR_SMARTONFHIR_FETCHING_PATIENT = t('Error fetching patient.');
export const ERR_SMARTONFHIR_INITIALIZING = t('Initializing Smart on FHIR...');
export const ERR_SMARTONFHIR_LOADING_PATIENT_DATA = t('Loading patient data...');

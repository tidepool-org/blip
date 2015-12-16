export const initialState = {
  patients: {},
  patientsData: {},
  invites: {},
  isLoggedIn: false,
  user: null,
  currentPatient: null,
  working: {
    fetchingInvites: false,
    fetchingPendingInvites: false,
    fetchingMessages: false,
    fetchingPatients: false,
    fetchingPatient: false,
    fetchingPatientData: false,
    loggingOut: false,
    loggingIn: false
  }
};
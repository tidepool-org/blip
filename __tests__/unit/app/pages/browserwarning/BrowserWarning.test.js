/* global expect */
/* global describe */
/* global it */

import { mapStateToProps } from '@app/pages/browserwarning/browserwarning';

const makeState = (blip) => ({ blip });

describe('BrowserWarning mapStateToProps', () => {
  it('should show the mobile app link for a logged-in patient', () => {
    const state = makeState({
      isLoggedIn: true,
      loggedInUserId: 'p1',
      allUsersMap: { p1: { userid: 'p1', roles: [] } },
    });

    expect(mapStateToProps(state).showMobileAppLink).toBe(true);
  });

  // Clinicians reach this page from mobile browsers too (requireSupportedBrowserForUserType), and
  // the Tidepool Mobile app is for patients.
  it('should not show the mobile app link for a clinician', () => {
    const state = makeState({
      isLoggedIn: true,
      loggedInUserId: 'c1',
      allUsersMap: { c1: { userid: 'c1', roles: ['clinician'] } },
    });

    expect(mapStateToProps(state).showMobileAppLink).toBe(false);
  });

  it('should not show the mobile app link for a clinic member without a clinician role', () => {
    const state = makeState({
      isLoggedIn: true,
      loggedInUserId: 'c2',
      allUsersMap: { c2: { userid: 'c2', roles: [], isClinicMember: true } },
    });

    expect(mapStateToProps(state).showMobileAppLink).toBe(false);
  });

  it('should not show the mobile app link when logged out', () => {
    const state = makeState({
      isLoggedIn: false,
      loggedInUserId: null,
      allUsersMap: {},
    });

    expect(mapStateToProps(state).showMobileAppLink).toBe(false);
  });

  it('should not show the mobile app link while the user has not loaded yet', () => {
    const state = makeState({
      isLoggedIn: true,
      loggedInUserId: 'p1',
      allUsersMap: {},
    });

    expect(mapStateToProps(state).showMobileAppLink).toBe(false);
  });
});

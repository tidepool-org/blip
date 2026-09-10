import React from 'react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';

const useAuthorizationGate = () => {
  const { showTideDashboard } = useFlags();
  const ldClient = useLDClient();
  const isLDContextLoaded = !!ldClient.getContext()?.clinic?.tier;

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const isAuthorized = (
    clinic?.entitlements?.tideDashboard ||
    (isLDContextLoaded && showTideDashboard)
  );

  const isUnauthorized = (
    (clinic?.entitlements && !clinic.entitlements.tideDashboard) &&
    (isLDContextLoaded && !showTideDashboard)
  );

  // Will both be false while LD is fetching
  return { isAuthorized, isUnauthorized };
};

export default useAuthorizationGate;

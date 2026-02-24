import React, { useEffect} from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

export const useRequireSummaryDashboardEntitlement = () => {
  const history = useHistory();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const isEntitlementsLoaded = !!clinic?.entitlements;
  const hasSummaryDashboard = clinic?.entitlements?.summaryDashboard || false;

  useEffect(() => {
    if (isEntitlementsLoaded && !hasSummaryDashboard) {
      history.push('/clinic-workspace/patients');
    }
  }, [isEntitlementsLoaded, hasSummaryDashboard]);

  const isAuthorized = isEntitlementsLoaded && hasSummaryDashboard;

  return isAuthorized;
};

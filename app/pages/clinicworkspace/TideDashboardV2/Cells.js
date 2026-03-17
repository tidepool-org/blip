import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import { Box, Text } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;
import { MGDL_UNITS } from '../../../core/constants';
import { push } from 'connected-react-router';

import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import utils from '../../../core/utils';
import { OVERVIEW_TAB_INDEX } from '../../../components/PatientDrawer/MenuBar/MenuBar';
import { useFlags } from 'launchdarkly-react-client-sdk';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();
  const { search, pathname } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { showTideDashboardPatientDrawer } = useFlags();

  const { fullName, birthDate, mrn } = patient || {};

  const handleClick = () => {
    if (!patient.id) return;

    if (showTideDashboardPatientDrawer) {
      const params = new URLSearchParams(search);
      params.set('drawerPatientId', patient.id);
      params.set('drawerTab', OVERVIEW_TAB_INDEX);
      history.replace({ pathname, search: params.toString() });

      return;
    }

    dispatch(push(`/patients/${patient.id}/data?dashboard=tide`));
  };

  return <Box onClick={handleClick}>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{fullName}</Text>
    <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Text>
    {mrn && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>, {t('MRN: {{mrn}}', { mrn: mrn })}</Text>}
  </Box>;
};

export const NumericTemplateCell = ({ value, isPercent = false }) => {
  if (!value) return <Text sx={{ fontWeight: 'normal' }}></Text>;

  return <Text sx={{ fontWeight: 'normal' }}>{value} {isPercent && '%'}</Text>;
};

export const AvgGlucoseCell = ({ patient, units }) => { // TODO: Fix for units
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.averageGlucoseMmol;
  const value = utils.formatDecimal(rawValue, 1);

  return <NumericTemplateCell value={value} />;
};

export const TimeInRangePercentBarChartCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  // TODO: need to add showExtremeHigh

  return <BgSummaryCell
    id={patient?.id}
    summary={patient?.summary?.cgmStats?.periods?.[summaryPeriod]}
    config={patient?.summary?.cgmStats?.config}
    activeSummaryPeriod={summaryPeriod}
    glycemicRanges={patient?.glycemicRanges}
    clinicBgUnits={clinicBgUnits}
  />;
};

export const TimeInTargetPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryHighPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryHighPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyHighPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyHighPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const GMICell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const value = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.glucoseManagementIndicator;

  return <NumericTemplateCell value={value} isPercent />;
};

export const CGMUseCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeCGMUsePercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent/>;
};

export const ChangeTIRCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const timeInTargetPercentDelta = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercentDelta;

  if (!timeInTargetPercentDelta) return <Text sx={{ fontWeight: 'medium' }}>--</Text>;

  return <DeltaBar
    sx={{ fontWeight: 'medium' }}
    delta={timeInTargetPercentDelta * 100}
    max={30}
  />;
};

export default {
  PatientCell,
  NumericTemplateCell,
  AvgGlucoseCell,
  TimeInRangePercentBarChartCell,
  TimeInVeryLowPercentCell,
  ChangeTIRCell,
  GMICell,
  CGMUseCell,
};

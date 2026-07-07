import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import { utils as vizUtils, colors as vizColors  } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;
import { MGDL_UNITS } from '../../../core/constants';
import { colors } from '../../../themes/baseTheme';

import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import utils from '../../../core/utils';
import { CATEGORY } from './FilterByCategory';
import isUndefined from 'lodash/isUndefined';

import PopoverMenu from '../../../components/elements/PopoverMenu';
import EditIcon from '@material-ui/icons/EditRounded';
import DataInIcon from '../../../core/icons/DataInIcon.svg';

import {
  setEditPatientDialogIsOpen,
  setEditPatientDialogPatientId,
  setDataConnectionsModalIsOpen,
  setDataConnectionsModalPatientId,
} from './tideDashboardSlice';

export const COMPACT = '@container (max-width: 1200px)';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn } = patient || {};

  return <Box sx={{ gap: 0, marginRight: -2 }}>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap', fontWeight: 'medium' }}>{fullName}</Box>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Box>
    {mrn && <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('MRN: {{mrn}}', { mrn: mrn })}</Box>}
  </Box>;
};

export const NumericTemplateCell = ({ value, isPercent = false }) => {
  if (!value) return <Text sx={{ fontWeight: 'normal' }}></Text>;

  return <Text sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>{value} {isPercent && '%'}</Text>;
};

export const AvgGlucoseHeader = withTranslation()(({ t }) => (
  <>
    <Box sx={{ [COMPACT]: { display: 'none' } }}>{t('Avg Glucose')}</Box>
    <Box sx={{ display: 'none', [COMPACT]: { display: 'block' } }}>{t('Avg Gluc.')}</Box>
  </>
));

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
  let value = utils.formatDecimal(rawValue * 100, 0);

  if (isUndefined(rawValue)) value = '';

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

export const ChangeTIRHeader = withTranslation()(({ t }) => (
  <>
    <Box sx={{ [COMPACT]: { display: 'none' } }}>{t('% Change in TIR')}</Box>
    <Box sx={{ display: 'none', [COMPACT]: { display: 'block' } }}>{t('% Δ TIR')}</Box>
  </>
));

export const ChangeTIRCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const timeInTargetPercentDelta = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercentDelta;

  if (!timeInTargetPercentDelta) return <Text sx={{ fontWeight: 'medium' }}>-</Text>;

  const compactDisplayValue = utils.formatDecimal(timeInTargetPercentDelta * 100, 1);

  return <>
    <Box sx={{ [COMPACT]: { display: 'none' } }}>
      <DeltaBar
        sx={{ fontWeight: 'medium' }}
        delta={timeInTargetPercentDelta * 100}
        max={30}
      />
    </Box>
    <Box sx={{ display: 'none', [COMPACT]: { display: 'block' } }}>
      <NumericTemplateCell value={compactDisplayValue} isPercent />
    </Box>
  </>
  ;
};

export const FlagCell = ({ patient, category = null, }) => {
  const { t } = useTranslation();
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const period = patient?.summary?.cgmStats?.periods?.[summaryPeriod];

  const { VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

  if (!period) return null;

  const rangeName = (() => {
    switch(true) {
      // Current dashboard category takes priority
      case category === VERY_LOW: return 'veryLow';
      case category === ANY_LOW: return 'anyLow';
      case category === VERY_HIGH: return 'veryHigh';
      case category === ANY_HIGH: return 'anyHigh';
      case category === DROP_IN_TIR: return 'dropInTIR';
      case category === LOW_CGM_WEAR: return 'lowSensorUsage';
      case category === TARGET: return 'target';

      // If no category, then read from summary
      case period.timeInVeryLowPercent > 0.01: return 'veryLow';
      case period.timeInAnyLowPercent > 0.04: return 'anyLow';
      case period.timeInVeryHighPercent > 0.05: return 'veryHigh';
      case period.timeInAnyHighPercent > 0.25: return 'anyHigh';
      case period.timeInTargetPercentDelta < -0.15: return 'dropInTIR';
      case period.timeCGMUsePercent < 0.70: return 'lowSensorUsage';

      default: return null;
    }
  })();

  if (!rangeName) return null;

  const flagLabels = {
    veryLow: t('Very Low'),
    anyLow: t('Low'),
    veryHigh: t('Very High'),
    anyHigh: t('High'),
    dropInTIR: t('Large Drop in TIR'),
    lowSensorUsage: t('Low CGM Wear Time'),
    target: t('Meeting Targets'),
  };

  const flagColor = colors.bg[rangeName] || vizColors.gold30;

  return (
    <Flex className='tide-dashboard-flag-cell'>
      <Flex
        className='tide-dashboard-flag'
        px={2} py={1} sx={{
        backgroundColor: `${flagColor}1A`, // adding '1A' reduces opacity to 0.1
        borderRadius: 4,
        alignItems: 'center',
      }}>
          <Box
            sx={{ borderRadius: 4, backgroundColor: flagColor, width: '12px', height: '12px' }}
            mr={2}
          >
          </Box>
          <Text sx={{ fontSize: 0, color: vizColors.black, fontWeight: 'medium', whiteSpace: 'nowrap' }}>
            {flagLabels[rangeName] || ''}
          </Text>
      </Flex>
    </Flex>
  );
};


export const MoreMenuCell = ({ patient }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleOpenEditPatientDialog = () => {
    dispatch(setEditPatientDialogIsOpen(true));
    dispatch(setEditPatientDialogPatientId(patient.id));
  };

  const handleOpenDataConnectionsModal = () => {
    dispatch(setDataConnectionsModalIsOpen(true));
    dispatch(setDataConnectionsModalPatientId(patient.id));
  };

  return (
    <PopoverMenu
      id={`action-menu-${patient?.id}`}
      items={[{
        icon: EditIcon,
        iconLabel: t('Edit Patient Details'),
        iconPosition: 'left',
        id: `edit-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleOpenEditPatientDialog();
        },
        text: t('Edit Patient Details'),
      }, {
        iconSrc: DataInIcon,
        iconLabel: t('Bring Data into Tidepool'),
        iconPosition: 'left',
        id: `edit-data-connections-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleOpenDataConnectionsModal();
        },
        text: t('Bring Data into Tidepool'),
      }]}
      sx={{ position: 'relative', left: '-2px' }}
    />
  );
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
  FlagCell,
};

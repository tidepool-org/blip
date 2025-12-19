import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import values from 'lodash/values';
import * as actions from '../../../redux/actions';
import { radii, colors } from '../../../themes/baseTheme';
import Table from '../../../components/elements/Table';
import { Box, Text, Flex } from 'theme-ui';
import { MGDL_UNITS } from '../../../core/constants';
import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import CategorySelector, { CATEGORY } from './CategorySelector';
import Pagination from './Pagination';
import { TagList } from '../../../components/elements/Tag';

import moment from 'moment-timezone';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;

import keyBy from 'lodash/keyBy';
import reject from 'lodash/reject';
import map from 'lodash/map';

const TMP_SUMMARY_PERIOD = '14d';
const TMP_UNITS = MGDL_UNITS;
const TMP_EXTREME_HIGH = false;
const TMP_STAT_EMPTY_TXT = '';

const PATIENT_ROW_LIMIT = 12;

const renderBgRangeSummary = ({ id, summary, glycemicRanges }) => {
  return (
    <BgSummaryCell
      id={id}
      summary={summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]}
      config={summary?.cgmStats?.config}
      clinicBgUnits={TMP_UNITS}
      activeSummaryPeriod={TMP_SUMMARY_PERIOD}
      glycemicRanges={glycemicRanges}
      showExtremeHigh={TMP_EXTREME_HIGH}
    />
);
};

const renderTimeInTargetPercentDelta = ({ summary }) => {
  const timeInTargetPercentDelta = (summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]?.timeInTargetPercentDelta);

  return timeInTargetPercentDelta ? (
    <DeltaBar
      sx={{ fontWeight: 'medium' }}
      delta={timeInTargetPercentDelta * 100}
      max={30}
    />
  ) : (
    <Text sx={{ fontWeight: 'medium' }}>{TMP_STAT_EMPTY_TXT}</Text>
  );
};

const RenderPatientTags = ({ id, tags }) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);

  const filteredPatientTags = reject(tags || [], tagId => !patientTags[tagId]);

  return (
    <TagList
      maxTagsVisible={4}
      maxCharactersVisible={12}
      popupId={`tags-overflow-${id}`}
      tagProps={{ variant: 'compact' }}
      tags={map(filteredPatientTags, tagId => patientTags?.[tagId])}
    />
  );
};

const fetchPatients = (api, clinicId, options) => {
  return new Promise((resolve, reject) => {
    api.clinics.getPatientsForClinic(clinicId, options, (err, results) => {
      if (err) {
        reject(results);
        return;
      }

      resolve(results);
    });
  });
};

const getOpts = (category, offset) => {
  const opts = { offset, limit: PATIENT_ROW_LIMIT };

  switch(category) {
    case CATEGORY.DEFAULT: return opts;

    case CATEGORY.ANY_LOW: return {...opts, 'cgm.timeInAnyLowPercent': '>=0.04' };

    case CATEGORY.ANY_HIGH: return {...opts, 'cgm.timeInAnyHighPercent': '>=0.25' };

    case CATEGORY.VERY_LOW: return {...opts, 'cgm.timeInVeryLowPercent': '>=0.01' };

    case CATEGORY.VERY_HIGH: return {...opts, 'cgm.timeInVeryHighPercent': '>=0.05' };

    // TODO: These two are not quite possible yet without BE modifications to allowed parameters.
    case CATEGORY.OTHER: return opts;
    case CATEGORY.TARGET: return opts;
  }
};

const fetchPatientsWrapper = async (
  api,
  selectedClinicId,
  category,
  offset,
  setLoading,
  onSuccess
) => {
  setLoading(true);
  try {
    const options = getOpts(category, offset);
    const response = await fetchPatients(api, selectedClinicId, options);

    const patients = keyBy((response?.data || []), 'id');
    const count = response?.meta?.count || 0;

    onSuccess(patients, count);
    setLoading(false);
  } catch(_err) {
    setLoading(false);
  }
};

const Flag = ({ loading, category, summary }) => {
  const period = summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD];

  if (!period) return null;

  let value;
  let rangeName;
  let title;
  let text;

  // TODO: Fix text to be bgUnit-sensitive
  switch(true) {
    case category === CATEGORY.VERY_LOW && period.timeInVeryLowPercent > 0.01:
      value = 'timeInVeryLowPercent';
      rangeName = 'veryLow';
      title = 'Very Low';
      text = 'Greater than 1% time <54 mg/dL';
      break;
    case category === CATEGORY.ANY_LOW && period.timeInAnyLowPercent > 0.04:
      value = 'timeInAnyLowPercent';
      rangeName = 'anyLow';
      title = 'Low';
      text = 'Greater than 4% time <70 mg/dL';
      break;
    case category === CATEGORY.VERY_HIGH && period.timeInVeryHighPercent > 0.05:
      value = 'timeInVeryHighPercent';
      rangeName = 'veryHigh';
      title = 'Very High';
      text = 'Greater than 5% time >250 mg/dL';
      break;
    case category === CATEGORY.ANY_HIGH && period.timeInAnyHighPercent > 0.25:
      value = 'timeInAnyHighPercent';
      rangeName = 'anyHigh';
      title = 'High';
      text = 'Greater than 25% time >180 mg/dL';
      break;
    case period.timeInVeryLowPercent > 0.01:
      value = 'timeInVeryLowPercent';
      rangeName = 'veryLow';
      title = 'Very Low';
      text = 'Greater than 1% time <54 mg/dL';
      break;
    case period.timeInAnyLowPercent > 0.04:
      value = 'timeInAnyLowPercent';
      rangeName = 'anyLow';
      title = 'Low';
      text = 'Greater than 4% time <70 mg/dL';
      break;
    case period.timeInVeryHighPercent > 0.05:
      value = 'timeInVeryHighPercent';
      rangeName = 'veryHigh';
      title = 'Very High';
      text = 'Greater than 5% time >250 mg/dL';
      break;
    case period.timeInAnyHighPercent > 0.25:
      value = 'timeInAnyHighPercent';
      rangeName = 'anyHigh';
      title = 'High';
      text = 'Greater than 25% time >180 mg/dL';
      break;
  }

  if (!value) return null;

  if (loading) {
    return (
      <Box px={1} py={1} ml={-2} sx={{
        backgroundColor: `${vizColors.gray30}1A`, // Adding '1A' reduces opacity to 0.1
        borderRadius: 4,
        minHeight: '25px',
        minWidth: '200px',
      }}></Box>
    );
  }

  return (
    <Box px={1} py={1} ml={-2} sx={{
      backgroundColor: `${colors.bg[rangeName]}1A`, // Adding '1A' reduces opacity to 0.1
      borderRadius: 4,
    }}>
      <Flex as="label" htmlFor={`range-${value}-filter`} sx={{ alignItems: 'center' }}>
        <Box
          id={`range-${value}-filter-option-color-indicator`}
          sx={{
            position: 'relative',
            borderRadius: 4,
            backgroundColor: colors.bg[rangeName],
            width: '12px',
            height: '12px',

            // The styles within the :after pseudo-class below create a diagonal line

            border: value === 'timeInTargetPercent' && `1.5px solid ${colors.blueGreyDark}`,
            '&::after': value === 'timeInTargetPercent' && {
              content: '""',
              height: '1.5px',
              width: '141.421%',
              backgroundColor: colors.blueGreyDark,
              position: 'absolute',
              bottom: '0px',
              transform: 'rotate(-45deg)',
              transformOrigin: '1px 1px',
            },
          }}
          mr={2}
        >
        </Box>
        <Text id={`range-${value}-filter-option-title`} sx={{ fontSize: 0, color: vizColors.black }} mr={2}>
          {title}
        </Text>
        <Text id={`range-${value}-filter-option-text`} sx={{ fontSize: 0, color: vizColors.blue50 }} mr={2}>
          {' - '}{text}
        </Text>
      </Flex>
    </Box>
  );
};

const TideDashboardV2 = ({ api, trackMetric }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [category, setCategory] = useState(CATEGORY.DEFAULT);
  const [clinicPatients, setClinicPatients] = useState({});
  const [loading, setLoading] = useState(false);

  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const onRefetchSuccess = (patients, count) => {
    setClinicPatients(patients);
    setCount(count);
  };

  useEffect(() => {
    fetchPatientsWrapper(api, selectedClinicId, category, offset, setLoading, onRefetchSuccess);
  }, [api, dispatch, selectedClinicId, category, offset]);

  const handleSelectCategory = (category) => {
    setCount(0);
    setOffset(0);
    setCategory(category);
  };

  return (
    <Box px={4}>
      <CategorySelector value={category} onChange={handleSelectCategory} />

      <Table
        className='dashboard-table'
        id='dashboard-table-v2'
        variant="tableGroup"
        label={t('Patients Table')}
        columns={[
          {
            title: t('Patient Name'),
            field: 'fullName',
            align: 'left',
            render: ({ fullName }) => (
              <Text sx={{ display: 'block', width: '240px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {fullName}
              </Text>
            ),
            width: 320,
          },
          {
            title: t('Flag'),
            field: '',
            align: 'left',
            render: props => <Flag loading={loading} category={category} {...props} />,
            width: 320,
          },
          {
            title: t('Avg Glucose'),
            field: 'summary.cgmStats.periods.14d.averageGlucoseMmol',
            align: 'center',
            render: ({ summary }) => {
              const averageGlucoseMmol = summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]?.averageGlucoseMmol;
              return averageGlucoseMmol ? <span>{bankersRound(averageGlucoseMmol, 1)}</span> : null;
            },
          },
          {
            title: t('GMI'),
            field: 'summary.cgmStats.periods.14d.glucoseManagementIndicator',
            align: 'center',
            render: renderBgRangeSummary,
            width: 240,
          },
          {
            title: t('% Change in TIR'),
            field: 'timeInTargetPercentDelta',
            align: 'center',
            render: renderTimeInTargetPercentDelta,
          },
          {
            title: t('Tags'),
            field: 'patientTags',
            align: 'center',
            render: props => <RenderPatientTags {...props} />,
          },
          {
            title: t('Last Reviewed'),
            field: '',
            align: 'center',
            render: () => null,
          },
        ]}
        data={clinicPatients}
        sx={{
          fontSize: 1,
          'tr': { height: [null, null, '40px', '40px'] },
          'thead': { fontSize: 0 },
          'thead th': { fontWeight: 'normal' },
          'th div': { display: 'flex', alignItems: 'center' },
        }}
        emptyText={t('No patients found.')}
        containerProps={{
          sx: {
            '.table-empty-text': {
              backgroundColor: 'white',
              borderBottomLeftRadius: radii.medium,
              borderBottomRightRadius: radii.medium,
            },
          },
        }}
      />

      <Pagination
        limit={PATIENT_ROW_LIMIT}
        offset={offset}
        count={count}
        onChange={(newOffset) => setOffset(newOffset)}
      />
    </Box>
  );
};

export default TideDashboardV2;

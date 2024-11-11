import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { useFormik } from 'formik';
import { Box, BoxProps } from 'theme-ui';

import { TagList } from '../../components/elements/Tag';
import RadioGroup from '../../components/elements/RadioGroup';
import { useLocalStorage } from '../../core/hooks';
import { getCommonFormikFieldProps, getFieldError } from '../../core/forms';
import { tideDashboardConfigSchema as validationSchema, summaryPeriodOptions, lastDataFilterOptions } from '../../core/clinicUtils';
import { Body0, Caption } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';
import { push } from 'connected-react-router';

function getFormValues(config, clinicPatientTags) {
  return {
    period: config?.period || null,
    lastData: config?.lastData || null,
    tags: config?.tags ? reject(config.tags, tagId => !clinicPatientTags?.[tagId]) : null,
  };
}

export function validateTideConfig(config, clinicPatientTags) {
  try {
    validationSchema.validateSync(getFormValues(config, clinicPatientTags));
    return true;
  } catch (err) {
    return false;
  }
};

export const TideDashboardConfigForm = props => {
  const { t, api, onFormChange, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const [config, setConfig] = useLocalStorage('tideDashboardConfig', {});
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const isDashboardPage = (pathname === '/dashboard/tide');

  const formikContext = useFormik({
    initialValues: getFormValues(config?.[localConfigKey], clinicPatientTags),
    onSubmit: values => {
      if (!isDashboardPage) dispatch(push('/dashboard/tide'));

      setConfig({
        ...config,
        [localConfigKey]: values,
      });
    },
    validationSchema,
  });

  const {
    errors,
    setFieldValue,
    setFieldTouched,
    values,
  } = formikContext;

  useEffect(() => {
    onFormChange(formikContext);
  }, [values, clinicPatientTags]);

  return (
    <Box
      as="form"
      id="tide-dashboard-config-form"
      {...boxProps}
    >
      <Box id='patient-tags-select' mb={3}>
        <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Select Patient Tag(s)')}</Body0>

        <TagList
          tags={map(clinic?.patientTags, tag => ({
            ...tag,
            selected: includes(values.tags, tag.id),
          }))}
          tagProps={{
            onClick: tagId => {
              setFieldTouched('tags', true, true);
              setFieldValue('tags', [...(values.tags || []), tagId]);
            },
            sx: { userSelect: 'none' },
          }}
          selectedTagProps={{
            onClick: tagId => {
              setFieldValue('tags', without(values.tags, tagId));
            },
            sx: {
              color: 'white',
              backgroundColor: 'purpleMedium',
            },
          }}
        />

        {getFieldError('tags', formikContext, false) && (
          <Caption ml={2} mt={2} sx={{ color: 'feedback.danger' }}>
            {errors.tags}
          </Caption>
        )}
      </Box>

      <Box sx={{ borderTop: borders.default }} py={3}>
        <Body0 sx={{ fontWeight: 'bold' }} mb={0}>{t('Data Recency')}</Body0>
        <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will only show patients who have data within the selected number of days.')}</Body0>

        <RadioGroup
          options={lastDataFilterOptions}
          {...getCommonFormikFieldProps('lastData', formikContext)}
          variant="vertical"
        />
      </Box>

      <Box sx={{ borderTop: borders.default }} pt={3}>
        <Body0 sx={{ fontWeight: 'bold' }} mb={0}>{t('Number of Days to Summarize')}</Body0>
        <Body0 sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will generate health summaries for the selected number of days.')}</Body0>

        <RadioGroup
          options={summaryPeriodOptions}
          {...getCommonFormikFieldProps('period', formikContext)}
          variant="vertical"
        />
      </Box>
    </Box>
  );
};

TideDashboardConfigForm.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(TideDashboardConfigForm);

import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { useFormik } from 'formik';
import { Box, BoxProps } from 'rebass/styled-components';

import * as actions from '../../redux/actions';
import { TagList } from '../../components/elements/Tag';
import RadioGroup from '../../components/elements/RadioGroup';
import { useToasts } from '../../providers/ToastProvider';
import { useIsFirstRender, useLocalStorage } from '../../core/hooks';
import { getCommonFormikFieldProps } from '../../core/forms';
import { tideDashboardConfigSchema as validationSchema, summaryPeriodOptions, lastUploadDateFilterOptions } from '../../core/clinicUtils';
import { Body0 } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';

function getFormValues(config, clinicPatientTags) {
  return {
    tags: reject(config?.tags || [], tagId => !clinicPatientTags?.[tagId]),
  };
}

export const TideDashboardConfigForm = (props) => {
  const { t, api, onFormChange, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const [initialValues, setInitialValues] = useState({});
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const [config, setConfig] = useLocalStorage('tideDashboardConfig', {});
  const { fetchingTideDashboardPatients } = useSelector((state) => state.blip.working);

  const formikContext = useFormik({
    initialValues: getFormValues(config, clinicPatientTags),
    onSubmit: (values, formikHelpers) => {
      dispatch(actions.async.fetchTideDashboard(api, selectedClinicId, values));
    },
    validationSchema,
  });

  const {
    errors,
    setFieldValue,
    setValues,
    status,
    values,
  } = formikContext;

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }

  useEffect(() => {
    // set form field values and store initial config values on load
    const patientValues = getFormValues(config, clinicPatientTags);
    setValues(patientValues);
    setInitialValues(patientValues);
  }, [config, clinicPatientTags]);

  useEffect(() => {
    onFormChange(formikContext);
  }, [values, clinicPatientTags]);

  useEffect(() => {
    handleAsyncResult(fetchingTideDashboardPatients);
  }, [fetchingTideDashboardPatients]);

  return (
    <Box
      as="form"
      id="tide-dashboard-config-form"
      {...boxProps}
    >
      <Box id='patient-tags-select' mb={3}>
        <Body0 fontWeight="medium" mb={2}>{t('Select Patient Tags')}</Body0>

        <TagList
          tags={map(clinic?.patientTags, tag => ({
            ...tag,
            selected: includes(values.tags, tag.id),
          }))}
          tagProps={{
            onClick: tagId => {
              setFieldValue('tags', [...values.tags, tagId]);
            },
            sx: { userSelect: 'none' }
          }}
          selectedTagProps={{
            onClick: tagId => {
              setFieldValue('tags', without(values.tags, tagId));
            },
            color: 'white',
            backgroundColor: 'purpleMedium',
          }}
        />
      </Box>

      <Box sx={{ borderTop: borders.default }} py={3}>
        <Body0 fontWeight="medium" mb={2}>{t('Select Duration')}</Body0>

        <RadioGroup
          id="summary-period-select"
          options={summaryPeriodOptions}
          {...getCommonFormikFieldProps('period', formikContext)}
          variant="vertical"
        />
      </Box>

      <Box sx={{ borderTop: borders.default }} pt={3}>
        <Body0 fontWeight="medium" mb={2}>{t('Select Last Upload Date')}</Body0>

        <RadioGroup
          id="summary-period-select"
          options={lastUploadDateFilterOptions}
          {...getCommonFormikFieldProps('lastUpload', formikContext)}
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
  patient: PropTypes.object,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(TideDashboardConfigForm);

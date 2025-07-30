import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import * as yup from 'yup';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import { useFormik } from 'formik';
import { Box, Flex } from 'theme-ui';

import TextInput from '../../components/elements/TextInput';
import Select from '../../components/elements/Select';
import RadioGroup from '../../components/elements/RadioGroup';
import DatePicker from '../../components/elements/DatePicker';
import Container from '../../components/elements/Container';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';
import i18next from '../../core/language';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import personUtils from '../../core/personutils';
import { addEmptyOption } from '../../core/forms';
import { DIABETES_TYPES } from '../../core/constants';

const t = i18next.t.bind(i18next);

const accountTypeOptions = [
  { value: 'personal', label: t('This is for me, I have diabetes')},
  { value: 'caregiver', label: t('I\'m creating an account on behalf of someone I care for who has diabetes')},
  { value: 'viewOnly', label: t('I\'m creating a view-only account so someone can share their data with me')},
];

const accountDetailsSchema = yup.object().shape({
  firstName: yup.string().required(t('First Name is required')),
  lastName: yup.string().required(t('Last Name is required')),
  accountType: yup.string().oneOf([...map(accountTypeOptions, 'value'), '']).required(t('Account type is required')),
  patientFirstName: yup.mixed().notRequired().when('accountType', {
    is: 'caregiver',
    then: () => yup.string().required(t('Patient first name is required')),
  }),
  patientLastName: yup.mixed().notRequired().when('accountType', {
    is: 'caregiver',
    then: () => yup.string().required(t('Patient last name is required')),
  }),
});

const dateFormat = 'YYYY-MM-DD';
const diagnosisTypeOptions = DIABETES_TYPES(); // eslint-disable-line new-cap

const patientDetailsSchema = yup.object().shape({
  birthday: yup.date()
    .min(moment().startOf('day').subtract(130, 'years').format(dateFormat), t('Please enter a date within the last 130 years'))
    .max(moment().startOf('day').format(dateFormat), t('Please enter a date prior to today'))
    .required(t('Patient\'s birthday is required')),
  diagnosisDate: yup.date().test(
      'later_date_test',
      'Please enter a date that comes after the birthday',
      function (value) {
        const { birthday } = this.parent;
        return !!value && moment(value).valueOf() > moment(birthday).valueOf();
      }
    )
    .max(moment().startOf('day').format(dateFormat), t('Please enter a date prior to today'))
    .required(t('Patient\'s diagnosis date is required')),
  diagnosisType: yup.string().oneOf([...map(diagnosisTypeOptions, 'value'), '']),
});

const formSteps = {
  accountDetails: 'accountDetails',
  patientDetails: 'patientDetails',
}

const schemas = {
  accountDetails: accountDetailsSchema,
  patientDetails: patientDetailsSchema,
};

export const PatientNew = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Viewed Profile Create');
    }
  }, []);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const user = get(allUsersMap, loggedInUserId);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const [submitting, setSubmitting] = useState(false);
  const [currentForm, setCurrentForm] = useState(formSteps.accountDetails);

  function redirectBack() {
    setCurrentForm(formSteps.accountDetails);
  }

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.settingUpDataStorage;

    const prevInProgress = get(
      previousWorking,
      'settingUpDataStorage.inProgress'
    );

    if (!inProgress && completed !== null && prevInProgress) {
      setSubmitting(false);

      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Profile updated'),
          variant: 'success',
        });

        // Redirect to patient data view
        dispatch(push(`/patients/${loggedInUserId}/data`));
      }
    }
  }, [working.settingUpDataStorage]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.updatingUser;

    const prevInProgress = get(
      previousWorking,
      'updatingUser.inProgress'
    );

    if (!inProgress && completed !== null && prevInProgress) {
      setSubmitting(false);

      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Profile updated'),
          variant: 'success',
        });

        // Redirect to patients page
        dispatch(push('/patients?justLoggedIn=true'));
      }
    }
  }, [working.updatingUser]);

  const { firstName, lastName } = personUtils.splitNamesFromFullname(user?.profile?.fullName);

  const formikContext = useFormik({
    initialValues: {
      firstName,
      lastName,
      accountType: null,
      patientFirstName: '',
      patientLastName: '',
      birthday: null,
      diagnosisDate: null,
      diagnosisType: '',
    },
    validationSchema: schemas[currentForm],
    onSubmit: values => {
      if (includes(['personal', 'caregiver'], values.accountType)) {
        if (currentForm === formSteps.accountDetails) {
          setCurrentForm(formSteps.patientDetails);
        } else {
          setSubmitting(true);
          const profile = prepareFormValuesForSubmit(values);
          dispatch(actions.async.setupDataStorage(api, profile));
        }
      } else if (values.accountType === 'viewOnly') {
        setSubmitting(true);
        const profile = prepareFormValuesForSubmit(values);
        // We skip the welcome message on the patients home page, which just prompts them to set up
        // data storage, which they've just indicated they don't want to do at this time.
        dispatch(actions.sync.hideWelcomeMessage());
        dispatch(actions.async.updateUser(api, profile));
      }
    },
  });

  function prepareFormValuesForSubmit(formValues) {
    const profile = {
      fullName: personUtils.fullnameFromSplitNames(formValues.firstName, formValues.lastName),
    };

    if (includes(['personal', 'caregiver'], formValues.accountType)) {
      profile.patient = {
        birthday: moment(formValues.birthday).format(dateFormat),
        diagnosisDate: moment(formValues.diagnosisDate).format(dateFormat),
      };

      if (!isEmpty(formValues.diagnosisType)) {
        profile.patient.diagnosisType = formValues.diagnosisType;
      }

      if (formValues.accountType === 'caregiver') {
        profile.patient.isOtherPerson = true;
        profile.patient.fullName = personUtils.fullnameFromSplitNames(formValues.patientFirstName, formValues.patientLastName);
      }
    }

    return { profile };
  }

  const { values, submitForm, setFieldValue, setFieldTouched } = formikContext;

  useEffect(() => {
    if (values.accountType !== 'caregiver') {
      setFieldValue('patientFirstName', '')
      setFieldValue('patientLastName', '')
    }
  }, [values.accountType, setFieldValue]);

  const accountTypeText = {
    personal: {
      subtitle: null,
      birthday: t('What is your birthday?'),
      diagnosisDate: t('When were you diagnosed?'),
      diagnosisType: t('What type of diabetes do you live with?'),
    },
    caregiver: {
      subtitle: t('Tell us more about {{firstName}}', { firstName: values.patientFirstName }),
      birthday: t('What is their birthday?'),
      diagnosisDate: t('When were they diagnosed?'),
      diagnosisType: t('What type of diabetes do they live with? (optional)'),
    },
  };

  const formStepsText = {
    accountDetails: {
      title: t('Welcome'),
      subtitle: t('Tell us more about yourself'),
    },
    patientDetails: {
      title: t('About You'),
      subtitle: accountTypeText[values.accountType]?.subtitle,
    },
  }

  const formActions = [{
    id: 'submit',
    children: t('Next'),
    processing: submitting,
    disabled: !fieldsAreValid(
      keys(schemas[currentForm].fields),
      schemas[currentForm],
      values
    ),
    onClick: () => {
      if ((currentForm === formSteps.accountDetails && values.accountType === 'viewOnly') || currentForm === formSteps.patientDetails) {
        submitForm();
      } else {
        setCurrentForm(formSteps.patientDetails);
      }
    },
  }];

  if (currentForm === formSteps.patientDetails) formActions.unshift({
    id: 'back',
    variant: 'secondary',
    children: t('Back'),
    onClick: () => redirectBack(),
  });

  return (
    <Container
      title={formStepsText[currentForm]?.title}
      subtitle={formStepsText[currentForm]?.subtitle}
      variant="mediumBordered"
      actions={formActions}
      p={4}
      pt={3}
    >
      <Box id="new-patient-profile">
        {currentForm === formSteps.accountDetails && (
          <Flex id="user-details-form" sx={{ flexWrap: 'wrap', flexDirection: ['column', 'row'], alignItems: [null, 'flex-start'] }}>
            <Box pr={[0,1]} mb={[2, 3]} sx={{ flexBasis: ['100%', '50%'] }}>
              <TextInput
                {...getCommonFormikFieldProps('firstName', formikContext)}
                label={t('What is your name?')}
                placeholder={t('First name')}
                variant="condensed"
                width="100%"
              />
            </Box>

            <Box pr={[0,0]} mb={3} sx={{ flexBasis: ['100%', '50%'] }}>
              <TextInput
                {...getCommonFormikFieldProps('lastName', formikContext)}
                label={t('Last name')}
                hideLabel
                placeholder={t('Last name')}
                variant="condensed"
                width="100%"
              />
            </Box>

            <Box sx={{ flexBasis: '100%' }}>
              <RadioGroup
                id="account-type"
                label={t('Who is this account for?')}
                options={accountTypeOptions}
                {...getCommonFormikFieldProps('accountType', formikContext)}
                variant="vertical"
              />
            </Box>

            {values.accountType === 'caregiver' && (
              <Flex mt={3} sx={{ flexBasis: '100%', flexWrap: 'wrap', flexDirection: ['column', 'row'], alignItems: [null, 'flex-start'] }}>
                <Box pr={[0,1]} mb={[2, 0]} sx={{ flexBasis: ['100%', '50%'] }}>
                  <TextInput
                    {...getCommonFormikFieldProps('patientFirstName', formikContext)}
                    label={t('What is their name?')}
                    placeholder={t('First name')}
                    variant="condensed"
                    width="100%"
                  />
                </Box>

                <Box pr={[0,0]} mb={0} sx={{ flexBasis: ['100%', '50%'] }}>
                  <TextInput
                    {...getCommonFormikFieldProps('patientLastName', formikContext)}
                    label={t('Last name')}
                    hideLabel
                    placeholder={t('Last name')}
                    variant="condensed"
                    width="100%"
                  />
                </Box>
              </Flex>
            )}
          </Flex>
        )}

        {currentForm === formSteps.patientDetails && (
          <Box id="patient-details-form">
            <Box mb={3} sx={{ flexBasis: '100%' }}>
              <DatePicker
                {...getCommonFormikFieldProps('birthday', formikContext, 'date', false)}
                label={accountTypeText[values.accountType]?.birthday}
                onDateChange={newDate => setFieldValue('birthday', newDate)}
                showYearPicker
                isOutsideRange={day => (moment().diff(day) <= 0)}
                onClose={() => setTimeout(() => {
                  setFieldTouched('birthday', true);
                }, 0)}
                onFocusChange={focused => { if (!focused) setFieldTouched('birthDay', true); }}
                themeProps={{
                  width: '100%',
                  sx: { '.SingleDatePicker,.SingleDatePickerInput,.DateInput,input': { width: '100%' } },
                }}
              />
            </Box>

            <Box mb={3} sx={{ flexBasis: '100%' }}>
              <DatePicker
                {...getCommonFormikFieldProps('diagnosisDate', formikContext, 'date', false)}
                label={accountTypeText[values.accountType]?.diagnosisDate}
                onDateChange={newDate => setFieldValue('diagnosisDate', newDate)}
                showYearPicker
                isOutsideRange={day => (moment().diff(day) <= 0)}
                onClose={() => setTimeout(() => {
                  setFieldTouched('diagnosisDate', true);
                }, 0)}
                themeProps={{
                  width: '100%',
                  sx: { '.SingleDatePicker,.SingleDatePickerInput,.DateInput,input': { width: '100%' } },
                }}
              />
            </Box>

            <Box mb={3} sx={{ flexBasis: '100%' }}>
              <Select
                {...getCommonFormikFieldProps('diagnosisType', formikContext)}
                options={addEmptyOption(diagnosisTypeOptions, t('Select one'))}
                label={accountTypeText[values.accountType]?.diagnosisType}
                variant="condensed"
                themeProps={{
                  width: '100%',
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

PatientNew.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(PatientNew);

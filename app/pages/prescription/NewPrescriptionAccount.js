import React, { useState } from 'react';
import { translate } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box } from 'rebass/styled-components';
import bows from 'bows';
import moment from 'moment';
import get from 'lodash/get';

import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import DatePicker from '../../components/elements/DatePicker';
import { Headline } from '../../components/elements/FontStyles';


const log = bows('NewPrescriptionAccount');

export const accountForm = {
  initialValues: {
    type: null,
    name: {
      first: '',
      last: '',
    },
    birthday: null,
  },
  displayName: 'AccountForm',
};

let formik;

export const AccountType = translate()((props) => {
  const { handleChange, values, t } = props;

  return (
    <Box width={0.5} margin="auto">
      <Headline>{t('Who are you creating your account for?')}</Headline>
      <RadioGroup
        id="type"
        name="type"
        options={[
          { value: 'patient', label: t('Patient') },
          { value: 'caregiver', label: t('Patient and caregiver') },
        ]}
        value={values.type}
        onChange={handleChange}
      />
    </Box>
  );
});

export const PersonalInfo = translate()((props) => {
  const { handleChange, setFieldValue, values, t } = props;

  return (
    <Box width={0.5} margin="auto">
      <Headline>{t('Please enter patient\'s name and birthdate')}</Headline>
      <TextInput
        label={t('First Name')}
        id="name.first"
        name="name.first"
        value={values.name.first}
        onChange={handleChange}
      />
      <TextInput
        label={t('Last Name')}
        id="name.last"
        name="name.last"
        value={values.name.last}
        onChange={handleChange}
      />
      <DatePicker
        label={t('Patient\'s Birthday')}
        id="birthday"
        name="birthday"
        date={values.birthday ? moment.utc(values.birthday) : null}
        onDateChange={newDate => {
          setFieldValue('birthday', newDate.toISOString())
        }}
      />
    </Box>
  );
});

export const accountSteps = () => {
  // const [formikState, setFormikState] = React.useState();
  // const handleFormikStateChange = (newState) => {
  //   setFormikState({
  //     ...formikState,
  //     ...newState,
  //   });
  // };

  const withFormikWrapper = WrappedComponent => (props = {}) => {
    const formikProps = useFormik(accountForm);
    formik = formik || formikProps;
    // const {values, touched, errors} = formikProps;

    // React.useEffect(() => {
    //   console.log('values', values);
    //   console.log('touched', touched);
    //   console.log('errors', errors);
    //   handleFormikStateChange({ values, touched, errors })
    // }, [values, touched, errors]);

    return <WrappedComponent {...props} {...formik} />
  };

  console.log('formik', formik);

  return {
    label: 'Create Patient Account',
    onComplete: () => log('Patient Account Created'),
    subSteps: [
      {
        disableComplete: !get(formik, 'values.type'),
        hideBack: true,
        onComplete: () => log('Account Step One Complete'),
        panelContent: withFormikWrapper(AccountType)(),
      },
      {
        disableComplete: !get(formik, 'values.name.first') || !get(formikState, 'values.name.last'),
        onComplete: log('Account Step Two Complete'),
        panelContent: withFormikWrapper(PersonalInfo)(),
      },
    ],
  };
};

export default accountSteps;

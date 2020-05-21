import React from 'react';
import { translate } from 'react-i18next';
import { useFormikContext, FastField } from 'formik';
import { Box } from 'rebass/styled-components';
import bows from 'bows';
import moment from 'moment';

import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import DatePicker from '../../components/elements/DatePicker';
import { Headline } from '../../components/elements/FontStyles';

const log = bows('NewPrescriptionAccount');

export const AccountType = translate()((props) => {
  const { t } = props;
  const { getFieldMeta } = useFormikContext();

  const meta = {
    'type': getFieldMeta('type'),
  };

  return (
    <Box width={0.5} margin="auto">
      <Headline>{t('Who are you creating your account for?')}</Headline>
      <FastField
        as={RadioGroup}
        id="type"
        name="type"
        options={[
          { value: 'patient', label: t('Patient') },
          { value: 'caregiver', label: t('Patient and caregiver') },
        ]}
        error={meta['type'].touched && meta['type'].error}
      />
    </Box>
  );
});

export const PersonalInfo = translate()((props) => {
  const { t } = props;
  const { setFieldValue, setFieldTouched, values, getFieldMeta } = useFormikContext();

  const meta = {
    'name.first': getFieldMeta('name.first'),
    'name.last': getFieldMeta('name.last'),
    'birthday': getFieldMeta('birthday'),
  };

  return (
    <Box width={0.5} margin="auto">
      <Headline>{t('Please enter patient\'s name and birthdate')}</Headline>
      <FastField
        as={TextInput}
        label={t('First Name')}
        id="name.first"
        name="name.first"
        error={meta['name.first'].touched && meta['name.first'].error}
      />
      <FastField
        as={TextInput}
        label={t('Last Name')}
        id="name.last"
        name="name.last"
        error={meta['name.last'].touched && meta['name.last'].error}
      />
      <FastField
        as={DatePicker}
        label={t('Patient\'s Birthday')}
        id="birthday"
        name="birthday"
        date={values.birthday ? moment.utc(values.birthday) : null}
        onDateChange={newDate => {
          setFieldValue('birthday', newDate.toISOString())
        }}
        onFocusChange={newFocused => {
          if (!newFocused) setFieldTouched('birthday', true)
        }}
        error={meta['birthday'].touched && meta['birthday'].error}
      />
    </Box>
  );
});

const accountSteps = () => {
  const {errors, touched, values} = useFormikContext();

  this.log('errors', errors);
  this.log('touched', touched);
  this.log('values', values);

  return {
    label: 'Create Patient Account',
    onComplete: () => log('Patient Account Created'),
    subSteps: [
      {
        disableComplete: !values.type,
        hideBack: true,
        onComplete: () => log('Account Step One Complete'),
        panelContent: <AccountType />
      },
      {
        disableComplete: !values.name.first || !values.name.last,
        onComplete: log('Account Step Two Complete'),
        panelContent: <PersonalInfo />,
      },
    ],
  };
};

export default accountSteps;

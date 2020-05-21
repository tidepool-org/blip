import * as yup from 'yup';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

export default yup.object().shape({
  type: yup.string().oneOf(['caregiver', 'patient'], 'Please select a valid option'),
  firstName: yup.string().required(t('First name is required')),
  lastName: yup.string().required(t('Last name is required')),
  birthday: yup.date().required(t('Patient\'s birthday is required')),
  email: yup.string().email(t('Please enter a valid email address')).required(t('Email address is required')),
  emailConfirm: yup.string()
    .oneOf([yup.ref('email')], 'Email address confirmation does not match')
    .required('Email confirmation is required'),
});

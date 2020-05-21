import * as yup from 'yup';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

export default yup.object().shape({
  type: yup.mixed().oneOf(['caregiver', 'patient'], 'Please select a valid option'),
  name: yup.object({
    first: yup.string().required(t('First name is required')),
    last: yup.string().required(t('Last name is required')),
  }),
  birthday: yup.date().required(t('Patient\'s birthday is required')),
});

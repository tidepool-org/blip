import prescriptionSchema from './prescriptionSchema';

export default {
  mapPropsToValues: () => ({
    type: '',
    firstName: '',
    lastName: '',
    birthday: null,
    email: '',
    emailConfirm: '',
  }),
  validationSchema: prescriptionSchema,
  displayName: 'PrescriptionForm',
}

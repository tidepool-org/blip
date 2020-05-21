import prescriptionSchema from './prescriptionSchema';

export default {
  mapPropsToValues: () => ({
    type: null,
    name: {
      first: '',
      last: '',
    },
    birthday: null,
  }),
  validationSchema: prescriptionSchema,
  displayName: 'PrescriptionForm',
}

import update from 'immutability-helper';
import * as actionTypes from '../constants/actionTypes';

const initialState = {
  isPatientListVisible: false,
  patientListSearchTextInput: '',
}

const patientListFilters = (state = initialState, action) => {
  console.log(action)

  switch (action.type) {
    case actionTypes.SET_IS_PATIENT_LIST_VISIBLE:
      return update(state, { $set: { isPatientListVisible: action.payload } });
    
    case actionTypes.SET_PATIENT_LIST_SEARCH_TEXT_INPUT:
      return update(state, { $set: { patientListSearchTextInput: action.payload } });

    default:
      return state;
  }
};

export default patientListFilters;

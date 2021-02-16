import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Button from '../../../app/components/elements/Button';
import TextInput from '../../../app/components/elements/TextInput';
import Table from '../../../app/components/elements/Table';
import ClinicAdmin from '../../../app/pages/clinicadmin';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe.only('ClinicAdmin', () => {
  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        //getAll: sinon.stub().callArgWith(1, null, [{id:'12345'}])
      },
    },
  };
  let store = mockStore({
    blip: {
      working: {
        fetchingClinics: {
          inProgress: false,
          completed: true,
          notification: null,
        },
        fetchingCliniciansFromClinic: {
          inProgress: false,
          complete: true,
          notification: null,
        },
      },
    },
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    wrapper = mount(
      <Provider store={store}>
        <ClinicAdmin {...defaultProps} />
      </Provider>
    );
  });

  it('should render an Invite button', () => {
    const inviteButton = wrapper.find(Button).filter({ variant: 'primary' });
    expect(inviteButton).to.have.length(1);
    expect(inviteButton.text()).to.equal('Invite new clinic team member');
    expect(inviteButton.props().onClick).to.be.a('function');

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/clinic-invite',
            {
              clinicId: '',
            },
          ],
          method: 'push',
        },
      },
    ];

    inviteButton.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should render a search bar', () => {
    const searchInput = wrapper.find(TextInput);
    expect(searchInput).to.have.length(1);
    expect(searchInput.props().onChange).to.be.a('function');
    searchInput
      .find('input')
      .simulate('change', { target: { value: 'new search text' } });
    const table = wrapper.find(Table);
    expect(table.props().searchText).to.equal('new search text');
  });
});

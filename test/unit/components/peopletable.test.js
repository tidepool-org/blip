/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';

import PeopleTable from '../../../app/components/peopletable';

const expect = chai.expect;

describe('PeopleTable', () => {
  const props = {
    people: [{
        profile: {
          fullName: 'Zoe Doe',
          patient: { birthday: '1969-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2aad188/data',
        },
        permissions: { root: {} },
        userid: 10,
      },
      {
        profile: {
          fullName: 'Tucker Doe',
          patient: { birthday: '1977-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2bbd188/data',
        },
        userid: 20,
      },
      {
        profile: {
          fullName: 'John Doe',
          patient: { birthday: '2000-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2ccd188/data',
        },
        userid: 30,
      },
      {
        profile: {
          fullName: 'amanda jones',
          patient: { birthday: '1989-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2ddd188/data',
        },
        userid: 40,
      },
      {
        profile: {
          fullName: 'Anna Zork',
          patient: { birthday: '2010-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2eed188/data',
        },
        userid: 50,
      }
    ],
    trackMetric: sinon.stub(),
    onRemovePatient: sinon.stub(),
  };

  let wrapper;

  beforeEach(() => {
    props.trackMetric.reset();
    props.onRemovePatient.reset();

    wrapper = mount(
      <PeopleTable
        {...props}
      />
    );
  });

  it('should be a function', function () {
    expect(PeopleTable).to.be.a('function');
  });

  describe('render', function () {
    it('should render without problems', function () {
      expect(wrapper.find(PeopleTable)).to.have.length(1);
    });

    it('should have provided search box', function () {
      expect(wrapper.find('.peopletable-search-box')).to.have.length(1);
    });

    it('should have provided toggle to show or hide names', function () {
      expect(wrapper.find('.peopletable-names-toggle')).to.have.length(1);
    });

    it('should have instructions displayed by default', function () {
      expect(wrapper.find('.peopletable-instructions').hostNodes()).to.have.length(1);
    });

    it('should default searching and showNames to be false', function () {
      expect(wrapper.instance().getWrappedInstance().state.searching).to.equal(false);
      expect(wrapper.instance().getWrappedInstance().state.showNames).to.equal(false);
    });
  });

  describe('showNames', function () {
    it('should show a row of data for each person', function () {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      wrapper.setState({ showNames: true });
      // 5 people plus one row for the header
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(6);
    });

    it('should trigger a call to trackMetric', function () {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      expect(props.trackMetric.calledWith('Clicked Show All')).to.be.true;
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('should not have instructions displayed', function () {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      expect(wrapper.find('.peopletable-instructions')).to.have.length(0);
    });
  });

  describe('searching', function () {
    it('should show a row of data for each person', function () {
      wrapper.instance().getWrappedInstance().setState({ searching: true });
      wrapper.update();
      // 5 people plus one row for the header
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(6);
    });

    it('should show a row of data for each person that matches the search value', function () {
      // showing `amanda` or `Anna`
      wrapper.find('input').simulate('change', {target: {value: 'a'}});
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(3);
      expect(wrapper.instance().getWrappedInstance().state.searching).to.equal(true);
      // now just showing `amanda`
      wrapper.find('input').simulate('change', {target: {value: 'am'}});
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(2);
      expect(wrapper.instance().getWrappedInstance().state.searching).to.equal(true);
    });

    it('should NOT trigger a call to trackMetric', function () {
      wrapper.find('input').simulate('change', {target: {value: 'am'}});
      expect(props.trackMetric.callCount).to.equal(0);
    });

    it('should not have instructions displayed', function () {
      wrapper.find('input').simulate('change', {target: {value: 'a'}});
      expect(wrapper.find('.peopletable-instructions')).to.have.length(0);
    });
  });

  describe('patient removal link', function () {
    beforeEach(() => {
      wrapper.find('.peopletable-names-toggle').simulate('click');
    });

    it('should have a remove icon for each patient', function () {
      expect(wrapper.find('.peopletable-icon-remove')).to.have.length(5);
    });

    it('should show open a modal for removing a patient when their remove icon is clicked', function () {
      const renderRemoveDialog = sinon.spy(wrapper.instance().getWrappedInstance(), 'renderRemoveDialog');

      // Modal should be hidden
      const overlay = () => wrapper.find('.ModalOverlay').hostNodes();
      expect(overlay()).to.have.length(1);
      expect(overlay().is('.ModalOverlay--show')).to.be.false;

      // Click the remove link for the last patient
      const removeLink = wrapper.find('RemoveLinkCell').last().find('i.peopletable-icon-remove');
      const handleRemoveSpy = sinon.spy(wrapper.instance().getWrappedInstance(), 'handleRemove');
      sinon.assert.notCalled(handleRemoveSpy);
      removeLink.simulate('click');
      sinon.assert.called(handleRemoveSpy);

      // Ensure the currentRowIndex is set to highlight the proper patient
      const state = (key) => wrapper.instance().getWrappedInstance().state[key];
      const currentRow = state('currentRowIndex');
      expect(currentRow).to.equal(4);
      const activeRow = wrapper.find('.peopletable-active-row').hostNodes();
      expect(activeRow).to.have.length(1);
      expect(activeRow.html()).to.contain('Zoe Doe');

      // Ensure the renderRemoveDialog method is called with the correct patient
      // Since we've clicked the last one, and the default sort is fullName alphabetically,
      // it should be 'Zoe Doe'
      sinon.assert.callCount(renderRemoveDialog, 1);
      sinon.assert.calledWith(renderRemoveDialog, state('dataList')[currentRow]);
      expect(state('dataList')[currentRow].fullName).to.equal('Zoe Doe');

      // Ensure the modal is showing
      expect(overlay().is('.ModalOverlay--show')).to.be.true;
      expect(state('showModalOverlay')).to.equal(true);
    });
  });

  describe('patient removal modal', function () {
    let removeLink;
    let overlay;

    beforeEach(() => {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      overlay = () => wrapper.find('.ModalOverlay');

      removeLink = wrapper.find('RemoveLinkCell').last().find('i.peopletable-icon-remove');
      removeLink.simulate('click');
    });

    it('should close the modal when the background overlay is clicked', function () {
      const overlayBackdrop = wrapper.find('.ModalOverlay-target');

      expect(overlay().is('.ModalOverlay--show')).to.be.true;
      overlayBackdrop.simulate('click');

      expect(overlay().is('.ModalOverlay--show')).to.be.false;
    });

    it('should close the modal when the cancel link is clicked', function () {
      const cancelButton = overlay().find('.btn-secondary');

      expect(overlay().is('.ModalOverlay--show')).to.be.true;
      cancelButton.simulate('click')

      expect(overlay().is('.ModalOverlay--show')).to.be.false;
    });

    it('should remove the patient when the remove button is clicked', function () {
      const removeButton = overlay().first().find('.btn-danger');

      expect(overlay().is('.ModalOverlay--show')).to.be.true;

      // Ensure that onRemovePatient is called with the proper userid
      removeButton.simulate('click')
      sinon.assert.callCount(props.onRemovePatient, 1);
      sinon.assert.calledWith(props.onRemovePatient, 10);
    })
  });

  describe('handleRemove', function (){
    let patient;
    let rowIndex;
    let proxy;

    beforeEach(function () {
      patient = wrapper.instance().getWrappedInstance().state.dataList[0];
      rowIndex = 4;
      proxy = wrapper.instance().getWrappedInstance().handleRemove(patient, rowIndex);
    });

    it('should return a proxy function', function () {
      expect(proxy).to.be.a('function');
    });

    it('should set the modal and currentRowIndex state appropriately when called', function () {
      const state = key => wrapper.instance().getWrappedInstance().state[key];
      expect(state('currentRowIndex')).to.equal(-1);
      expect(state('showModalOverlay')).to.be.false;
      expect(state('dialog')).to.equal('');

      proxy();

      expect(state('currentRowIndex')).to.equal(rowIndex);
      expect(state('showModalOverlay')).to.be.true;
      expect(state('dialog')).to.be.an('object');
    });
  })

  describe('handleRemovePatient', function () {
    let patient;
    let proxy;

    beforeEach(function () {
      patient = { userid: 40 };
      proxy = wrapper.instance().getWrappedInstance().handleRemovePatient(patient);
    });

    it('should return a proxy function', function () {
      expect(proxy).to.be.a('function');
    });

    it('should call the appropriate handlers when called', function () {
      sinon.assert.callCount(props.onRemovePatient, 0);
      sinon.assert.callCount(props.trackMetric, 0);

      proxy();

      sinon.assert.callCount(props.onRemovePatient, 1);
      sinon.assert.calledWith(props.onRemovePatient, 40);

      sinon.assert.callCount(props.trackMetric, 1);
      sinon.assert.calledWith(props.trackMetric, 'Web - clinician removed patient account');
    });
  })
});

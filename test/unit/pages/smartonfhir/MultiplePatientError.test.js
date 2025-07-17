/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';

const expect = chai.expect;

import { mount } from 'enzyme';

import { MultiplePatientError } from '../../../../app/pages/smartonfhir/MultiplePatientError';
import * as reactI18next from 'react-i18next';

const MockWarningRoundedIcon = () => <div className="mock-warning-rounded" />;
const MockIcon = (props) => <div className="mock-icon">{props.children}</div>;

describe('MultiplePatientError', () => {
  let wrapper;
  let useTranslationStub;

  beforeEach(() => {
    MultiplePatientError.__Rewire__('WarningRoundedIcon', MockWarningRoundedIcon);
    MultiplePatientError.__Rewire__('Icon', MockIcon);

    useTranslationStub = sinon.stub(reactI18next, 'useTranslation').returns({
      t: (key) => key
    });

    wrapper = mount(<MultiplePatientError />);
  });

  afterEach(() => {
    useTranslationStub.restore();
    MultiplePatientError.__ResetDependency__('WarningRoundedIcon');
    MultiplePatientError.__ResetDependency__('Icon');
  });

  it('should render without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render the warning box with icon', () => {
    const warningIcon = wrapper.find('.mock-icon');
    expect(warningIcon).to.have.length(1);

    const warningText = wrapper.findWhere(node =>
      node.type() &&
      node.text().includes('There are multiple patient records in Tidepool with identical MRN and date of birth to this patient.')
    );
    expect(warningText).to.have.length.at.least(1);
  });

  it('should render the resolution instructions header', () => {
    const resolutionHeader = wrapper.findWhere(node =>
      node.text() === 'To resolve this issue:'
    );
    expect(resolutionHeader).to.have.length.at.least(1);
  });

  it('should render an ordered list with the resolution steps', () => {
    const orderedList = wrapper.find('ol');
    expect(orderedList).to.have.length(1);

    const listItems = wrapper.find('li');
    expect(listItems).to.have.length(4);

    expect(listItems.at(0).text()).to.include('Log into Tidepool (app.tidepool.org) in a new browser');
    expect(listItems.at(1).text()).to.include('Search for this patient\'s MRN in the Patient List');
    expect(listItems.at(2).text()).to.include('Review duplicate accounts and either remove duplicates if appropriate or update MRNs to ensure each patient has a unique identifier');
    expect(listItems.at(3).text()).to.include('Once resolved, return to the EHR and try again');
  });

  it('should render a help text section with contact information', () => {
    const helpText = wrapper.findWhere(node =>
      node.text().includes('Need help? Contact')
    );
    expect(helpText).to.have.length.at.least(1);

    const emailLink = wrapper.find('a[href="mailto:support@tidepool.org"]');
    expect(emailLink).to.have.length(1);
    expect(emailLink.text()).to.equal('support@tidepool.org');
  });

  it('should render the main title', () => {
    const title = wrapper.findWhere(node =>
      node.text() === 'Multiple Patient Matches'
    );
    expect(title).to.have.length.at.least(1);
  });
});

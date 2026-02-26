/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global afterEach */

var React = require('react');
var expect = chai.expect;

import { render, fireEvent, cleanup } from '@testing-library/react';
import Header from '../../../../app/components/chart/header'

const makeProps = (overrides = {}) => ({
  patient: {
    profile: { fullName: 'Jane Doe' },
    permissions: { note: {}, view: {} }
  },
  chartType: 'Awesome',
  inTransition: false,
  atMostRecent: false,
  title: 'Most Awesome',
  onClickBack: sinon.stub(),
  onClickBasics: sinon.stub(),
  onClickTrends: sinon.stub(),
  onClickMostRecent: sinon.stub(),
  onClickNext: sinon.stub(),
  onClickOneDay: sinon.stub(),
  onClickBgLog: sinon.stub(),
  onClickSettings: sinon.stub(),
  ...overrides,
});

describe('Header', function () {
  afterEach(() => cleanup());

  describe('render', function() {
    it('should render without problems', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const { container } = render(<Header {...makeProps()} />);
        expect(container.firstChild).to.be.ok;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });

    it('should trigger onClickBack when inTransition is false and back button is clicked', function () {
      const props = makeProps({ inTransition: false });
      const { container } = render(<Header {...props} />);
      const backButton = container.querySelector('.js-back');
      expect(backButton).to.not.be.null;
      expect(props.onClickBack.callCount).to.equal(0);
      fireEvent.click(backButton);
      expect(props.onClickBack.callCount).to.equal(1);
    });

    it('should not trigger onClickBack when inTransition is true and back button is clicked', function () {
      const props = makeProps({ inTransition: true });
      const { container } = render(<Header {...props} />);
      const backButton = container.querySelector('.js-back');
      expect(backButton).to.not.be.null;
      expect(props.onClickBack.callCount).to.equal(0);
      fireEvent.click(backButton);
      expect(props.onClickBack.callCount).to.equal(0);
    });

    it('should trigger onClickTrends when trends button is clicked', function () {
      const props = makeProps();
      const { container } = render(<Header {...props} />);
      const trendsButton = container.querySelector('.js-trends');
      expect(trendsButton).to.not.be.null;
      expect(props.onClickTrends.callCount).to.equal(0);
      fireEvent.click(trendsButton);
      expect(props.onClickTrends.callCount).to.equal(1);
    });

    it('should trigger onClickMostRecent when inTransition is false and mostRecent button is clicked', function () {
      const props = makeProps({ inTransition: false });
      const { container } = render(<Header {...props} />);
      const mostRecentButton = container.querySelector('.js-most-recent');
      expect(mostRecentButton).to.not.be.null;
      expect(props.onClickMostRecent.callCount).to.equal(0);
      fireEvent.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(1);
    });

    it('should not trigger onClickMostRecent when inTransition is true and mostRecent button is clicked', function () {
      const props = makeProps({ inTransition: true });
      const { container } = render(<Header {...props} />);
      const mostRecentButton = container.querySelector('.js-most-recent');
      expect(mostRecentButton).to.not.be.null;
      expect(props.onClickMostRecent.callCount).to.equal(0);
      fireEvent.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(0);
    });

    it('should trigger onClickNext when inTransition is false and next button is clicked', function () {
      const props = makeProps({ inTransition: false });
      const { container } = render(<Header {...props} />);
      const nextButton = container.querySelector('.js-next');
      expect(nextButton).to.not.be.null;
      expect(props.onClickNext.callCount).to.equal(0);
      fireEvent.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(1);
    });

    it('should not trigger onClickNext when inTransition is true and next button is clicked', function () {
      const props = makeProps({ inTransition: true });
      const { container } = render(<Header {...props} />);
      const nextButton = container.querySelector('.js-next');
      expect(nextButton).to.not.be.null;
      expect(props.onClickNext.callCount).to.equal(0);
      fireEvent.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(0);
    });

    it('should trigger onClickBasics when basics button is clicked', function () {
      const props = makeProps();
      const { container } = render(<Header {...props} />);
      const basicsButton = container.querySelector('.js-basics');
      expect(basicsButton).to.not.be.null;
      expect(props.onClickBasics.callCount).to.equal(0);
      fireEvent.click(basicsButton);
      expect(props.onClickBasics.callCount).to.equal(1);
    });

    it('should trigger onClickOneDay when daily button is clicked', function () {
      const props = makeProps();
      const { container } = render(<Header {...props} />);
      const dayButton = container.querySelector('.js-daily');
      expect(dayButton).to.not.be.null;
      expect(props.onClickOneDay.callCount).to.equal(0);
      fireEvent.click(dayButton);
      expect(props.onClickOneDay.callCount).to.equal(1);
    });

    it('should trigger onClickBgLog when BG Log button is clicked', function () {
      const props = makeProps();
      const { container } = render(<Header {...props} />);
      const bgLogButton = container.querySelector('.js-bgLog');
      expect(bgLogButton).to.not.be.null;
      expect(props.onClickBgLog.callCount).to.equal(0);
      fireEvent.click(bgLogButton);
      expect(props.onClickBgLog.callCount).to.equal(1);
    });

    it('should trigger onClickSettings when settings button is clicked', function () {
      const props = makeProps();
      const { container } = render(<Header {...props} />);
      const settingsButton = container.querySelector('.js-settings');
      expect(settingsButton).to.not.be.null;
      expect(props.onClickSettings.callCount).to.equal(0);
      fireEvent.click(settingsButton);
      expect(props.onClickSettings.callCount).to.equal(1);
    });
  });
});

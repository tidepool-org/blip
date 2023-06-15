/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global before */
/* global after */

const expect = chai.expect;
import appContext from '../../app/bootstrap';

describe('appContext', () => {
  before(() => {
    appContext.api = {
      metrics: {
        track: sinon.stub(),
      },
    };
    appContext.store = {
      getState: sinon.stub().returns({ blip: {} }),
    };
  });

  afterEach(() => {
    appContext.api.metrics.track.resetHistory();
  });

  it('should call appContext.api.metrics.track with arguments when selectedClinicId is not present', () => {
    appContext.trackMetric('someMetric');

    expect(appContext.api.metrics.track.calledOnce).to.be.true;
    expect(appContext.api.metrics.track.calledWith('someMetric')).to.be.true;
  });

  it('should call appContext.api.metrics.track with clinicId defaulted to selectedClinicId when it is present', () => {
    const selectedClinicId = 'clinic123';

    appContext.store.getState.returns({ blip: { selectedClinicId } });

    appContext.trackMetric('someMetric2');

    expect(appContext.api.metrics.track.calledOnce).to.be.true;
    expect(
      appContext.api.metrics.track.calledWith('someMetric2', {
        clinicId: 'clinic123',
      })
    ).to.be.true;

    appContext.api.metrics.track.resetHistory();

    appContext.trackMetric('someMetric2', { clinicId: 'anotherClinic' });

    expect(appContext.api.metrics.track.calledOnce).to.be.true;
    expect(
      appContext.api.metrics.track.calledWith('someMetric2', {
        clinicId: 'anotherClinic',
      })
    ).to.be.true;
  });
});

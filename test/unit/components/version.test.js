/* global afterEach, before, chai, describe, it, sinon */

import React from 'react';
import { render } from '@testing-library/react';

import Version from '../../../app/components/version/';

const expect = chai.expect;

describe('Version', () => {
  const props = {
    version: '1.15.4',
  };

  it('should render the semver with `v` prepended', () => {
    const { container } = render(<Version {...props} />);
    expect(container.textContent).to.equal(`v${props.version}`);
  });
});
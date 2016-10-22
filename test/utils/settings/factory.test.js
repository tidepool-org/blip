/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import React from 'react';
import { shallow } from 'enzyme';

import * as factory from '../../../src/utils/settings/factory';

import NonTandem from '../../../src/components/settings/nontandem/NonTandem';
import Tandem from '../../../src/components/settings/tandem/Tandem';

describe('settings factory', () => {
  describe('NonTandem', () => {
    describe('Animas', () => {
      it('should return wrapped NonTandem component when given "animas"', () => {
        const Component = factory.getSettingsComponent('animas');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });

      it('should return wrapped NonTandem component when given "aNImaS"', () => {
        const Component = factory.getSettingsComponent('aNImaS');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });
    });

    describe('CareLink', () => {
      it('should return wrapped NonTandem component when given "carelink"', () => {
        const Component = factory.getSettingsComponent('carelink');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });

      it('should return wrapped NonTandem component when given "cArEliNK"', () => {
        const Component = factory.getSettingsComponent('cArEliNK');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });
    });


    describe('Insulet', () => {
      it('should return wrapped NonTandem component when given "insulet"', () => {
        const Component = factory.getSettingsComponent('insulet');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });

      it('should return wrapped NonTandem component when given "iNSulET"', () => {
        const Component = factory.getSettingsComponent('iNSulET');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });
    });


    describe('Medtronic', () => {
      it('should return wrapped NonTandem component when given "medtronic"', () => {
        const Component = factory.getSettingsComponent('medtronic');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });

      it('should return wrapped NonTandem component when given "mEdTRonIc"', () => {
        const Component = factory.getSettingsComponent('mEdTRonIc');
        assert.isFunction(Component);
        const wrapper = shallow(<Component />);
        expect(wrapper.find(NonTandem)).to.have.length(1);
      });
    });
  });

  describe('Tandem', () => {
    it('should return Tandem component when given "tandem"', () => {
      const Component = factory.getSettingsComponent('tandem');
      assert.isFunction(Component);
      const wrapper = shallow(<Component />);
      expect(wrapper.find(Tandem)).to.have.length(1);
    });

    it('should return Tandem component when given "tAnDEM"', () => {
      const Component = factory.getSettingsComponent('tAnDEM');
      assert.isFunction(Component);
      const wrapper = shallow(<Component />);
      expect(wrapper.find(Tandem)).to.have.length(1);
    });
  });

  describe('error', () => {
    it('should throw when given unknown deviceType', () => {
      const fn = () => { factory.getSettingsComponent('unknown'); };
      expect(fn).to.throw('`deviceType` must one of');
    });
  });
});

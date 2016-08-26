/* eslint-env node, mocha */
/* eslint no-console: 0*/

import React from 'react';
import { shallow } from 'enzyme';

import Table from '../../../src/components/common/Table';

describe('Table', () => {
  const testColumns = [
    { key: 'one',
      label: 'Label one',
    },
    { key: 'two',
      label: 'Label two',
    },
    { key: 'three',
      label: 'Label three',
    },
  ];
  const testData = [
    {
      one: 1,
      two: 'Two',
      three: 3.333,
    },
    {
      one: 'One',
      two: 2,
      three: 'Three',
    },
    {
      one: 1.1,
      two: 'Two',
      three: 3,
    },
  ];
  const testTitle = {
    label: 'Hello',
    className: 'stuff',
  };

  it('uses given rows, columns and title', () => {
    const wrapper = shallow(
      <Table
        title={testTitle}
        rows={testData}
        columns={testColumns}
      />
    );
    expect(wrapper.find('caption')).to.have.length(1);
    expect(wrapper.find('table')).to.have.length(1);
    expect(wrapper.find('thead')).to.have.length(1);
    expect(wrapper.find('th')).to.have.length(3);
    expect(wrapper.find('tr')).to.have.length(4);
    expect(wrapper.find('td')).to.have.length(9);
  });
  it('does not require a title', () => {
    const wrapper = shallow(
      <Table
        rows={testData}
        columns={testColumns}
      />
    );
    expect(wrapper.find('caption')).to.have.length(0);
    expect(wrapper.find('table')).to.have.length(1);
    expect(wrapper.find('thead')).to.have.length(1);
    expect(wrapper.find('th')).to.have.length(3);
    expect(wrapper.find('tr')).to.have.length(4);
    expect(wrapper.find('td')).to.have.length(9);
  });
  it('handles no data', () => {
    const wrapper = shallow(
      <Table
        rows={[]}
        columns={testColumns}
      />
    );
    expect(wrapper.find('caption')).to.have.length(0);
    expect(wrapper.find('table')).to.have.length(1);
    expect(wrapper.find('thead')).to.have.length(1);
    expect(wrapper.find('th')).to.have.length(3);
    expect(wrapper.find('tr')).to.have.length(1);
    expect(wrapper.find('td')).to.have.length(0);
  });
  it('allows the setting of the column className', () => {
    const testColumnClasses = [
      { key: 'one',
        label: 'Label one',
      },
      { key: 'two',
        label: 'Label two',
        className: 'largeColumn',
      },
      { key: 'three',
        label: 'Label three',
        className: 'testClass',
      },
    ];

    const wrapper = shallow(
      <Table
        rows={[]}
        columns={testColumnClasses}
      />
    );
    expect(wrapper.find('th.largeColumn')).to.have.length(1);
    expect(wrapper.find('th.testClass')).to.have.length(1);
  });
});

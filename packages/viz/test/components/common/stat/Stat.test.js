import React from 'react';
import _ from 'lodash';
import { mount, shallow } from 'enzyme';
import { Collapse } from 'react-collapse';
import { SizeMe } from 'react-sizeme';
import { VictoryBar, VictoryContainer } from 'victory';
import chai from 'chai';
import sinon from 'sinon';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';
import Stat from '../../../../src/components/common/stat/Stat';
import StatLegend from '../../../../src/components/common/stat/StatLegend';
import InputGroup from '../../../../src/components/common//controls/InputGroup';
import styles from '../../../../src/components/common/stat/Stat.css';
import colors from '../../../../src/styles/colors.css';
import { statFormats, statTypes } from '../../../../src/utils/stat';
import StatTooltip from '../../../../src/components/common/tooltips/StatTooltip';
import {
  MGDL_UNITS,
  MGDL_CLAMP_TOP,
  MMOLL_UNITS,
  MMOLL_CLAMP_TOP,
  MS_IN_DAY,
  MS_IN_HOUR,
  MS_IN_MIN,
} from '../../../../src/utils/constants';

const { expect } = chai;

/* eslint-disable max-len */

describe('Stat', () => {
  let wrapper;
  let instance;

  const defaultData = {
    data: [
      {
        value: 60,
        id: 'insulin',
        input: {
          id: 'weight',
          label: 'Weight',
          suffix: 'kg',
          type: 'number',
          value: 60,
        },
      },
      {
        value: 120,
      },
    ],
    dataPaths: {
      summary: 'data.0',
      title: 'data.1',
      input: 'data.0.input'
    },
  };

  const defaultProps = {
    title: 'My Stat',
    data: defaultData,
    dataFormat: statFormats.percentage,
    type: statTypes.simple,
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = shallow(<Stat {...defaultProps} />);
    instance = wrapper.instance();
  });

  it('should set appropriate default props', () => {
    expect(Stat.defaultProps).to.eql({
      alwaysShowSummary: false,
      alwaysShowTooltips: true,
      animate: true,
      bgPrefs: {},
      categories: {},
      chartHeight: 0,
      collapsible: false,
      emptyDataPlaceholder: '--',
      isDisabled: false,
      isOpened: true,
      legend: false,
      muteOthersOnHover: true,
      type: statTypes.simple,
      units: false,
    });
  });

  describe('constructor', () => {
    it('should initialize the state by stat type', () => {
      expect(instance.state).to.be.an('object').and.include.keys([
        'isCollapsible',
        'isOpened',
        'showFooter',
      ]);
    });

    it('should set the chart props by stat type', () => {
      expect(instance.chartProps).to.be.an('object').and.have.keys([
        'animate',
        'height',
        'labels',
        'renderer',
        'style',
      ]);
    });

    it('should define a stat reference method', () => {
      expect(instance.setStatRef).to.be.a('function');
      instance.setStatRef('statRef');
      expect(instance.stat).to.equal('statRef');
    });

    it('should define a tooltip icon reference method', () => {
      expect(instance.setTooltipIconRef).to.be.a('function');
      instance.setTooltipIconRef('iconRef');
      expect(instance.tooltipIcon).to.equal('iconRef');
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should call `setState` with the result of `getStateByType`', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      const getStateByTypeSpy = sinon.spy(instance, 'getStateByType');

      wrapper.setProps({ foo: 'bar' });

      sinon.assert.calledOnce(setStateSpy);
      sinon.assert.calledOnce(getStateByTypeSpy);
      sinon.assert.calledWith(getStateByTypeSpy, sinon.match({ foo: 'bar' }));
    });

    it('should call `getChartPropsByType` with the incoming props', () => {
      const getChartPropsByTypeSpy = sinon.spy(instance, 'getChartPropsByType');

      wrapper.setProps({ foo: 'bar' });

      sinon.assert.calledOnce(getChartPropsByTypeSpy);
      sinon.assert.calledWith(getChartPropsByTypeSpy, sinon.match({ foo: 'bar' }));
    });
  });

  describe('renderChartTitle', () => {
    it('should render a chart title', () => {
      wrapper.setState({ chartTitle: 'chart title' });
      const title = wrapper.find(formatClassesAsSelector(styles.chartTitle));
      expect(title).to.have.length(1);
      expect(title.text()).to.include('chart title');
    });

    context('showing titleData', () => {
      let titleData;
      beforeEach(() => {
        titleData = () => wrapper.find(formatClassesAsSelector(styles.chartTitleData));
      });

      context('datum is hovered', () => {
        beforeEach(() => {
          wrapper.setState({
            hoveredDatumIndex: 0,
          });
        });

        it('should show the tooltip title data and suffix when a datum has a valid value', () => {
          wrapper.setState({
            tooltipTitleData: { value: '3.6', suffix: 'U' },
          });
          expect(titleData()).to.have.length(1);
          expect(titleData().text()).to.include('3.6U');
        });

        it('should render title data in the color provided via `id`', () => {
          wrapper.setState({
            tooltipTitleData: { value: '3.6', suffix: 'U', id: 'insulin' },
          });
          expect(titleData()).to.have.length(1);
          expect(titleData().text()).to.include('3.6U');
          expect(titleData().find('span > span').first().props().style.color).to.equal(colors.insulin);
        });

        it('should render title data in the default color when not provided via `id`', () => {
          wrapper.setState({
            tooltipTitleData: { value: '3.6', suffix: 'U' },
          });
          expect(titleData()).to.have.length(1);
          expect(titleData().text()).to.include('3.6U');
          expect(titleData().find('span > span').first().props().style.color).to.equal(colors.statDefault);
        });

        it('should not show the tooltip title data and suffix when a datum has the empty placeholder value', () => {
          wrapper.setState({
            tooltipTitleData: { value: '--', suffix: 'U' },
          });

          expect(titleData()).to.have.length(0);

          wrapper.setProps(props({ emptyDataPlaceholder: 'XX' }));
          expect(titleData()).to.have.length(1);

          wrapper.setState({
            tooltipTitleData: { value: 'XX', suffix: 'U' },
          });
          expect(titleData()).to.have.length(0);
        });

        it('should not show the tooltip title data and suffix when a datum has no value', () => {
          wrapper.setState({
            tooltipTitleData: { value: undefined, suffix: 'U' },
          });

          expect(titleData()).to.have.length(0);
        });
      });

      context('datum is not hovered', () => {
        beforeEach(() => {
          wrapper.setState({
            hoveredDatumIndex: -1,
          });
        });

        it('should show the data defined in the `dataPaths.title` prop when available', () => {
          expect(titleData()).to.have.length(1);
          expect(titleData().text()).to.include('120');
        });

        it('should not show the title when no `dataPaths.title` prop is available', () => {
          wrapper.setProps(props({
            data: _.assign({}, defaultProps.data, {
              dataPaths: { summary: 'data.0' },
            }),
          }));
          expect(titleData()).to.have.length(0);
        });
      });
    });

    context('showing tooltip icon', () => {
      it('should render a tooltip icon when annotations props provide and datum is not hovered', () => {
        wrapper.setState({
          hoveredDatumIndex: -1,
        });
        wrapper.setProps(props({ annotations: ['my message'] }));

        const iconWrapper = wrapper.find(formatClassesAsSelector(styles.tooltipIcon));
        expect(iconWrapper).to.have.length(1);
        expect(iconWrapper.find('img')).to.have.length(1);
      });

      it('should not render a tooltip icon when annotations props provide and datum is hovered', () => {
        wrapper.setState({
          hoveredDatumIndex: 1,
        });
        wrapper.setProps(props({ annotations: ['my message'] }));

        const iconWrapper = wrapper.find(formatClassesAsSelector(styles.tooltipIcon));
        expect(iconWrapper).to.have.length(0);
      });

      it('should not render a tooltip icon when annotations props not provided and datum is hovered', () => {
        wrapper.setState({
          hoveredDatumIndex: 1,
        });
        wrapper.setProps(props({ annotations: undefined }));

        const iconWrapper = wrapper.find(formatClassesAsSelector(styles.tooltipIcon));
        expect(iconWrapper).to.have.length(0);
      });

      it('should not render a tooltip icon when annotations props not provided and datum is not hovered', () => {
        wrapper.setState({
          hoveredDatumIndex: -1,
        });
        wrapper.setProps(props({ annotations: undefined }));

        const iconWrapper = wrapper.find(formatClassesAsSelector(styles.tooltipIcon));
        expect(iconWrapper).to.have.length(0);
      });
    });
  });

  describe('renderChartSummary', () => {
    it('should render a chart summary wrapper', () => {
      const summary = wrapper.find(formatClassesAsSelector(styles.chartSummary));
      expect(summary).to.have.length(1);
    });

    it('should call `renderStatUnits` method when `units` prop is truthy and `showFooter` state is false', () => {
      const renderStatUnitsSpy = sinon.spy(instance, 'renderStatUnits');
      wrapper.setProps(props({ units: false }));
      wrapper.setState({ showFooter: true });
      sinon.assert.callCount(renderStatUnitsSpy, 0);


      wrapper.setProps(props({ units: 'U' }));
      wrapper.setState({ showFooter: false });
      expect(renderStatUnitsSpy.callCount).to.be.gt(0);
    });

    it('should render the chart collapse icon when the `isCollapsible` state is `true`', () => {
      const icon = () => wrapper.find(formatClassesAsSelector(styles.chartCollapse));

      wrapper.setState({ isCollapsible: false });
      expect(icon()).to.have.length(0);

      wrapper.setState({ isCollapsible: true });
      expect(icon()).to.have.length(1);
      expect(icon().find('img')).to.have.length(1);
    });

    context('summary data is present', () => {
      let summaryData;
      beforeEach(() => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            dataPaths: { summary: 'data.0' },
          }),
        }));
        summaryData = () => wrapper.find(formatClassesAsSelector(styles.summaryData));
      });

      it('should render the summary data when `isOpened` state is `false`', () => {
        wrapper.setState({ isOpened: true });
        // See explanation here: https://github.com/tidepool-org/viz/pull/186/files#r378534285
        wrapper.setState({ isOpened: true });
        expect(summaryData()).to.have.length(0);

        wrapper.setState({ isOpened: false });
        expect(summaryData()).to.have.length(1);
      });

      it('should render the summary data when `alwaysShowSummary` prop is `true` and `isOpened` state is true', () => {
        wrapper.setProps(props({ alwaysShowSummary: false }));
        wrapper.setState({ isOpened: true });
        // See explanation here: https://github.com/tidepool-org/viz/pull/186/files#r378534285
        wrapper.setState({ isOpened: true });
        expect(summaryData()).to.have.length(0);

        wrapper.setProps(props({ alwaysShowSummary: true }));
        expect(summaryData()).to.have.length(1);
      });

      it('should render title data in the color provided via `id`', () => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [{
              id: 'bolus',
              value: 60,
            }],
          }),
        }));
        expect(summaryData()).to.have.length(1);
        expect(summaryData().first().props().style.color).to.equal(colors.bolus);
      });
    });

    context('summary data is not present', () => {
      let summaryData;
      beforeEach(() => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            dataPaths: { title: 'data.0' },
          }),
          alwaysShowSummary: true, // shouldn't cause the summary to show since there's no dataPath
        }));
        summaryData = () => wrapper.find(formatClassesAsSelector(styles.summaryData));
      });

      it('should not render the summary data', () => {
        expect(summaryData()).to.have.length(0);
      });
    });
  });

  describe('renderStatUnits', () => {
    it('should render the `units` prop', () => {
      wrapper.setProps(props({ units: 'myUnits' }));
      expect(wrapper.find(formatClassesAsSelector(styles.units))).to.have.length(1);
      expect(wrapper.find(formatClassesAsSelector(styles.units)).text()).to.equal('myUnits');
    });
  });

  describe('renderStatHeader', () => {
    it('should render a statHeader div', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.statHeader))).to.have.length(1);
    });

    it('should call the `renderChartTitle` and `renderChartSummary` methods', () => {
      const renderChartTitleSpy = sinon.spy(instance, 'renderChartTitle');
      const renderChartSummarySpy = sinon.spy(instance, 'renderChartSummary');
      sinon.assert.callCount(renderChartTitleSpy, 0);
      sinon.assert.callCount(renderChartSummarySpy, 0);

      instance.renderStatHeader();
      sinon.assert.callCount(renderChartTitleSpy, 1);
      sinon.assert.callCount(renderChartSummarySpy, 1);
    });
  });

  describe('renderStatFooter', () => {
    it('should render a statFooter div when `showFooter` state is true', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.statFooter))).to.have.length(0);

      wrapper.setState({ showFooter: true });
      expect(wrapper.find(formatClassesAsSelector(styles.statFooter))).to.have.length(1);
    });

    it('should call the `renderCalculatedOutput` method when the stat type is `input`', () => {
      const statProps = { ...defaultProps };
      statProps.type = statTypes.input;
      const statComp = shallow(<Stat {...statProps} />);
      const statInstance = statComp.instance();

      const renderCalculatedOutputSpy = sinon.spy(statInstance, 'renderCalculatedOutput');
      sinon.assert.callCount(renderCalculatedOutputSpy, 0);

      statInstance.renderStatFooter();
      sinon.assert.callCount(renderCalculatedOutputSpy, 1);
    });

    it('should call the `renderStatLegend` method when the `legend` prop is `true`', () => {
      const statProps = { ...defaultProps };
      statProps.legend = true;
      const statComp = shallow(<Stat {...statProps} />);
      const statInstance = statComp.instance();

      const renderStatLegendSpy = sinon.spy(statInstance, 'renderStatLegend');
      sinon.assert.callCount(renderStatLegendSpy, 0);

      statInstance.renderStatFooter();
      sinon.assert.callCount(renderStatLegendSpy, 1);
    });

    it('should call the `renderStatUnits` method when the stat type is `true`', () => {
      const statProps = { ...defaultProps };
      statProps.units = 'myUnits';
      const statComp = shallow(<Stat {...statProps} />);
      const statInstance = statComp.instance();

      const renderStatUnitsSpy = sinon.spy(statInstance, 'renderStatUnits');
      sinon.assert.callCount(renderStatUnitsSpy, 0);

      statInstance.renderStatFooter();
      sinon.assert.callCount(renderStatUnitsSpy, 1);
    });
  });

  describe('renderStatLegend', () => {
    let statLegend;

    beforeEach(() => {
      wrapper.setState({ isOpened: true });

      wrapper.setProps(props({
        data: _.assign({}, defaultProps.data, {
          data: [
            {
              id: 'basal',
              value: 80,
              legendTitle: 'Basal',
            },
            {
              id: 'bolus',
              value: 60,
              legendTitle: 'Bolus',
            },
          ],
        }),
        legend: true,
        type: statTypes.barHorizontal,
      }));

      statLegend = () => wrapper.find(StatLegend).dive();
    });

    it('should render the legendTitle text for each item passed to the `StatLegend` component', () => {
      expect(statLegend()).to.have.length(1);
      const items = () => statLegend().find('li > span');
      expect(items()).to.have.length(2);
      expect(items().at(0).text()).to.equal('Bolus');
      expect(items().at(1).text()).to.equal('Basal');
    });

    it('should render the legend items in reverse order when the `reverseLegendOrder` prop is true', () => {
      wrapper.setProps(_.assign({}, wrapper.props(), {
        reverseLegendOrder: true,
      }));

      expect(statLegend()).to.have.length(1);
      const items = () => statLegend().find('li > span');
      expect(items()).to.have.length(2);
      expect(items().at(0).text()).to.equal('Basal');
      expect(items().at(1).text()).to.equal('Bolus');
    });
  });

  describe('renderChart', () => {
    beforeEach(() => {
      wrapper.setState({ isOpened: true });

      wrapper.setProps(props({
        data: _.assign({}, defaultProps.data, {
          data: [
            {
              id: 'basal',
              value: 80,
              legendTitle: 'Basal',
            },
            {
              id: 'bolus',
              value: 60,
              legendTitle: 'Bolus',
            },
          ],
        }),
        type: statTypes.barHorizontal,
      }));
    });

    it('should render `chartProps.renderer` instance property in a size-aware, collapsible wrapper', () => {
      instance.chartProps.renderer = () => (<div className="fakeRenderer">fake renderer</div>);
      instance.renderChart({ width: 300 });
      const collapseWrapper = wrapper.find(SizeMe).dive().find(Collapse);

      expect(collapseWrapper).to.have.length(1);
      expect(collapseWrapper.dive().html()).to.include('fake renderer');
    });
  });
  
  describe('renderCalculatedOutput', () => {
    let outputWrapper;

    const outputData = {
      value: 60,
      input: {
        id: 'weight',
        label: 'Weight',
        suffix: 'kg',
        type: 'number',
        value: 70,
      },
      output: {
        label: 'Output Label',
        type: 'divisor',
        dataPaths: {
          dividend: 'data.0',
        },
      },
    };

    beforeEach(() => {
      wrapper.setState({
        isOpened: true,
        inputValue: 120,
        inputSuffix: {
          value: { label: 'kg' },
        },
      });

      wrapper.setProps(props({
        data: _.assign({}, defaultProps.data, {
          data: [outputData],
          dataPaths: {
            output: 'data.0.output',
            input: 'data.0.input'
          },
        }),
        dataFormat: {
          output: statFormats.unitsPerKg,
        },
        type: statTypes.input,
      }));

      outputWrapper = () => wrapper.find(formatClassesAsSelector(styles.outputWrapper));
    });

    it('should render an output wrapper', () => {
      expect(outputWrapper()).to.have.length(1);
    });

    it('should render a label when provided in output data', () => {
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputLabel))).to.have.length(1);
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputLabel)).text()).to.equal('Output Label');
    });

    it('should not render a label when no provided in output data', () => {
      wrapper.setProps(props({
        data: _.assign({}, defaultProps.data, {
          data: [{
            value: 60,
            input: {
              id: 'weight',
              label: 'Weight',
              suffix: 'kg',
              type: 'number',
              value: 70,
            },
            output: {
              type: 'divisor',
              dataPaths: {
                dividend: 'data.0',
              },
            },
          }],
          dataPaths: {
            output: 'data.0.output',
            input: 'data.0.input'
          },
        }),
        type: statTypes.input,
      }));
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputLabel))).to.have.length(0);
    });

    it('should render the output value wrapper', () => {
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue))).to.have.length(1);
    });

    it('should render the output value wrapper with a disabled class', () => {
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputValueDisabled))).to.have.length(0);

      wrapper.setState({
        inputValue: undefined,
      });
      wrapper.setState({
        inputValue: undefined,
      });

      expect(outputWrapper().find(formatClassesAsSelector(styles.outputValueDisabled))).to.have.length(1);
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputValueDisabled)).text()).to.equal('--');
    });

    it('should render the output suffix wrapper', () => {
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputSuffix))).to.have.length(1);
      expect(outputWrapper().find(formatClassesAsSelector(styles.outputSuffix)).text()).to.equal('U/kg');
    });

    context('output type is `divisor`', () => {
      it('should set the calculated value to `dividend / divisor`', () => {
        expect(outputData.value).to.equal(60); // dividend

        // See explanation here: https://github.com/tidepool-org/viz/pull/186/files#r378534285
        // on why we need to set state two times
        wrapper.setState({
          inputValue: 120,
        });
        wrapper.setState({
          inputValue: 120, // // divisor
        });

        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue))).to.have.length(1);
        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue)).text()).to.equal('0.50');

        wrapper.setState({
          inputValue: 240,
        });
        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue)).text()).to.equal('0.25');
      });
    });

    context('output type is not defined', () => {
      it('should pass through the input value unmodified', () => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [{
              value: 60,
              input: {
                id: 'weight',
                label: 'Weight',
                suffix: 'kg',
                type: 'number',
                value: 70,
              },
              output: {
                type: undefined,
                dataPaths: {
                  dividend: 'data.0',
                },
              },
            }],
            dataPaths: {
              output: 'data.0.output',
              input: 'data.0.input'
            },
          }),
          type: statTypes.input,
        }));

        wrapper.setState({
          inputValue: 120,
        });

        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue))).to.have.length(1);
        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue)).text()).to.equal('70');

        wrapper.setState({
          inputValue: 240,
        });
        expect(outputWrapper().find(formatClassesAsSelector(styles.outputValue)).text()).to.equal('240');
      });
    });
  });

  describe('renderTooltip', () => {
    let statTooltip;
    beforeEach(() => {
      wrapper.setProps(props({
        annotations: ['one', 'two'],
      }));

      wrapper.setState({ showMessages: true });

      statTooltip = () => wrapper.find(StatTooltip);
    });

    it('should render a tooltip wrapper and `StatTooltip` component', () => {
      const statTooltipWrapper = wrapper.find(formatClassesAsSelector(styles.StatWrapper));
      expect(statTooltipWrapper).to.have.length(1);
      expect(statTooltip()).to.have.length(1);
    });

    it('should pass the `annotations` prop to the `StatTooltip` component', () => {
      expect(statTooltip().props().annotations).to.have.members(['one', 'two']);
    });

    it('should pass the `messageTooltipOffset` state to the `offset` prop of the `StatTooltip` component', () => {
      wrapper.setState({
        messageTooltipOffset: 20,
      });
      expect(statTooltip().props().offset).to.equal(20);
    });

    it('should pass the `messageTooltipPosition` state to the `position` prop of the `StatTooltip` component', () => {
      wrapper.setState({
        messageTooltipPosition: { x: 100, y: 50 },
      });
      expect(statTooltip().props().position).to.eql({ x: 100, y: 50 });
    });

    it('should pass the `messageTooltipSide` state to the `side` prop of the `StatTooltip` component', () => {
      wrapper.setState({
        messageTooltipSide: 'right',
      });
      expect(statTooltip().props().side).to.equal('right');
    });
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper.setState({ isOpened: true });

      wrapper.setProps(props({
        type: statTypes.barHorizontal,
      }));

      instance = wrapper.instance();
    });

    it('should render an outer stat wrapper', () => {
      const statOuter = wrapper.find(formatClassesAsSelector(styles.StatWrapper));
      expect(statOuter).to.have.length(1);
    });

    it('should render an inner wrapper with dynamic `isOpen` class', () => {
      const statInner = () => wrapper.find(formatClassesAsSelector(styles.Stat));
      expect(statInner()).to.have.length(1);

      wrapper.setState({ isOpened: false });
      wrapper.setState({ isOpened: false });
      expect(statInner().is(formatClassesAsSelector(styles.isOpen))).to.be.false;

      wrapper.setState({ isOpened: true });
      expect(statInner().is(formatClassesAsSelector(styles.isOpen))).to.be.true;
    });

    it('should render the stat header', () => {
      const renderStatHeaderSpy = sinon.spy(instance, 'renderStatHeader');

      sinon.assert.callCount(renderStatHeaderSpy, 0);
      instance.render();
      sinon.assert.callCount(renderStatHeaderSpy, 1);
    });

    it('should render the main stat chart area when the `chartProps.renderer` instance prop is set', () => {
      const mountedWrapper = mount(<Stat {...defaultProps} />);
      instance = mountedWrapper.instance();

      const renderChartSpy = sinon.spy(instance, 'renderChart');

      renderChartSpy.resetHistory();
      sinon.assert.callCount(renderChartSpy, 0);

      // Set to a type without a renderer
      mountedWrapper.setProps(props({
        type: statTypes.simple,
      }));

      expect(mountedWrapper.find(formatClassesAsSelector(styles.statMain))).to.have.length(0);
      sinon.assert.callCount(renderChartSpy, 0);

      // Set to a type with a renderer
      mountedWrapper.setProps(props({
        type: statTypes.barHorizontal,
      }));

      expect(mountedWrapper.find(formatClassesAsSelector(styles.statMain))).to.have.length(1);
      sinon.assert.callCount(renderChartSpy, 1);
    });

    it('should render the stat tooltip when the `showMessages` state is true', () => {
      const renderTooltipSpy = sinon.spy(instance, 'renderTooltip');

      sinon.assert.callCount(renderTooltipSpy, 0);

      wrapper.setState({
        showMessages: true,
      });

      sinon.assert.callCount(renderTooltipSpy, 1);
    });
  });

  describe('getStateByType', () => {
    context('common', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          type: undefined,
          title: 'My Stat Title',
        }));
      });

      it('should set the `chartTitle` state to the `title` prop', () => {
        expect(instance.getStateByType(instance.props).chartTitle).to.equal('My Stat Title');
      });

      it('should set the `isDisabled` state to `true` if the sum of all data, including deviation data, is <= 0', () => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [
              {
                value: 10,
              },
              {
                value: 20,
              },
            ],
            dataPaths: {
              summary: 'data.0',
            },
          }),
        }));

        expect(instance.getStateByType(instance.props).isDisabled).to.be.false;

        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [
              {
                value: 0,
              },
              {
                value: 0,
              },
            ],
            dataPaths: {
              summary: 'data.0',
            },
          }),
        }));

        expect(instance.getStateByType(instance.props).isDisabled).to.be.true;

        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [
              {
                value: 0,
                deviation: { value: 10 },
              },
              {
                value: 0,
              },
            ],
            dataPaths: {
              summary: 'data.0',
            },
          }),
        }));

        expect(instance.getStateByType(instance.props).isDisabled).to.be.false;
      });
    });

    context('input', () => {
      const inputData = {
        input: {
          id: 'weight',
          label: 'Weight',
          step: 1,
          suffix: 'kg',
          type: 'number',
          value: 100,
        },
      };

      beforeEach(() => {
        wrapper.setProps(props({
          data: _.assign({}, defaultProps.data, {
            data: [inputData],
            dataPaths: {
              input: 'data.0.input',
            },
          }),
          type: statTypes.input,
        }));
      });

      it('should set the `inputSuffix` state to the `input.suffix` data when not already set in state', () => {
        wrapper.setState({
          inputSuffix: undefined,
        });
        expect(instance.getStateByType(instance.props).inputSuffix).to.eql(inputData.input.suffix);
      });

      it('should not change the `inputSuffix` state if already set', () => {
        wrapper.setState({
          inputSuffix: 'foo',
        });
        wrapper.setState({
          inputSuffix: 'foo',
        });
        expect(instance.getStateByType(instance.props).inputSuffix).to.equal('foo');
      });

      it('should set the `inputValue` state to the `input.suffix` data when not already set in state', () => {
        wrapper.setState({
          inputValue: undefined,
        });
        expect(instance.getStateByType(instance.props).inputValue).to.eql(inputData.input.value);
      });

      it('should always build the `inputValue` state from input props', () => {
        wrapper.setState({
          inputValue: 'foo',
        });
        wrapper.setState({
          inputValue: 'foo',
        });
        expect(instance.getStateByType(instance.props).inputValue).to.equal(100);
      });

      it('should set the `isCollapsible` state to the `collapsible` prop', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: false,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.false;

        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: true,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.true;
      });

      it('should set the `isOpened` and `showFooter` state to the `isOpened` prop, unless already set', () => {
        // state unset, prop is false
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;
        expect(instance.getStateByType(instance.props).showFooter).to.be.false;

        // state unset, prop is true
        wrapper.setState({
          isOpened: undefined,
        });
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;
        expect(instance.getStateByType(instance.props).showFooter).to.be.true;

        // state is true, prop is false
        wrapper.setState({
          isOpened: true,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;
        expect(instance.getStateByType(instance.props).showFooter).to.be.true;

        // state is false, prop is true
        wrapper.setState({
          isOpened: false,
        });
        wrapper.setState({
          isOpened: false,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;
        expect(instance.getStateByType(instance.props).showFooter).to.be.false;
      });
    });

    context('barHorizontal', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          type: statTypes.barHorizontal,
        }));
      });

      it('should set the `isCollapsible` state to the `collapsible` prop', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: false,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.false;

        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: true,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.true;
      });

      it('should set the `isOpened` state to the `isOpened` prop, unless already set', () => {
        // state unset, prop is false
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;

        // state unset, prop is true
        wrapper.setState({
          isOpened: undefined,
        });
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;

        // state is true, prop is false
        wrapper.setState({
          isOpened: true,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;

        // state is false, prop is true
        wrapper.setState({
          isOpened: false,
        });
        wrapper.setState({
          isOpened: false,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;
      });

      it('should set the `hoveredDatumIndex` state to `-1`', () => {
        wrapper.setState({
          hoveredDatumIndex: undefined,
        });
        expect(instance.getStateByType(instance.props).hoveredDatumIndex).to.equal(-1);

        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: true,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.true;
      });

      it('should set the `showFooter` state to true if to the `isOpened` state is true and the `legend` prop is true', () => {
        // state is false, prop is false
        wrapper.setState({
          isOpened: false,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          legend: false,
        }));

        expect(instance.getStateByType(instance.props).showFooter).to.be.false;

        // state is false, prop is true
        wrapper.setState({
          isOpened: false,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          legend: true,
        }));

        expect(instance.getStateByType(instance.props).showFooter).to.be.false;

        // state is true, prop is false
        wrapper.setState({
          isOpened: true,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          legend: false,
        }));

        expect(instance.getStateByType(instance.props).showFooter).to.be.false;

        // state is true, prop is true
        wrapper.setState({
          isOpened: true,
        });
        wrapper.setState({
          isOpened: true,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          legend: true,
        }));

        expect(instance.getStateByType(instance.props).showFooter).to.be.true;
      });
    });

    context('barBg', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          type: statTypes.barBg,
        }));
      });

      it('should set the `isCollapsible` state to the `collapsible` prop', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: false,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.false;

        wrapper.setProps(_.assign({}, wrapper.props(), {
          collapsible: true,
        }));
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.true;
      });

      it('should set the `isOpened` state to the `isOpened` prop, unless already set', () => {
        // state unset, prop is false
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;

        // state unset, prop is true
        wrapper.setState({
          isOpened: undefined,
        });
        wrapper.setState({
          isOpened: undefined,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;

        // state is true, prop is false
        wrapper.setState({
          isOpened: true,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: false,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.true;

        // state is false, prop is true
        wrapper.setState({
          isOpened: false,
        });
        wrapper.setState({
          isOpened: false,
        });

        wrapper.setProps(_.assign({}, wrapper.props(), {
          isOpened: true,
        }));

        expect(instance.getStateByType(instance.props).isOpened).to.be.false;
      });
    });

    context('simple', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          type: statTypes.simple,
        }));
      });

      it('should set the `isCollapsible` state to `false`', () => {
        wrapper.setState({
          isCollapsible: true,
        });
        expect(instance.getStateByType(instance.props).isCollapsible).to.be.false;
      });

      it('should set the `isOpened` state to `false`', () => {
        wrapper.setState({
          isOpened: true,
        });
        expect(instance.getStateByType(instance.props).isOpened).to.be.false;
      });

      it('should set the `showFooter` state to `false`', () => {
        wrapper.setState({
          showFooter: true,
        });
        expect(instance.getStateByType(instance.props).showFooter).to.be.false;
      });
    });
  });

  describe('getDefaultChartProps', () => {
    beforeEach(() => {
      wrapper.setProps(props({
        chartHeight: 500,
      }));
    });

    it('should return an object with default chart props', () => {
      const result = instance.getDefaultChartProps(instance.props);
      expect(result).to.be.an('object').and.have.keys([
        'animate',
        'height',
        'labels',
        'renderer',
        'style',
      ]);

      expect(result.animate).to.be.an('object').and.have.keys([
        'duration',
        'onLoad',
      ]);

      expect(result.labels).to.be.a('function');
      expect(result.style.data.fill).to.be.a('function');
    });

    it('should set `charProps.height` to the provided `chartHeight` prop', () => {
      expect(instance.getDefaultChartProps(instance.props).height).to.equal(500);
    });

    it('should set `charProps.renderer` to `null`', () => {
      expect(instance.getDefaultChartProps(instance.props).renderer).to.equal(null);
    });
  });

  describe('getChartPropsByType', () => {
    beforeEach(() => {
      wrapper.setProps(props({
        chartHeight: 500,
      }));
    });

    context('simple stat', () => {
      beforeEach(() => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          type: statTypes.simple,
        }));
      });

      it('should return default chartProps object', () => {
        const getDefaultChartPropsSpy = sinon.spy(instance, 'getDefaultChartProps');
        sinon.assert.callCount(getDefaultChartPropsSpy, 0);

        const result = instance.getChartPropsByType(instance.props);

        sinon.assert.callCount(getDefaultChartPropsSpy, 1);
        sinon.assert.calledWith(getDefaultChartPropsSpy, sinon.match(instance.props));

        expect(result).to.be.an('object').and.have.keys([
          'animate',
          'height',
          'labels',
          'renderer',
          'style',
        ]);
      });
    });

    context('input stat', () => {
      beforeEach(() => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          type: statTypes.input,
        }));
      });

      it('should return default chartProps object', () => {
        const getDefaultChartPropsSpy = sinon.spy(instance, 'getDefaultChartProps');
        sinon.assert.callCount(getDefaultChartPropsSpy, 0);

        const result = instance.getChartPropsByType(instance.props);

        sinon.assert.callCount(getDefaultChartPropsSpy, 1);
        sinon.assert.calledWith(getDefaultChartPropsSpy, sinon.match(instance.props));

        expect(result).to.be.an('object').and.have.keys([
          'animate',
          'height',
          'labels',
          'renderer',
          'style',
        ]);
      });
    });

    context('barBg stat', () => {
      beforeEach(() => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          bgPrefs: {
            bgUnits: MGDL_UNITS,
            bgBounds: {
              targetLowerBound: 70,
              targetUpperBound: 180,
            },
          },
          data: _.assign({}, defaultProps.data, {
            data: [
              {
                value: 100,
                deviation: {
                  value: 30,
                },
              },
            ],
          }),
          type: statTypes.barBg,
        }));
      });

      it('should return an extended default chartProps object', () => {
        const getDefaultChartPropsSpy = sinon.spy(instance, 'getDefaultChartProps');
        sinon.assert.callCount(getDefaultChartPropsSpy, 0);

        const result = instance.getChartPropsByType(instance.props);

        sinon.assert.callCount(getDefaultChartPropsSpy, 1);
        sinon.assert.calledWith(getDefaultChartPropsSpy, sinon.match(instance.props));

        const baseKeys = [
          'animate',
          'data',
          'height',
          'labels',
          'renderer',
          'style',
        ];

        expect(result).to.be.an('object').and.have.keys([
          ...baseKeys,
          'alignment',
          'containerComponent',
          'cornerRadius',
          'dataComponent',
          'domain',
          'horizontal',
          'labelComponent',
          'padding',
        ]);
      });

      it('should set basic chart layout properties', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.alignment).to.equal('middle');
        expect(result.horizontal).to.equal(true);
      });

      it('should set `data` to a chart-compatible map of the provided `data` prop', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.data).to.eql([
          {
            x: 1,
            y: 100,
            deviation: { value: 30 },
            eventKey: 0
          },
        ]);
      });

      it('should set `containerComponent` to a non-responsive `VictoryContainer` component', () => {
        const result = instance.getChartPropsByType(instance.props);
        const containerComponentInstance = shallow(result.containerComponent).instance();

        expect(containerComponentInstance).to.be.instanceOf(VictoryContainer);
        expect(containerComponentInstance.props.responsive).to.be.false;
      });

      it('should set `dataComponent` to a `BgBar` component with necessary props', () => {
        const result = instance.getChartPropsByType(instance.props);
        const dataComponent = shallow(result.dataComponent);

        expect(dataComponent.is('.bgBar')).to.be.true;
        expect(dataComponent.props().children[0].props.children[1].props.barWidth).to.be.a('number');
        expect(dataComponent.props().children[0].props.children[1].props.bgPrefs).to.eql(instance.props.bgPrefs);
        expect(dataComponent.props().children[0].props.children[1].props.chartLabelWidth).to.be.a('number');
        expect(dataComponent.props().children[0].props.children[1].props.domain).to.eql(result.domain);
      });

      it('should set `labelComponent` to a `BgBarLabel` component with necessary props', () => {
        const result = instance.getChartPropsByType(instance.props);
        const dataComponent = shallow(result.labelComponent);

        expect(dataComponent.is('.bgBarLabel')).to.be.true;
        expect(dataComponent.props().children.props.barWidth).to.be.a('number');
        expect(dataComponent.props().children.props.bgPrefs).to.eql(instance.props.bgPrefs);
        expect(dataComponent.props().children.props.domain).to.eql(result.domain);
        expect(dataComponent.props().children.props.text).to.be.a('function');
        expect(dataComponent.props().children.props.tooltipText).to.be.a('function');
      });

      it('should set `renderer` to a `VictoryBar` component', () => {
        const result = instance.getChartPropsByType(instance.props);
        const renderComponentInstance = shallow(<result.renderer />).instance();

        expect(renderComponentInstance).to.be.instanceOf(VictoryBar);
      });

      it('should properly set the chart height to the `chartHeight` prop, or `24` if not provided', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          chartHeight: 40,
        }));

        const result = instance.getChartPropsByType(instance.props);

        expect(result.height).to.equal(40);

        wrapper.setProps(_.assign({}, wrapper.props(), {
          chartHeight: undefined,
        }));

        const result2 = instance.getChartPropsByType(instance.props);

        expect(result2.height).to.equal(24);
      });

      it('should properly set the chart domain for mg/dL units', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          bgPrefs: { bgUnits: MGDL_UNITS },
        }));

        const result = instance.getChartPropsByType(instance.props);

        expect(result.domain).to.eql({
          x: [0, MGDL_CLAMP_TOP],
          y: [0, 1],
        });
      });

      it('should properly set the chart domain for mmol/L units', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          bgPrefs: { bgUnits: MMOLL_UNITS },
        }));

        const result = instance.getChartPropsByType(instance.props);

        expect(result.domain).to.eql({
          x: [0, MMOLL_CLAMP_TOP],
          y: [0, 1],
        });
      });

      it('should set `style` for dynamic data and label styling', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.style).to.be.an('object').and.have.keys([
          'data',
          'labels',
        ]);

        expect(result.style.data.fill).to.be.a('function');
        expect(result.style.data.width).to.be.a('function');

        expect(result.style.labels.fill).to.be.a('function');
        expect(result.style.labels.fontSize).to.be.a('number');
        expect(result.style.labels.fontWeight).to.be.a('number');
        expect(result.style.labels.paddingLeft).to.be.a('number');
      });
    });

    context('barHorizontal stat', () => {
      beforeEach(() => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          data: _.assign({}, defaultProps.data, {
            data: [
              {
                value: 30,
                id: 'basal',
              },
              {
                value: 20,
                id: 'bolus',
              },
            ],
            total: { value: 50 },
          }),
          type: statTypes.barHorizontal,
        }));
      });

      it('should return an extended default chartProps object', () => {
        const getDefaultChartPropsSpy = sinon.spy(instance, 'getDefaultChartProps');
        sinon.assert.callCount(getDefaultChartPropsSpy, 0);

        const result = instance.getChartPropsByType(instance.props);

        sinon.assert.callCount(getDefaultChartPropsSpy, 1);
        sinon.assert.calledWith(getDefaultChartPropsSpy, sinon.match(instance.props));

        const baseKeys = [
          'animate',
          'data',
          'height',
          'labels',
          'renderer',
          'style',
        ];

        expect(result).to.be.an('object').and.have.keys([
          ...baseKeys,
          'alignment',
          'containerComponent',
          'cornerRadius',
          'dataComponent',
          'domain',
          'events',
          'horizontal',
          'labelComponent',
          'padding',
        ]);
      });

      it('should set basic chart layout properties', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.alignment).to.equal('middle');
        expect(result.horizontal).to.equal(true);
      });

      it('should set `data` to a chart-compatible map of the provided `data` prop', () => {
        const result = instance.getChartPropsByType(instance.props);
        const firstDatum = result.data[0];
        const secondDatum = result.data[1];

        expect(firstDatum.x).to.equal(1);
        expect(firstDatum.y).to.equal(0.6);
        expect(firstDatum.id).to.equal('basal');

        expect(secondDatum.x).to.equal(2);
        expect(secondDatum.y).to.equal(0.4);
        expect(secondDatum.id).to.equal('bolus');
      });

      it('should set `containerComponent` to a non-responsive `VictoryContainer` component', () => {
        const result = instance.getChartPropsByType(instance.props);
        const containerComponentInstance = shallow(result.containerComponent).instance();

        expect(containerComponentInstance).to.be.instanceOf(VictoryContainer);
        expect(containerComponentInstance.props.responsive).to.be.false;
      });

      it('should set `dataComponent` to a `HoverBar` component with necessary props', () => {
        const result = instance.getChartPropsByType(instance.props);
        const dataComponent = shallow(result.dataComponent);

        expect(dataComponent.is('.HoverBar')).to.be.true;
        expect(dataComponent.props().children[0].props.children.props.barWidth).to.be.a('number');
        expect(dataComponent.props().children[0].props.children.props.barSpacing).to.be.a('number');
        expect(dataComponent.props().children[0].props.children.props.chartLabelWidth).to.be.a('number');
        expect(dataComponent.props().children[0].props.children.props.domain).to.eql(result.domain);
      });

      it('should set `labelComponent` to a `HoverBarLabel` component with necessary props', () => {
        const result = instance.getChartPropsByType(instance.props);
        const dataComponent = shallow(result.labelComponent);

        expect(dataComponent.is('.HoverBarLabel')).to.be.true;
        expect(result.labelComponent.props.barWidth).to.be.a('number');
        expect(result.labelComponent.props.domain).to.eql(result.domain);
        expect(result.labelComponent.props.isDisabled).to.be.a('function');
        expect(result.labelComponent.props.text).to.be.a('function');
        expect(result.labelComponent.props.tooltipText).to.be.a('function');
      });

      it('should set `renderer` to a `VictoryBar` component', () => {
        const result = instance.getChartPropsByType(instance.props);
        const renderComponentInstance = shallow(<result.renderer />).instance();

        expect(renderComponentInstance).to.be.instanceOf(VictoryBar);
      });

      it('should properly set the chart height to the `chartHeight` prop, or based on `datums.length`', () => {
        wrapper.setProps(_.assign({}, wrapper.props(), {
          chartHeight: 40,
        }));

        const result = instance.getChartPropsByType(instance.props);

        expect(result.height).to.equal(40);

        wrapper.setProps(_.assign({}, wrapper.props(), {
          chartHeight: undefined,
        }));

        const result2 = instance.getChartPropsByType(instance.props);

        const datumCount = instance.props.data.data.length;
        expect(datumCount).to.equal(2);

        expect(result2.height).to.equal(72); // datumCount:2 * (barWidth:30 + barSpacing:6)
      });

      it('should properly set the chart domain based on the length of data', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.domain).to.eql({
          x: [0, 1],
          y: [0, 2],
        });

        // Remove a datum
        instance.props.data.data.shift();
        const result2 = instance.getChartPropsByType(instance.props);
        expect(result2.domain).to.eql({
          x: [0, 1],
          y: [0, 1],
        });
      });

      it('should set `style` for dynamic data and label styling', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.style).to.be.an('object').and.have.keys([
          'data',
          'labels',
        ]);

        expect(result.style.data.fill).to.be.a('function');
        expect(result.style.data.width).to.be.a('function');

        expect(result.style.labels.fill).to.be.a('function');
        expect(result.style.labels.fontSize).to.be.a('number');
        expect(result.style.labels.fontWeight).to.be.a('number');
        expect(result.style.labels.paddingLeft).to.be.a('number');
      });

      it('should set `events` with `onMouseOver` and `onMouseOut` handlers', () => {
        const result = instance.getChartPropsByType(instance.props);

        expect(result.events).to.be.an('array');
        expect(result.events[0]).to.be.an('object').and.have.keys([
          'target',
          'eventHandlers',
        ]);

        expect(result.events[0].target).to.equal('data');
        expect(result.events[0].eventHandlers).to.be.an('object').and.have.keys([
          'onMouseOver',
          'onMouseOut',
        ]);

        expect(result.events[0].eventHandlers.onMouseOver).to.be.a('function');
        expect(result.events[0].eventHandlers.onMouseOut).to.be.a('function');
      });
    });
  });

  describe('setChartTitle', () => {
    it('should set the `chartTitle` state from the stat\'s `title` prop', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.setChartTitle();

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        chartTitle: 'My Stat',
      }));
    });

    it('should set the `chartTitle` state from a provided datum\'s `title` prop', () => {
      const setStateSpy = sinon.spy(instance, 'setState');

      instance.setChartTitle({
        title: 'My Datum',
      });

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        chartTitle: 'My Datum',
      }));
    });

    it('should set the `tooltipTitleData` state from when provided a datum and a `dataFormat.tooltipTitle` prop is defined', () => {
      wrapper.setProps(props({
        dataFormat: {
          tooltipTitle: statFormats.units,
        },
      }));

      const setStateSpy = sinon.spy(instance, 'setState');

      instance.setChartTitle({
        index: 1,
      });

      // sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        tooltipTitleData: sinon.match({
          suffix: 'U',
          value: '120.0',
        }),
      }));
    });

    it('should set the `tooltipTitleData` state to `undefined` when no datum arg is present', () => {
      wrapper.setProps(props({
        dataFormat: {
          tooltipTitle: statFormats.units,
        },
      }));

      const setStateSpy = sinon.spy(instance, 'setState');

      instance.setChartTitle();

      // sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        tooltipTitleData: undefined,
      }));
    });

    it('should set the `tooltipTitleData` state to `undefined` when `dataFormat.tooltipTitle` prop is undefined', () => {
      wrapper.setProps(props({
        dataFormat: {
          tooltipTitle: undefined,
        },
      }));

      const setStateSpy = sinon.spy(instance, 'setState');

      instance.setChartTitle();

      // sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        tooltipTitleData: undefined,
      }));
    });
  });

  describe('getFormattedDataByDataPath', () => {
    it('should call and return result of `formatDatum` with the datum at the requested data path and format', () => {
      const formatDatumSpy = sinon.spy(instance, 'formatDatum');

      const result = instance.getFormattedDataByDataPath('data.1', statFormats.units);

      sinon.assert.callCount(formatDatumSpy, 1);
      sinon.assert.calledWith(formatDatumSpy, defaultData.data[1], statFormats.units);

      expect(result.value).to.equal('120.0');
      expect(result.suffix).to.equal('U');

      formatDatumSpy.restore();
    });
  });

  describe('getFormattedDataByKey', () => {
    it('should call and return result of `getFormattedDataByDataPath` with the correct path and format', () => {
      wrapper.setProps(props({
        data: {
          data: [
            {
              value: 60,
              id: 'basal',
            },
            {
              value: 120,
              id: 'bolus',
            },
          ],
          dataPaths: {
            summary: 'data.0',
            title: 'data.1',
          },
        },
        dataFormat: {
          summary: statFormats.percentage,
          title: statFormats.units,
        },
      }));

      const getFormattedDataByDataPathSpy = sinon.spy(instance, 'getFormattedDataByDataPath');

      const result = instance.getFormattedDataByKey('title');

      sinon.assert.callCount(getFormattedDataByDataPathSpy, 1);
      sinon.assert.calledWith(getFormattedDataByDataPathSpy, 'data.1', statFormats.units);

      expect(result.value).to.equal('120.0');
      expect(result.suffix).to.equal('U');
    });
  });

  describe('getDatumColor', () => {
    it('should return a color based on `datum.id`', () => {
      expect(instance.getDatumColor({ id: 'basal' })).to.equal(colors.basal);
      expect(instance.getDatumColor({ id: 'bolus' })).to.equal(colors.bolus);
      expect(instance.getDatumColor({ id: 'target' })).to.equal(colors.target);
    });

    it('should return a default color when not given `datum.id`', () => {
      expect(instance.getDatumColor({ foo: 'bar' })).to.equal(colors.statDefault);
    });

    it('should return a default color when `datum.id` doesn\'t map to an available color', () => {
      expect(instance.getDatumColor({ id: 'foo' })).to.equal(colors.statDefault);
    });

    it('should return the disabled color when `isDisabled` state is true', () => {
      wrapper.setState({ isDisabled: true });
      expect(instance.getDatumColor({ id: 'basal' })).to.equal(colors.statDisabled);
    });

    it('should return the muted color when another datum is being hovered and `muteOthersOnHover` prop is `true`', () => {
      wrapper.setState({ hoveredDatumIndex: 2 });
      wrapper.setProps(props({ muteOthersOnHover: true }));
      expect(instance.getDatumColor({ id: 'basal', eventKey: 1 })).to.equal(colors.muted);
    });

    it('should return the standard color when another datum is being hovered and `muteOthersOnHover` prop is `false`', () => {
      wrapper.setState({ hoveredDatumIndex: 2 });
      wrapper.setProps(props({ muteOthersOnHover: false }));
      expect(instance.getDatumColor({ id: 'basal', eventKey: 1 })).to.equal(colors.basal);
    });

    it('should return the standard color when the datum passed in is being hovered', () => {
      wrapper.setState({ hoveredDatumIndex: 1 });
      wrapper.setProps(props({ muteOthersOnHover: true }));
      expect(instance.getDatumColor({ id: 'basal', eventKey: 1 })).to.equal(colors.basal);
    });
  });

  describe('formatDatum', () => {
    context('bgCount format', () => {
      it('should return correctly formatted data when `value >= 0.05`', () => {
        expect(instance.formatDatum({
          value: 2.67777777,
        }, statFormats.bgCount)).to.include({
          value: 2.7,
        });

        expect(instance.formatDatum({
          value: 0.05,
        }, statFormats.bgCount)).to.include({
          value: 0.1,
        });

        // Want 0 decimal places if would end in `.0`
        expect(instance.formatDatum({
          value: 3.0000001,
        }, statFormats.bgCount)).to.include({
          value: 3,
        });
      });

      it('should return correctly formatted data when `value < 0.05`', () => {
        expect(instance.formatDatum({
          value: 0.035,
        }, statFormats.bgCount)).to.include({
          value: 0.04,
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.bgCount)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('bgRange format', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MGDL_UNITS,
            bgBounds: {
              veryLowThreshold: 39,
              targetLowerBound: 70,
              targetUpperBound: 180,
              veryHighThreshold: 250,
            },
          },
        }));
      });

      it('should return correctly formatted bg range for a given `datum.id`', () => {
        expect(instance.formatDatum({
          id: 'veryLow',
        }, statFormats.bgRange)).to.include({
          value: '<39',
        });

        expect(instance.formatDatum({
          id: 'low',
        }, statFormats.bgRange)).to.include({
          value: '39-70',
        });

        expect(instance.formatDatum({
          id: 'target',
        }, statFormats.bgRange)).to.include({
          value: '70-180',
        });

        expect(instance.formatDatum({
          id: 'high',
        }, statFormats.bgRange)).to.include({
          value: '180-250',
        });

        expect(instance.formatDatum({
          id: 'veryHigh',
        }, statFormats.bgRange)).to.include({
          value: '>250',
        });
      });
    });

    context('bgValue format', () => {
      it('should classify and format a datum when `value >= 0` for mg/dL units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MGDL_UNITS,
            bgBounds: {
              veryLowThreshold: 39,
              targetLowerBound: 70,
              targetUpperBound: 180,
              veryHighThreshold: 250,
            },
          },
        }));

        // Using 3-way classification, so both `low` and `veryLow` are classified as `low`
        expect(instance.formatDatum({
          value: 35.8,
        }, statFormats.bgValue)).to.include({
          id: 'low',
          value: '36',
        });

        expect(instance.formatDatum({
          value: 68.2,
        }, statFormats.bgValue)).to.include({
          id: 'low',
          value: '68',
        });

        expect(instance.formatDatum({
          value: 100,
        }, statFormats.bgValue)).to.include({
          id: 'target',
          value: '100',
        });

        // Using 3-way classification, so both `high` and `veryHigh` are classified as `high`
        expect(instance.formatDatum({
          value: 200,
        }, statFormats.bgValue)).to.include({
          id: 'high',
          value: '200',
        });

        expect(instance.formatDatum({
          value: 252,
        }, statFormats.bgValue)).to.include({
          id: 'high',
          value: '252',
        });
      });

      it('should classify and format a datum when `value >= 0` for mmol/L units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MMOLL_UNITS,
            bgBounds: {
              veryLowThreshold: 3.0,
              targetLowerBound: 3.9,
              targetUpperBound: 10.0,
              veryHighThreshold: 13.9,
            },
          },
        }));

        // Using 3-way classification, so both `low` and `veryLow` are classified as `low`
        expect(instance.formatDatum({
          value: 2.86,
        }, statFormats.bgValue)).to.include({
          id: 'low',
          value: '2.9',
        });

        expect(instance.formatDatum({
          value: 3.62,
        }, statFormats.bgValue)).to.include({
          id: 'low',
          value: '3.6',
        });

        expect(instance.formatDatum({
          value: 7,
        }, statFormats.bgValue)).to.include({
          id: 'target',
          value: '7.0',
        });

        // Using 3-way classification, so both `high` and `veryHigh` are classified as `high`
        expect(instance.formatDatum({
          value: 12.3,
        }, statFormats.bgValue)).to.include({
          id: 'high',
          value: '12.3',
        });

        expect(instance.formatDatum({
          value: 14.1,
        }, statFormats.bgValue)).to.include({
          id: 'high',
          value: '14.1',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.bgValue)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('carbs format', () => {
      it('should return correctly formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: 84.645,
        }, statFormats.carbs)).to.include({
          suffix: 'g',
          value: '85',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.carbs)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('cv format', () => {
      it('should return correctly classified and formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: 35.8,
        }, statFormats.cv)).to.include({
          id: 'target',
          suffix: '%',
          value: '36',
        });

        expect(instance.formatDatum({
          value: 36.2,
        }, statFormats.cv)).to.include({
          id: 'high',
          suffix: '%',
          value: '36',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.cv)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('duration format', () => {
      it('should return correctly formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: MS_IN_DAY + MS_IN_HOUR + MS_IN_MIN,
        }, statFormats.duration)).to.include({
          value: '1d 1h 1m',
        });

        expect(instance.formatDatum({
          value: MS_IN_HOUR * 3 + MS_IN_MIN,
        }, statFormats.duration)).to.include({
          value: '3h 1m',
        });

        expect(instance.formatDatum({
          value: MS_IN_MIN * 48,
        }, statFormats.duration)).to.include({
          value: '48m',
        });

        // show seconds only when less than a minute
        expect(instance.formatDatum({
          value: 6000,
        }, statFormats.duration)).to.include({
          value: '6s',
        });

        // show 0m for 0
        expect(instance.formatDatum({
          value: 0,
        }, statFormats.duration)).to.include({
          value: '0m',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.duration)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('gmi format', () => {
      it('should return correctly formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: 35.85,
        }, statFormats.gmi)).to.include({
          suffix: '%',
          value: '35.9',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.gmi)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('percentage format', () => {
      it('should return correctly formatted data when `total` prop is `>= 0`', () => {
        wrapper.setProps(props({
          data: {
            total: {
              value: 10,
            },
          },
        }));

        // No decimal places when `% >= 0.5`
        expect(instance.formatDatum({
          value: 3.95,
        }, statFormats.percentage)).to.include({
          value: '40',
          suffix: '%',
        });

        // 1 decimal place when `% < 0.5` and `% >= 0.05`
        expect(instance.formatDatum({
          value: 0.049,
        }, statFormats.percentage)).to.include({
          value: '0.5',
          suffix: '%',
        });

        // 1 decimal places when `% < 0.05`
        expect(instance.formatDatum({
          value: 0.0049,
        }, statFormats.percentage)).to.include({
          value: '0.05',
          suffix: '%',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        wrapper.setProps(props({
          data: {
            total: {
              value: -1,
            },
          },
        }));

        expect(instance.formatDatum({
          value: 10,
        }, statFormats.percentage)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('standardDevRange format', () => {
      const renderResult = result => {
        const Component = () => result.value;
        const render = shallow(<Component />);

        return {
          lower: {
            color: render.childAt(0).props().style.color,
            value: render.childAt(0).props().children,
          },
          upper: {
            color: render.childAt(2).props().style.color,
            value: render.childAt(2).props().children,
          },
        };
      };

      it('should return correctly formatted html when `value >= 0` && `deviation.value >= 0` for mg/dL units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MGDL_UNITS,
            bgBounds: {
              veryLowThreshold: 39,
              targetLowerBound: 70,
              targetUpperBound: 180,
              veryHighThreshold: 250,
            },
          },
        }));

        expect(renderResult(instance.formatDatum({
          value: 56,
          deviation: { value: 20 },
        }, statFormats.standardDevRange))).to.eql({
          lower: {
            color: colors.low,
            value: '36',
          },
          upper: {
            color: colors.target,
            value: '76',
          },
        });

        expect(renderResult(instance.formatDatum({
          value: 160,
          deviation: { value: 30 },
        }, statFormats.standardDevRange))).to.eql({
          lower: {
            color: colors.target,
            value: '130',
          },
          upper: {
            color: colors.high,
            value: '190',
          },
        });
      });

      it('should return correctly formatted html when `value >= 0` && `deviation.value >= 0` for mg/dL units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MMOLL_UNITS,
            bgBounds: {
              veryLowThreshold: 3.0,
              targetLowerBound: 3.9,
              targetUpperBound: 10.0,
              veryHighThreshold: 13.9,
            },
          },
        }));

        expect(renderResult(instance.formatDatum({
          value: 3.8,
          deviation: { value: 1 },
        }, statFormats.standardDevRange))).to.eql({
          lower: {
            color: colors.low,
            value: '2.8',
          },
          upper: {
            color: colors.target,
            value: '4.8',
          },
        });

        expect(renderResult(instance.formatDatum({
          value: 10.2,
          deviation: { value: 1.5 },
        }, statFormats.standardDevRange))).to.eql({
          lower: {
            color: colors.target,
            value: '8.7',
          },
          upper: {
            color: colors.high,
            value: '11.7',
          },
        });
      });

      it('should return the empty placeholder text and id when `value < 0` || `deviation.value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
          deviation: { value: 10 },
        }, statFormats.standardDevRange)).to.include({
          id: 'statDisabled',
          value: '--',
        });

        expect(instance.formatDatum({
          value: 10,
          deviation: { value: -1 },
        }, statFormats.standardDevRange)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('standardDevValue format', () => {
      it('should return correctly formatted data when `value >= 0` for mg/dL units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MGDL_UNITS,
          },
        }));

        expect(instance.formatDatum({
          value: 42.85,
        }, statFormats.standardDevValue)).to.include({
          value: '43',
        });
      });

      it('should return correctly formatted data when `value >= 0` for mmol/L units', () => {
        wrapper.setProps(props({
          bgPrefs: {
            bgUnits: MMOLL_UNITS,
          },
        }));

        expect(instance.formatDatum({
          value: 15.86,
        }, statFormats.standardDevValue)).to.include({
          value: '15.9',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.standardDevValue)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('units format', () => {
      it('should return correctly formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: 47.234,
        }, statFormats.units)).to.include({
          value: '47.2',
          suffix: 'U',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.units)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });

    context('unitsPerKg format', () => {
      it('should return correctly formatted data when `value >= 0`', () => {
        expect(instance.formatDatum({
          value: 10.678,
          suffix: 'kg',
        }, statFormats.unitsPerKg)).to.include({
          value: '10.68',
          suffix: 'U/kg',
        });

        expect(instance.formatDatum({
          value: 11,
          suffix: 'kg',
        }, statFormats.unitsPerKg)).to.include({
          value: '11.00',
          suffix: 'U/kg',
        });
      });

      it('should convert `lb` values to `kg` by multiplying 2.2046226218, and format to 2 decimal places', () => {
        expect(instance.formatDatum({
          value: 1,
          suffix: 'lb',
        }, statFormats.unitsPerKg)).to.include({
          value: '2.20',
          suffix: 'U/kg',
        });
      });

      it('should return the empty placeholder text and id when `value < 0`', () => {
        expect(instance.formatDatum({
          value: -1,
        }, statFormats.unitsPerKg)).to.include({
          id: 'statDisabled',
          value: '--',
        });
      });
    });
  });

  describe('handleCollapse', () => {
    it('should toggle the `isOpened` state', () => {
      wrapper.setProps(props({
        type: statTypes.barHorizontal,
      }));

      wrapper.setState({
        isOpened: false,
      });

      instance.handleCollapse();
      expect(wrapper.state().isOpened).to.be.true;

      instance.handleCollapse();
      expect(wrapper.state().isOpened).to.be.false;
    });

    it('should reset the state to the result of `getStateByType` method after toggling the isOpened state', () => {
      wrapper.setProps(props({
        type: statTypes.barHorizontal,
      }));

      const setStateSpy = sinon.spy(instance, 'setState');
      const getStateByTypeSpy = sinon.spy(instance, 'getStateByType');

      instance.handleCollapse();

      sinon.assert.callCount(setStateSpy, 3);
      sinon.assert.callCount(getStateByTypeSpy, 2);

      sinon.assert.callOrder(setStateSpy, getStateByTypeSpy, setStateSpy);
    });
  });

  describe('handleTooltipIconMouseOver', () => {
    it('should set the message tooltip state', () => {
      const setStateSpy = sinon.spy(instance, 'setState');

      instance.tooltipIcon = {
        getBoundingClientRect: sinon.stub().returns({
          top: 10,
          left: 20,
          width: 200,
          height: 100,
        }),
      };

      instance.stat = {
        getBoundingClientRect: sinon.stub().returns({
          top: 10,
          left: 20,
          height: 100,
        }),
      };

      instance.handleTooltipIconMouseOver();

      sinon.assert.callCount(setStateSpy, 1);
      sinon.assert.calledWith(setStateSpy, sinon.match({
        showMessages: true,
        messageTooltipOffset: { horizontal: 100, top: -100 },
        messageTooltipPosition: { left: 100, top: 50 },
        messageTooltipSide: 'right',
      }));
    });
  });

  describe('handleTooltipIconMouseOut', () => {
    it('should set the `showMessages` state to `false`', () => {
      wrapper.setState({ showMessages: true });
      expect(wrapper.state().showMessages).to.be.true;
      instance.handleTooltipIconMouseOut();
      expect(wrapper.state().showMessages).to.be.false;
    });
  });

});

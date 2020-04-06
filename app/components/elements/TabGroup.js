import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';
import { default as Tabs, TabsProps } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import map from 'lodash/map';

function tabProps(id, index, disabled) {
  return {
    id: `${id}-tab-${index}`,
    'aria-controls': `${id}-tab-panel-${index}`,
    disabled,
  };
}

function tabPanelProps(id, index, selectedIndex) {
  return {
    role: 'tabpanel',
    hidden: selectedIndex !== index,
    id: `${id}-tab-panel-${index}`,
    'aria-labelledby': `${id}-tab-${index}`,
  };
}

const StyledTab = styled(Tab)`

`;

const StyledTabGroup = styled(Tabs)`

`;

export const TabGroup = props => {
  const {
    id,
    tabs,
    children,
    value: selectedTabIndex,
    ...tabGroupProps
  } = props;

  return (
    <React.Fragment>
      <StyledTabGroup {...tabGroupProps}>
        {map(tabs, ({ label, disabled }, index) => (
          <StyledTab label={label} {...tabProps(id, index, disabled)} />
        ))}
      </StyledTabGroup>
      {children.map((Child, index) => (
        React.cloneElement(Child, tabPanelProps(id, index, selectedTabIndex))
      ))}
    </React.Fragment>
  );
}

TabGroup.propTypes = {
  ...TabsProps,
  id: PropTypes.string.isRequired,
  'aria-label': PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
};

TabGroup.defaultProps = {
  selectedTabIndex: 0,
  variant: 'tabs.horizontal',
}

export default TabGroup;

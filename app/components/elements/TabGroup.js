import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import { default as Tabs, TabsProps } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import map from 'lodash/map';

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
      <StyledTabGroup className="tabs" {...tabGroupProps}>
        {map(tabs, ({ label, disabled }, index) => (
          <StyledTab
            label={label}
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-tab-panel-${index}`}
            disabled={disabled}
          />
        ))}
      </StyledTabGroup>
      <Box className="tab-panels">
        {map(children, (Child, index) => (
          React.cloneElement(Child, {
            role: 'tabpanel',
            hidden: selectedTabIndex !== index,
            id: `${id}-tab-panel-${index}`,
            'aria-labelledby': `${id}-tab-${index}`,
          })
        ))}
      </Box>
    </React.Fragment>
  );
};

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
  value: 0,
  variant: 'tabs.horizontal',
};

export default TabGroup;

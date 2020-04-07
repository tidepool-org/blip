import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Flex, BoxProps, FlexProps } from 'rebass/styled-components';
import { default as Tabs, TabsProps } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import map from 'lodash/map';

const StyledTab = styled(Tab)`

`;

const StyledTabGroup = styled(Tabs)`

`;

export const TabGroup = props => {
  const {
    tabs,
    children,
    id,
    value: selectedTabIndex,
    themeProps,
    variant,
    ...tabGroupProps
  } = props;

  return (
    <Flex variant={`tabGroups.${variant}`} {...themeProps.wrapper}>
      <Box {...themeProps.tabs}>
        <StyledTabGroup className="tabs" orientation={variant} value={selectedTabIndex} {...tabGroupProps}>
          {map(tabs, ({ label, disabled }, index) => (
            <StyledTab
              key={index}
              label={label}
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-tab-panel-${index}`}
              disabled={disabled}
            />
          ))}
        </StyledTabGroup>
      </Box>
      <Box className="tab-panels" {...themeProps.panel}>
        {map(children, (Child, index) => (
          React.cloneElement(Child, {
            key: index,
            role: 'tabpanel',
            hidden: selectedTabIndex !== index,
            id: `${id}-tab-panel-${index}`,
            'aria-labelledby': `${id}-tab-${index}`,
          })
        ))}
      </Box>
    </Flex>
  );
};

TabGroup.propTypes = {
  ...BoxProps,
  ...TabsProps,
  'aria-label': PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
  themeProps: PropTypes.shape({
    wrapper: PropTypes.shape(FlexProps),
    panel: PropTypes.shape(BoxProps),
    tabs: PropTypes.shape(BoxProps),
  }),
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
};

TabGroup.defaultProps = {
  value: 0,
  variant: 'horizontal',
};

export default TabGroup;

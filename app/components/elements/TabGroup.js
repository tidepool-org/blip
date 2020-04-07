import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Flex, BoxProps, FlexProps } from 'rebass/styled-components';
import { default as Tabs, TabsProps } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import map from 'lodash/map';

import { colors, space } from '../../themes/baseTheme';

const StyledTab = styled(Tab)`
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  min-height: auto;
  text-transform: none;

  &.Mui-selected {
    color: ${colors.text.link};
  },

  &:hover {
    background-color: ${colors.lightestGrey};
  }

  .MuiTab-wrapper {
    flex-direction: row;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;

    > span {
      color: inherit;
    }

    > *:first-child {
      margin-bottom: 0;
      margin-right: ${space[2]}px;
    }
  }
  `;

const StyledTabGroup = styled(Tabs)`
  min-height: auto;

  &.MuiTabs-root, .MuiTabs-fixed {
    overflow: visible !important;
  }

  .MuiTabs-indicator {
    background-color: ${colors.text.link};
  }
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
          {map(tabs, ({ label, icon, disabled }, index) => (
            <StyledTab
              key={index}
              label={label}
              icon={icon}
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-tab-panel-${index}`}
              disabled={disabled}
              disableRipple
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
    label: PropTypes.string,
    icon: PropTypes.elementType,
    disabled: PropTypes.bool,
  })),
};

TabGroup.defaultProps = {
  value: 0,
  variant: 'horizontal',
};

export default TabGroup;

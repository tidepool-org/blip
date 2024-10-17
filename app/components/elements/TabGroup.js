import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Box, Flex, BoxProps, FlexProps } from 'theme-ui';
import { default as Tabs, TabsProps } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import map from 'lodash/map';

import { borders, colors, space } from '../../themes/baseTheme';

const StyledTab = styled(Tab)`
  && {
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    min-height: auto;
    min-width: auto;
    max-width: 300px;
    text-transform: none;
    padding: 12px ${space[4]}px;
    opacity: 1;
    color: ${colors.tab.primary};

    &.Mui-selected {
      color: ${colors.tab.selected};
      opacity: 1;
    }

    &.Mui-disabled {
      color: ${colors.tab.disabled};
    }

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

      > *:last-child {
        margin-right: 0;
      }
    }
  }
`;

const StyledTabGroup = styled(Tabs)`
  && {
    min-height: auto;

    .MuiTabs-indicator {
      background-color: ${colors.tab.selected};
      z-index: 1;
    }
  }
`;

export function TabGroup(props) {
  const {
    tabs,
    children,
    id,
    value: selectedTabIndex,
    themeProps,
    variant,
    ...tabGroupProps
  } = props;

  const isHorizontal = variant === 'horizontal';

  return (
    <Flex variant={`tabGroups.${variant}`} {...themeProps.wrapper}>
      <Box {...themeProps.tabs}>
        <StyledTabGroup
          className="tabs"
          orientation={variant}
          variant="scrollable"
          scrollButtons="auto"
          value={selectedTabIndex}
          {...tabGroupProps}
        >
          {map(tabs, ({ label, icon, disabled }, index) => (
            <StyledTab
              key={index}
              label={label && (<span>{label}</span>)}
              icon={icon}
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-tab-panel-${index}`}
              disabled={disabled}
              disableRipple
            />
          ))}
        </StyledTabGroup>
        <Box
          className="divider"
          width={isHorizontal ? '100%' : '2px'}
          height={isHorizontal ? '2px' : '100%'}
          sx={{
            borderTop: isHorizontal ? borders.dividerDark : 'none',
            borderRight: isHorizontal ? 'none' : borders.dividerDark,
            position: 'relative',
            top: isHorizontal ? '-2px' : '-100%',
            left: isHorizontal ? 0 : 'calc(100% - 2px)',
            zIndex: 0,
          }}
        />
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
}

TabGroup.propTypes = {
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
  themeProps: {},
  value: 0,
  variant: 'horizontal',
};

export default TabGroup;

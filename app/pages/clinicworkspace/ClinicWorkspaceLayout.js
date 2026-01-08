import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Box } from 'theme-ui';
import styled from '@emotion/styled';
import { default as Tabs } from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useFlags } from 'launchdarkly-react-client-sdk';

import ClinicWorkspaceHeader from '../../components/clinic/ClinicWorkspaceHeader';
import { borders, colors, space } from '../../themes/baseTheme';

const StyledTab = styled(Tab)`
  && {
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    min-height: auto;
    min-width: auto;
    text-transform: none;
    padding: 16px ${space[5]}px;
    opacity: 1;
    color: ${colors.text.primary};

    &.Mui-selected {
      color: ${colors.purpleMedium};
      opacity: 1;
    }

    &.Mui-disabled {
      color: ${colors.text.primaryDisabled};
    }

    &:hover {
      background-color: ${colors.lightestGrey};
    }

    .MuiTab-wrapper {
      flex-direction: row;
      color: inherit;
      font-size: inherit;
      font-weight: inherit;
    }
  }
`;

const StyledTabs = styled(Tabs)`
  && {
    min-height: auto;
    background-color: ${colors.white};
    border-radius: 8px 8px 0 0;

    .MuiTabs-indicator {
      background-color: ${colors.purpleMedium};
      height: 3px;
      z-index: 1;
    }
  }
`;

const TabDivider = styled(Box)`
  width: 100%;
  height: 2px;
  border-top: ${borders.dividerDark};
  position: relative;
  top: -2px;
  z-index: 0;
`;

export const ClinicWorkspaceLayout = (props) => {
  const { t, api, trackMetric, children } = props;
  const { pathname } = useLocation();
  const history = useHistory();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { showTideDashboard } = useFlags();

  // Define the top-level tabs
  const topLevelTabs = useMemo(() => {
    const tabs = [
      {
        name: 'patients',
        label: t('Patient List'),
        path: '/clinic-workspace',
        matchPaths: ['/clinic-workspace'],
        metric: 'Clinic - View patient list tab',
      },
    ];

    if (showTideDashboard) {
      tabs.push({
        name: 'tide',
        label: t('TIDE Dashboard'),
        path: '/dashboard/tide',
        matchPaths: ['/dashboard/tide'],
        metric: 'Clinic - View TIDE dashboard tab',
      });
    }

    // Device Issues tab - always show for now, can be feature-flagged later
    tabs.push({
      name: 'device-issues',
      label: t('Device Issues'),
      path: '/clinic-workspace/device-issues',
      matchPaths: ['/clinic-workspace/device-issues'],
      metric: 'Clinic - View device issues tab',
    });

    return tabs;
  }, [t, showTideDashboard]);

  // Determine which tab is currently active based on URL
  const activeTabIndex = useMemo(() => {
    for (let i = 0; i < topLevelTabs.length; i++) {
      const tab = topLevelTabs[i];
      // Check if current path starts with any of the match paths
      if (tab.matchPaths.some(matchPath => pathname.startsWith(matchPath))) {
        // Special case: /clinic-workspace/device-issues should match device-issues, not patients
        if (pathname.startsWith('/clinic-workspace/device-issues') && tab.name !== 'device-issues') {
          continue;
        }
        return i;
      }
    }
    return 0;
  }, [pathname, topLevelTabs]);

  const handleTabChange = (_event, newIndex) => {
    const tab = topLevelTabs[newIndex];
    trackMetric(tab.metric, { clinicId: selectedClinicId, source: 'top-level tabs' });
    history.push(tab.path);
  };

  return (
    <>
      <ClinicWorkspaceHeader api={api} trackMetric={trackMetric} />

      <Box
        id="clinic-workspace-layout"
        variant="containers.largeBordered"
        mb={9}
        sx={{ overflow: 'hidden' }}
      >
        <StyledTabs
          value={activeTabIndex}
          onChange={handleTabChange}
          aria-label={t('Clinic workspace navigation')}
          variant="scrollable"
          scrollButtons="auto"
        >
          {topLevelTabs.map((tab, index) => (
            <StyledTab
              key={tab.name}
              label={tab.label}
              id={`clinic-workspace-top-tab-${index}`}
              aria-controls={`clinic-workspace-top-tab-panel-${index}`}
              disableRipple
            />
          ))}
        </StyledTabs>
        <TabDivider />

        <Box
          id="clinic-workspace-content"
          role="tabpanel"
          aria-labelledby={`clinic-workspace-top-tab-${activeTabIndex}`}
          sx={{ position: 'relative' }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

ClinicWorkspaceLayout.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
  children: PropTypes.node,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicWorkspaceLayout);

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
import { colors, space } from '../../themes/baseTheme';

const StyledTab = styled(Tab)`
  && {
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    min-height: auto;
    min-width: auto;
    text-transform: none;
    padding: 12px ${space[5]}px;
    opacity: 1;
    color: #5D687F;
    background-color: #CCD0DB;
    border-radius: 4px 4px 0 0;

    &.Mui-selected {
      color: ${colors.white};
      background-color: #5D687F;
      opacity: 1;
    }

    &.Mui-disabled {
      color: ${colors.text.primaryDisabled};
    }

    &:hover:not(.Mui-selected) {
      color: ${colors.white};
      background-color: #7D889F;
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
    background-color: #CCD0DB;
    border-radius: 4px 4px 0 0;
    padding: 1px;
    padding-bottom: 0;

    .MuiTabs-indicator {
      display: none;
    }

    .MuiTabs-flexContainer {
      gap: 1px;
    }
  }
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

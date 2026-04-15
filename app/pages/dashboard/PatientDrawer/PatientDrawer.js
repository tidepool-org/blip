import React from 'react';
import Icon from '../../../components/elements/Icon';
import { useLocation, useHistory } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import styled from '@emotion/styled';
import { makeStyles } from '@material-ui/core/styles';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { Box } from 'theme-ui';
import { useFlags } from 'launchdarkly-react-client-sdk';

import Overview from './Overview';
import StackedDaily from './StackedDaily';
import MenuBar, { OVERVIEW_TAB_INDEX, STACKED_DAILY_TAB_INDEX } from './MenuBar';
import useAgpCGM from './useAgpCGM';
import { shadows } from '../../../themes/baseTheme';
import { useScrollToTop } from '../../../core/hooks';

const StyledCloseButton = styled(Icon)`
  position: absolute;

  top: 20px;
  left: -50px;

  display: 'flex';
  justify-content: 'center';
  align-items: 'center';
  background: #D1D6E1B2;
  border-radius: 50%;
  padding: 8px;
  color: #FFFFFF;
`

const StyledDrawer = styled(Drawer)({
  '& .MuiBackdrop-root' : { background: '#192B4BB2' }
 })

const useStyles = makeStyles({
  paperAnchorRight: { overflow: 'visible' }
});

const DESKTOP_DRAWER_WIDTH = '1000px';
const DRAWER_CLOSE_BUTTON_GAP = '70px';

export const isValidAgpPeriod = period => ['7d', '14d', '30d'].includes(period);

const getAgpPeriodInDays = (period) => {
  switch(period) {
    case '1d': // minimum 7-day AGP period, so return 7
    case '7d': return 7;
    case '14d': return 14;
    case '30d': return 30;
    default: return 14; // 14 is standard for AGP
  }
};

const DrawerContent = ({ patientId, onClose, api, trackMetric, period }) => {
  // Only rendered when patient is selected and isOpen is true
  // this will also allow the hook to dismount and for the cleanup to be called
  const location = useLocation();
  const history = useHistory();
  const drawerTab = parseInt(new URLSearchParams(location.search).get('drawerTab') || OVERVIEW_TAB_INDEX, 10);
  const [selectedTab, setSelectedTab] = React.useState(drawerTab);
  const [scrolledToTop, setScrolledToTop] = React.useState(true);
  const agpPeriodInDays = getAgpPeriodInDays(period);
  const agpCGMData = useAgpCGM(api, patientId, agpPeriodInDays);
  const contentRef = React.useRef(undefined);
  useScrollToTop(contentRef?.current, [selectedTab]);

  function setDrawerTabParam(tabIndex) {
    const { search, pathname } = location;
    const params = new URLSearchParams(search);
    params.set('drawerTab', tabIndex);
    history.replace({ pathname, search: params.toString() });
  }

  function handleSelectTab(tabIndex) {
    setSelectedTab(parseInt(tabIndex, 10));
    setDrawerTabParam(tabIndex);
  }

  const handleContentScroll = (e) => {
    setScrolledToTop((e.target.scrollTop || 0) <= 5);
  }

  return (
    <>
      <Box sx={{ flexShrink: 0 }}>
        <MenuBar patientId={patientId} trackMetric={trackMetric} onClose={onClose} selectedTab={selectedTab} onSelectTab={handleSelectTab} />

        <Box className='sticky-shadow' sx={{ height: '8px', position: 'sticky', zIndex: 1, visibility: scrolledToTop ? 'hidden' : 'visible', boxShadow: shadows.large }} />
      </Box>

      <Box
        px={4}
        pb={4}
        sx={{
          flex: 1,
          overflowY: 'scroll',
          minHeight: 0, // Important for flex child to shrink
        }}
        onScroll={handleContentScroll}
        ref={contentRef}
      >
        {selectedTab === OVERVIEW_TAB_INDEX && <Overview patientId={patientId} agpCGMData={agpCGMData} />}
        {selectedTab === STACKED_DAILY_TAB_INDEX && <StackedDaily patientId={patientId} agpCGMData={agpCGMData} />}
      </Box>
    </>
  )
}

const PatientDrawer = ({ patientId, onClose, api, trackMetric, period }) => {
  const classes = useStyles();
  const { showTideDashboardPatientDrawer } = useFlags();
  const isOpen = !!patientId && isValidAgpPeriod(period);

  if (!showTideDashboardPatientDrawer) return null;

  return (
    <StyledDrawer
      anchor='right'
      classes={{ paperAnchorRight: classes.paperAnchorRight }}
      open={isOpen}
      onClose={onClose}
    >
      <StyledCloseButton label="close" onClick={onClose} icon={CloseRoundedIcon} variant="button" />

      <Box
        sx={{
          width: `calc(100vw - ${DRAWER_CLOSE_BUTTON_GAP})`, // account space needed for close button
          maxWidth: DESKTOP_DRAWER_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isOpen && <DrawerContent patientId={patientId} onClose={onClose} api={api} trackMetric={trackMetric} period={period} />}
      </Box>
    </StyledDrawer>
  );
};

export default PatientDrawer;

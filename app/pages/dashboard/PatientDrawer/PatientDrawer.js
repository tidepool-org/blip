import React from 'react';
import Icon from '../../../components/elements/Icon';
import Drawer from '@material-ui/core/Drawer';
import styled from '@emotion/styled';
import { makeStyles } from '@material-ui/core/styles';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { Box } from 'theme-ui';

import Content from './Content';
import MenuBar from './MenuBar';

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

const DRAWER_WIDTH = '1100px';

const PatientDrawer = ({ patientId, onClose, api, trackMetric }) => {
  const classes = useStyles();

  const isOpen = !!patientId;

  return (
    <StyledDrawer 
      anchor='right'
      classes={{ paperAnchorRight: classes.paperAnchorRight }}
      open={isOpen} 
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') return; // prevent closing on outside click
      }}
    > 
      <StyledCloseButton label="close" onClick={onClose} icon={CloseRoundedIcon} variant="button" />

      <Box px={4} py={4} sx={{ width: DRAWER_WIDTH,  height: '100%',  overflowY: 'scroll' }}>
        { isOpen && 
          <>
            <MenuBar patientId={patientId} api={api} trackMetric={trackMetric} />
            <Content patientId={patientId} api={api} />
          </>
        }
      </Box>
    </StyledDrawer>
  );
}

export default PatientDrawer;
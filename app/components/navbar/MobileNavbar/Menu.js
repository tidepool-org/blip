import React from 'react';
import { Box } from 'theme-ui';
import Popover from '../../elements/Popover';

import {
  usePopupState,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

const Menu = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'mobileNavigationMenu' });

  return (
    <>
      <button {...bindTrigger(popupState)}>
        { 'Menu' }
      </button>
      <Popover
        sx={{ minWidth: '15em' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...bindPopover(popupState)}
      >
        <Box py={2}>
          <p>Item List</p>
        </Box>
      </Popover>
    </>
  );
};
 
export default Menu;
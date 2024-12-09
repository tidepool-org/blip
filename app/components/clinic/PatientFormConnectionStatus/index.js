import React from 'react';
import { Flex } from 'theme-ui';
import Icon from '../../elements/Icon';
import { radii } from '../../../themes/baseTheme';

import StatusLabel from './StatusLabel';
import Actions from './Actions';

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  PENDING_RECONNECT: 'pendingReconnect',
  PENDING_EXPIRED: 'pendingExpired',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  UNKNOWN: 'unknown'
};

const PatientFormConnectionStatus = ({
  iconLabel,
  iconSrc,
  status,
  onCopy,
  onResendEmail,
}) => {

  return (
    <>
      <Flex 
        mt={3}
        px={3} 
        py={3} 
        sx={{ 
          justifyContent: 'space-between', 
          backgroundColor: '#F0F5FF', // TODO: FIX
          borderRadius: radii.default 
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <Icon variant="static" label={iconLabel} iconSrc={iconSrc} mr={3} />
          <StatusLabel status={status} />
        </Flex>

        <Actions 
          status={'status'} 
          onCopy={onCopy} 
          onResendEmail={onResendEmail} 
        />
      </Flex>
    </>
  );
}

export default PatientFormConnectionStatus;
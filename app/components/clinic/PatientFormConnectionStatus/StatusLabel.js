import { CONNECTION_STATUS } from './index'
import { withTranslation } from 'react-i18next';
import { Text } from 'theme-ui';

const StatusLabel = withTranslation()(({ t, status }) => {
  switch(status) { 
    case CONNECTION_STATUS.PENDING:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Pending Connection')}
        </Text>
      </>);
    case CONNECTION_STATUS.PENDING_RECONNECT:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Pending Connection')}
        </Text>
      </>);
    case CONNECTION_STATUS.DISCONNECTED:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Patient Disconnected')}
        </Text>
      </>);
    case CONNECTION_STATUS.PENDING_EXPIRED:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Invite Expired')}
        </Text>
      </>);
    case ERROR: 
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Error Connecting')}
        </Text>
      </>);
    case UNKNOWN: 
    default:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {t('Unknown')}
        </Text>
      </>);
  }
});

export default StatusLabel;
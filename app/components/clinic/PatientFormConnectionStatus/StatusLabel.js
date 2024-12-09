import { CONNECTION_STATUS } from './index'
import { withTranslation } from 'react-i18next';
import { Text } from 'theme-ui';
import Icon from '../../elements/Icon';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import { colors } from '../../../themes/baseTheme';

const StatusLabel = withTranslation()(({ t, status }) => {
  switch(status) { 
    case CONNECTION_STATUS.PENDING:
    case CONNECTION_STATUS.PENDING_RECONNECT:
      return (<>
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.text.tertiary }}>
          {t('Pending Connection')}
        </Text>
      </>);
    case CONNECTION_STATUS.PENDING_EXPIRED:
      return (<>
        <Icon icon={ErrorRoundedIcon} label="Invite Expired" mr={1} sx={{ color: colors.feedback.warning }} />
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.feedback.warning }}>
          {t('Invite Expired')}
        </Text>
      </>);
    case CONNECTION_STATUS.CONNECTED:
      return (<>
        <Icon icon={CheckCircleRoundedIcon} label="Connected" mr={1} sx={{ color: colors.text.primary }} />
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.text.primary }}>
          {t('Connected')}
        </Text>
      </>);
    case CONNECTION_STATUS.DISCONNECTED:
      return (<>
        <Icon icon={ErrorRoundedIcon} label="Disconnected" mr={1} sx={{ color: colors.feedback.warning }} />
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.feedback.warning }}>
          {t('Patient Disconnected')}
        </Text>
      </>);
    case CONNECTION_STATUS.ERROR: 
      return (<>
        <Icon icon={ErrorRoundedIcon} label="Error" mr={1} sx={{ color: colors.feedback.warning }} />
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.feedback.warning }}>
          {t('Error Connecting')}
        </Text>
      </>);
    case CONNECTION_STATUS.UNKNOWN: 
    default:
      return (<>
        <Icon icon={ErrorRoundedIcon} label="Unknown" mr={1} sx={{ color: colors.feedback.warning }} />
        <Text sx={{ fontSize: 1, fontWeight: 'bold', color: colors.feedback.warning }}>
          {t('Unknown')}
        </Text>
      </>);
  }
});

export default StatusLabel;
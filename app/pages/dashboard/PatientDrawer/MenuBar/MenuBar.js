import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as actions from '../../../../redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import { Flex, Box, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import Button from '../../../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../../../components/clinic/PatientLastReviewed';
import { useFlags } from 'launchdarkly-react-client-sdk';
import CGMClipboardButton from './CGMClipboardButton';
import api from '../../../../core/api';
import { map, keys } from 'lodash';

export const OVERVIEW_TAB_INDEX = 0;
export const STACKED_DAILY_TAB_INDEX = 1;

const tabs = {
  [OVERVIEW_TAB_INDEX]: {
    name: 'overview',
    label: 'Overview',
    metric: 'TIDE Dashboard - clicked overview tab',
  },
  [STACKED_DAILY_TAB_INDEX]: {
    name: 'stackedDaily',
    label: 'Stacked Daily View',
    metric: 'TIDE Dashboard - clicked stacked daily view',
  },
};

const MenuBar = ({ patientId, onClose, onSelectTab, selectedTab, trackMetric }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showTideDashboardLastReviewed } = useFlags();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const patient = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]?.patients?.[patientId]);
  const pdf = useSelector(state => state.blip.pdf); // IMPORTANT: Data taken from Redux PDF slice

  useEffect(() => {
    // DOB field in Patient object may not be populated in TIDE Dashboard, so we need to refetch
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patientId));
  }, []);

  const handleViewData = () => {
    dispatch(push(`/patients/${patientId}/data/trends?dashboard=tide&drawerTab=${selectedTab}`));
  };

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  const handleReviewSuccess = () => {
    setTimeout(() => {
      onClose();
    }, 500);
  };

  function handleSelectTab(event, tabIndex) {
    event.preventDefault();
    trackMetric(tabs[tabIndex]?.metric, { clinicId: selectedClinicId });
    onSelectTab(tabIndex);
  }

  const { fullName, birthDate } = patient || {};

  return (
    <Box px={4} pt={4} sx={{ position: 'sticky', top: 0, bg: 'white', zIndex: 1 }}>
      <Flex mb={4} sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: '30px' }}>
        <Flex sx={{ justifyContent: 'flex-start', gap: 2, alignItems: 'flex-end' }}>
          <Text sx={{ color: vizColors.purple90, fontWeight: 'bold', fontSize: 2, lineHeight: 0 }}>
            {fullName}
          </Text>
          {birthDate &&
            <Text sx={{ color: 'grays.5', fontWeight: 'medium', fontSize: 0, lineHeight: 0 }}>
              {t('DOB: {{birthDate}}', { birthDate })}
            </Text>
          }
        </Flex>

        <Flex sx={{ fontSize: 0, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
          {showTideDashboardLastReviewed && (
            <>
              <Text sx={{
                color: vizColors.purple90,
                fontWeight: 'medium',
              }}>
                {t('Last Reviewed')}
              </Text>

              <PatientLastReviewed
                sx={{ flexGrow: 1 }}
                api={api}
                trackMetric={trackMetric}
                metricSource="TIDE dashboard"
                patientId={patientId}
                recentlyReviewedThresholdDate={recentlyReviewedThresholdDate}
                onReview={handleReviewSuccess}
              />
            </>
          )}
        </Flex>
      </Flex>

      <Flex p="1px" sx={{ justifyContent: 'space-between', alignItems: 'center', bg: 'blue50', borderRadius: 'default' }}>
        <Flex sx={{ gap: '1px' }}>
          {map(keys(tabs), (tabKey) => (
            <Button
              variant="tab"
              key={tabKey}
              onClick={(e) => handleSelectTab(e, tabKey)}
              selected={selectedTab == tabKey}
            >
              {tabs[tabKey].label}
            </Button>
          ))}
        </Flex>

        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '1px' }}>
          <Button onClick={handleViewData} variant="tab">
            {t('View Data')}
          </Button>

          <CGMClipboardButton patient={patient} data={pdf?.data?.agpCGM} variant="tab" />
        </Flex>
      </Flex>
    </Box>
  )
}

MenuBar.propTypes = {
  patientId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectTab: PropTypes.func.isRequired,
  selectedTab: PropTypes.number.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default MenuBar;

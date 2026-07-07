import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import { Box, Flex, Text } from 'theme-ui';
import EditIcon from '@material-ui/icons/EditRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { components as vizComponents, utils as vizUtils, colors as vizColors } from '@tidepool/viz';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { Link as RouterLink } from 'react-router-dom';
import utils from '../../../core/utils';

import without from 'lodash/without';
import map from 'lodash/map';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Icon from '../../../components/elements/Icon';
import Pill from '../../../components/elements/Pill';
import Popover from '../../../components/elements/Popover';
import Checkbox from '../../../components/elements/Checkbox';

import { borders, colors } from '../../../themes/baseTheme';
import { DialogContent, DialogActions } from '../../../components/elements/Dialog';

const trackMetric = () => noop;
const prefixPopHealthMetric = () => noop;

import { SPECIAL_FILTER_STATES } from '../ClinicPatients';

const DropdownContent = ({
  onClose = noop,
  onChange = noop,
  clinicSites = [],
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const [pendingSites, setPendingSites] = useState(clinicSites);

  const isFilteringForZeroSites = isEqual(pendingSites, SPECIAL_FILTER_STATES.ZERO_SITES);

  const sortedSiteFilterOptions = useMemo(() => {
    return map(clinic?.sites, ({ id, name }) => ({ id, label: name }))
      .toSorted((a, b) => utils.compareLabels(a.label, b.label));
  }, [clinic?.sites]);

  const handleChange = (clinicSites) => onChange(clinicSites);

  return (
    <>
      <DialogContent px={2} pt={1} pb={3} mt={3} sx={{ maxHeight: '400px', maxWidth: '240px' }} dividers>
        <Box variant="containers.small">
          <Box mb={2}>
            <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 1, fontWeight: 'medium' }}>
              {t('Sites')}
            </Text>
            { sortedSiteFilterOptions.length > 0 &&
              <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 0, fontStyle: 'italic', maxWidth: '208px', whiteSpace: 'wrap', lineHeight: 1 }}>
                {t('Any patient with one or more of the sites you select below will be shown.')}
              </Text>
            }
          </Box>

          { // Render a list of checkboxes
            sortedSiteFilterOptions.map(({ id, label }) => {
              const isChecked = pendingSites?.includes(id);

              return (
                <Box mt={1} className="site-filter-option" key={`site-filter-option-${id}`}>
                  <Checkbox
                    id={`site-filter-option-checkbox-${id}`}
                    data-testid={`site-filter-option-checkbox-${id}`}
                    label={<Text sx={{ fontSize: 0, fontWeight: 'normal' }}>{label}</Text>}
                    checked={isChecked}
                    onChange={() => {
                      if (isFilteringForZeroSites) {
                        setPendingSites([id]);
                      } else if (isChecked) {
                        setPendingSites(pendingSites => without(pendingSites, id));
                      } else {
                        setPendingSites(pendingSites => [...pendingSites, id]);
                      }
                    }}
                  />
                </Box>
              );
            })
          }

          { // Display an option to filter for patients with zero sites
            sortedSiteFilterOptions.length > 0 &&
            <Box mt={2} mx={-2} pt={3} px={2} sx={{ borderTop: borders.divider }} className="clinic-site-filter-option" key="clinic-site-filter-option-PWDS_WITH_ZERO_SITES">
              <Checkbox
                id="site-filter-option-checkbox-PWDS_WITH_ZERO_SITES"
                data-testid="site-filter-option-checkbox-PWDS_WITH_ZERO_SITES"
                label={<Text sx={{ fontSize: 0, fontWeight: 'normal' }}>
                  {t('Patients without any sites')}
                </Text>}
                checked={isFilteringForZeroSites}
                onChange={() => {
                  if (isFilteringForZeroSites) {
                    setPendingSites([]);
                  } else {
                    setPendingSites(SPECIAL_FILTER_STATES.ZERO_SITES);
                  }
                }}
              />
            </Box>
          }

          { // If no sites exist, display a message
            sortedSiteFilterOptions.length <= 0 &&
            <Box>
              <Box sx={{ fontSize: 1, color: colors.gray50, lineHeight: 1 }}>
                {t('Create and assign sites to patient accounts to segment your patient population by location.')}
              </Box>

            </Box>
          }
        </Box>
      </DialogContent>

      { sortedSiteFilterOptions.length > 0 &&
        <DialogActions sx={{ justifyContent: 'space-around', padding: 2 }} p={1}>
          <Button
            id="clear-patient-sites-filter"
            sx={{ fontSize: 1 }}
            variant="textSecondary"
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Patient site filter clear'), { clinicId: selectedClinicId });
              setPendingSites([]);
              handleChange([]);
              onClose();
            }}
          >
            {t('Clear')}
          </Button>

          <Button id="apply-patient-sites-filter" sx={{ fontSize: 1 }} variant="textPrimary" onClick={() => {
            trackMetric(prefixPopHealthMetric('Patient site filter apply'), { clinicId: selectedClinicId });
            handleChange(pendingSites);
            onClose();
          }}>
            {t('Apply')}
          </Button>
        </DialogActions>
      }
    </>
  );
};

const SitesFilterDropdown = ({
  onChange = noop,
  clinicSites = [],
}) => {
  const { t } = useTranslation();

  const clinicSitesPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'clinicSiteFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const handleCloseDropdown = () => {
    clinicSitesPopupFilterState.close();
  };

  return (
    <>
      <Box
        onClick={() => {
          if (!clinicSitesPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('patient sites filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="patient-sites-filter-trigger"
          selected={clinicSites.length > 0}
          {...bindTrigger(clinicSitesPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by clinic sites"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          <Flex sx={{ alignItems: 'center', gap: 1 }}>
            {t('Sites')}

            {clinicSites.length > 0 && (
              <Pill
                id="patient-sites-filter-count"
                label="filter count"
                round
                sx={{
                  width: '14px',
                  fontSize: '9px',
                  lineHeight: '15px',
                  textAlign: 'center',
                  display: 'inline-block',
                }}
                colorPalette={['purpleMedium', 'white']}
                text={`${clinicSites.length}`}
              />
            )}
          </Flex>
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(clinicSitesPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Patient site filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => {
          clinicSitesPopupFilterState.close();
        }}
      >
        { clinicSitesPopupFilterState.isOpen &&
          <DropdownContent
            clinicSites={clinicSites}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default SitesFilterDropdown;

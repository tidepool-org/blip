import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import { Box, Flex, Grid, Text } from 'theme-ui';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { components as vizComponents, utils as vizUtils, colors as vizColors } from '@tidepool/viz';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { Link as RouterLink } from 'react-router-dom';
import utils from '../../../core/utils';
import { trackMetric } from '../../../core/metricUtils';

import without from 'lodash/without';
import map from 'lodash/map';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Icon from '../../../components/elements/Icon';
import Pill from '../../../components/elements/Pill';
import Popover from '../../../components/elements/Popover';
import Checkbox from '../../../components/elements/Checkbox';

import { borders, colors } from '../../../themes/baseTheme';
import { DialogContent, DialogActions } from '../../../components/elements/Dialog';

import { SPECIAL_FILTER_STATES } from '../useClinicPatientsFilters';
import useIsClinicAdmin from '../useIsClinicAdmin';
import { useClinicMetricsPageName } from '../../../core/metricUtils';
import TextInput from '../../../components/elements/TextInput';
import styled from '@emotion/styled';

const EditSitesAction = ({ onClick = noop }) => {
  const { t } = useTranslation();

  return (
    <Icon
      id="show-edit-clinic-sites-dialog"
      variant="button"
      icon={AddCircleOutlineIcon}
      label={t('Edit Sites')}
      sx={{ fontSize: 3, color: vizColors.indigo30 }}
      onClick={onClick}
    />
  );
};

const DropdownContent = ({
  onClose,
  onChange,
  clinicSites,
  onClickEditSites,
}) => {
  const { t } = useTranslation();
  const isClinicAdmin = useIsClinicAdmin();
  const pageName = useClinicMetricsPageName();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const [pendingSites, setPendingSites] = useState(clinicSites);
  const [searchText, setSearchText] = useState('');

  const isFilteringForZeroSites = isEqual(pendingSites, SPECIAL_FILTER_STATES.ZERO_SITES);

  const sortedSiteFilterOptions = useMemo(() => {
    return map(clinic?.sites, ({ id, name }) => ({ id, label: name }))
      .toSorted((a, b) => utils.compareLabels(a.label, b.label));
  }, [clinic?.sites]);

  const shownSiteFilterOptions = useMemo(() => {
    const trimmedSearchText = searchText.trim().toLowerCase();
    if (!trimmedSearchText) return sortedSiteFilterOptions;

    return sortedSiteFilterOptions.filter(({ label }) => label?.toLowerCase()?.includes(trimmedSearchText));
  }, [sortedSiteFilterOptions, searchText]);

  const handleChange = (clinicSites) => onChange(clinicSites);

  const isChecked = id => pendingSites?.includes(id);

  const canEditSites = !!onClickEditSites && isClinicAdmin;

  return (
    <Box sx={{ width: 300, position: 'sticky', top: 0 }} mt={5} mx={2}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Box sx={{ padding: 1, color: colors.gray50, fontSize: 1, fontWeight: 'medium' }}>
          {t('Clinic Sites')}
        </Box>

        {canEditSites && <EditSitesAction onClick={onClickEditSites} />}
      </Flex>

      <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
        <Box>
          { sortedSiteFilterOptions.length > 0 &&
            <TextInput
              id="search-sites"
              name="search-sites"
              placeholder={t('Search')}
              icon={!isEmpty(searchText) ? CloseRoundedIcon : SearchIcon}
              iconLabel={t('Search')}
              onClickIcon={() => setSearchText('')}
              onChange={evt => setSearchText(evt.target.value)}
              value={searchText}
              variant="ultraCondensed"
              sx={{ margin: 2, width: 'unset' }}
            />
          }
        </Box>
        <Box sx={{ maxHeight: 240, overflow: 'auto', margin: 2 }}>
          { // Render a list of checkboxes
            shownSiteFilterOptions.map(({ id, label }) => (
              <Box mt={1} className="clinic-site-filter-option" key={`clinic-site-filter-option-${id}`}>
                <Checkbox
                  id={`clinic-site-filter-option-checkbox-${id}`}
                  data-testid={`clinic-site-filter-option-checkbox-${id}`}
                  label={
                    <Text sx={{ fontSize: 0, fontWeight: 'normal', display: 'inline-block', maxWidth: '160px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {label}
                    </Text>
                  }
                  checked={isChecked(id)}
                  onChange={() => {
                    if (isFilteringForZeroSites) {
                      setPendingSites([id]);
                    } else if (isChecked(id)) {
                      setPendingSites(pendingSites => without(pendingSites, id));
                    } else {
                      setPendingSites(pendingSites => [...pendingSites, id]);
                    }
                  }}
                />
              </Box>
            ))
          }
        </Box>

        { // Display an option to filter for patients with zero sites
          sortedSiteFilterOptions.length > 0 &&
          <Box mt={1} pt={3} px={2} sx={{ borderTop: borders.divider }} className="clinic-site-filter-option" key="clinic-site-filter-option-PWDS_WITH_ZERO_SITES">
            <Checkbox
              id="clinic-site-filter-option-checkbox-PWDS_WITH_ZERO_SITES"
              data-testid="clinic-site-filter-option-checkbox-PWDS_WITH_ZERO_SITES"
              label={<Text sx={{ fontSize: 0, fontWeight: 'normal', fontStyle: 'italic' }}>
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
          <Box mx={2} mb={2}>
            <Box sx={{ fontSize: 1, color: colors.blue50, lineHeight: 1 }}>
              {t('You don\'t have any Clinic Sites listed for your workspace. Add Clinic Sites to organize and filter patients by care location.')}
            </Box>
            { !isClinicAdmin &&
              <Box mt={3} pt={3} sx={{ borderTop: `1px solid ${colors.gray05}`, fontSize: 0, color: colors.blue50, lineHeight: 1 }}>
                <Trans t={t}>
                  Only admins can add new Clinic Sites associated with this workspace. If you don't have admin access, contact a workspace admin to add clinic sites or update your permissions from&nbsp;
                  <RouterLink to='/clinic-admin' style={{ color: colors.purpleBright }}>Workspace Settings.</RouterLink>
                </Trans>
              </Box>
            }
          </Box>
        }
      </Box>

      { sortedSiteFilterOptions.length > 0 &&
        <Grid sx={{ gridTemplateColumns: '1fr 1fr' }} mt={3} mb={2}>
          <Button
            id="clear-clinic-sites-filter"
            sx={{ fontSize: 1}}
            variant="secondary"
            onClick={() => {
              trackMetric('Clinic - Clinic site filter clear', { clinicId: selectedClinicId, pageName });
              setPendingSites([]);
              handleChange([]);
              onClose();
            }}
          >
            {t('Clear')}
          </Button>

          <Button id="apply-clinic-sites-filter" sx={{ fontSize: 1}} variant="primary" onClick={() => {
            trackMetric('Clinic - Clinic sites filter apply', { clinicId: selectedClinicId, pageName });
            handleChange(pendingSites);
            onClose();
          }}>
            {t('Apply')}
          </Button>
        </Grid>
      }
    </Box>
  );
};

const SiteFilterPopover = styled(Popover)`
  .MuiPopover-paper {
    max-height: 540px;
    overflow: hidden;
  }
`;

const SiteFilterDropdown = ({
  onChange = noop,
  clinicSites = [],
  onClickEditSites = null,
}) => {
  const { t } = useTranslation();
  const pageName = useClinicMetricsPageName();

  const clinicSitesPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'clinicSitesFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const handleCloseDropdown = () => clinicSitesPopupFilterState.close();

  return (
    <>
      <Box
        onClick={() => {
          if (!clinicSitesPopupFilterState.isOpen) trackMetric('Clinic - clinic sites filter open', { clinicId: selectedClinicId, pageName });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="clinic-sites-filter-trigger"
          selected={clinicSites.length > 0}
          {...bindTrigger(clinicSitesPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by clinic sites"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          <Flex sx={{ alignItems: 'center', gap: 1 }}>
            {t('Clinic Sites')}

            {clinicSites.length > 0 && (
              <Pill
                id="clinic-sites-filter-count"
                label="clinic site count"
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

      <SiteFilterPopover
        minWidth="11em"
        closeIcon
        {...bindPopover(clinicSitesPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric('Clinic sites filter close', { clinicId: selectedClinicId, pageName });
        }}
        onClose={handleCloseDropdown}
      >
        { clinicSitesPopupFilterState.isOpen &&
          <DropdownContent
            clinicSites={clinicSites}
            onClose={handleCloseDropdown}
            onChange={onChange}
            onClickEditSites={onClickEditSites}
          />
        }
      </SiteFilterPopover>
    </>
  );
};

export default SiteFilterDropdown;

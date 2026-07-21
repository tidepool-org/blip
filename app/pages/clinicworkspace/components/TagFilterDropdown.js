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
import useClinicMetricsPageName from '../useClinicMetricsPageName';
import TextInput from '../../../components/elements/TextInput';
import styled from '@emotion/styled';

const EditTagsAction = ({ onClick = noop }) => {
  const { t } = useTranslation();

  return (
    <Icon
      id="show-edit-clinic-patient-tags-dialog"
      variant="button"
      icon={AddCircleOutlineIcon}
      label={t('Edit Tags')}
      sx={{ fontSize: 3, color: vizColors.indigo30 }}
      onClick={onClick}
    />
  );
};

const DropdownContent = ({
  onClose,
  onChange,
  patientTags,
  onClickEditTags,
}) => {
  const { t } = useTranslation();
  const isClinicAdmin = useIsClinicAdmin();
  const pageName = useClinicMetricsPageName();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const [pendingTags, setPendingTags] = useState(patientTags);
  const [searchText, setSearchText] = useState('');

  const isFilteringForZeroTags = isEqual(pendingTags, SPECIAL_FILTER_STATES.ZERO_TAGS);

  const sortedTagFilterOptions = useMemo(() => {
    return map(clinic?.patientTags, ({ id, name }) => ({ id, label: name }))
      .toSorted((a, b) => utils.compareLabels(a.label, b.label));
  }, [clinic?.patientTags]);

  const shownTagFilterOptions = useMemo(() => {
    const trimmedSearchText = searchText.trim().toLowerCase();
    if (!trimmedSearchText) return sortedTagFilterOptions;

    return sortedTagFilterOptions.filter(({ label }) => label?.toLowerCase()?.includes(trimmedSearchText));
  }, [sortedTagFilterOptions, searchText]);

  const handleChange = (patientTags) => onChange(patientTags);

  const isChecked = id => pendingTags?.includes(id);

  const canEditTags = !!onClickEditTags && isClinicAdmin;

  return (
    <Box data-testid='tag-filter-dropdown' sx={{ width: 300 }} mt={5} mx={2}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }} mb={2}>
        <Box sx={{ padding: 1, color: colors.gray50, fontSize: 1, fontWeight: 'medium' }}>
          {t('Tags')}
        </Box>

        {canEditTags && <EditTagsAction onClick={onClickEditTags} />}
      </Flex>

      <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
        <Box>
          { sortedTagFilterOptions.length > 0 &&
            <TextInput
              id="search-tags"
              name="search-tags"
              placeholder={t('Search')}
              autoFocus
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
            shownTagFilterOptions.map(({ id, label }) => (
              <Box mt={1} className="tag-filter-option" key={`tag-filter-option-${id}`}>
                <Checkbox
                  id={`tag-filter-option-checkbox-${id}`}
                  data-testid={`tag-filter-option-checkbox-${id}`}
                  label={
                    <Text sx={{ fontSize: 0, fontWeight: 'normal', display: 'inline-block', maxWidth: '160px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {label}
                    </Text>
                  }
                  checked={isChecked(id)}
                  onChange={() => {
                    if (isFilteringForZeroTags) {
                      setPendingTags([id]);
                    } else if (isChecked(id)) {
                      setPendingTags(pendingTags => without(pendingTags, id));
                    } else {
                      setPendingTags(pendingTags => [...pendingTags, id]);
                    }
                  }}
                />
              </Box>
            ))
          }
        </Box>

        { // Display an option to filter for patients with zero tags
          sortedTagFilterOptions.length > 0 &&
          <Box mt={1} pt={3} px={2} sx={{ borderTop: borders.divider }} className="clinic-site-filter-option" key="clinic-site-filter-option-PWDS_WITH_ZERO_TAGS">
            <Checkbox
              id="tag-filter-option-checkbox-PWDS_WITH_ZERO_TAGS"
              data-testid="tag-filter-option-checkbox-PWDS_WITH_ZERO_TAGS"
              label={<Text sx={{ fontSize: 0, fontWeight: 'normal', fontStyle: 'italic' }}>
                {t('Patients without any tags')}
              </Text>}
              checked={isFilteringForZeroTags}
              onChange={() => {
                if (isFilteringForZeroTags) {
                  setPendingTags([]);
                } else {
                  setPendingTags(SPECIAL_FILTER_STATES.ZERO_TAGS);
                }
              }}
            />
          </Box>
        }

        { // If no tags exist, display a message
          sortedTagFilterOptions.length <= 0 &&
          <Box mx={2} mb={2}>
            <Box sx={{ fontSize: 1, color: colors.blue50, lineHeight: 1 }} mb={3}>
              {t('You don\'t have any tags yet.')}
            </Box>
            <Box sx={{ fontSize: 1, color: colors.blue50, lineHeight: 1 }}>
              {t('Tags help you organize and find patients using categories that matter to your clinic, such as clinician, diabetes type, or care group.')}
            </Box>
            { !isClinicAdmin &&
              <Box mt={3} pt={3} sx={{ borderTop: `1px solid ${colors.gray05}`, fontSize: 0, color: colors.blue50, lineHeight: 1 }}>
                <Trans t={t}>
                  Tags can only be created by Workspace Admins. If you don't have admin access, contact a Workspace Admin to create tags or update your permissions from&nbsp;
                  <RouterLink to='/clinic-admin' style={{ color: colors.purpleBright }}>Workspace Settings.</RouterLink>
                </Trans>
              </Box>
            }
          </Box>
        }
      </Box>

      { sortedTagFilterOptions.length > 0 &&
        <Grid sx={{ gridTemplateColumns: '1fr 1fr' }} mt={3} mb={2}>
          <Button
            id="clear-patient-tags-filter"
            sx={{ fontSize: 1}}
            variant="secondary"
            onClick={() => {
              trackMetric('Clinic - Patient tag filter clear', { clinicId: selectedClinicId, pageName });
              setPendingTags([]);
              handleChange([]);
              onClose();
            }}
          >
            {t('Clear')}
          </Button>

          <Button id="apply-patient-tags-filter" sx={{ fontSize: 1}} variant="primary" onClick={() => {
            trackMetric('Clinic - Patient tag filter apply', { clinicId: selectedClinicId, pageName });
            handleChange(pendingTags);
            onClose();
          }}>
            {t('Apply')}
          </Button>
        </Grid>
      }
    </Box>
  );
};

const TagFilterPopover = styled(Popover)`
  .MuiPopover-paper {
    max-height: 540px;
    overflow: clip;
  }
`;

const TagFilterDropdown = ({
  onChange = noop,
  patientTags = [],
  onClickEditTags = null,
}) => {
  const { t } = useTranslation();
  const pageName = useClinicMetricsPageName();

  const patientTagsPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'patientTagFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const handleCloseDropdown = () => patientTagsPopupFilterState.close();

  return (
    <>
      <Box
        onClick={() => {
          if (!patientTagsPopupFilterState.isOpen) trackMetric('Clinic - patient tags filter open', { clinicId: selectedClinicId, pageName });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="patient-tags-filter-trigger"
          selected={patientTags.length > 0}
          {...bindTrigger(patientTagsPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by patient tags"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          <Flex sx={{ alignItems: 'center', gap: 1 }}>
            {t('Tags')}

            {patientTags.length > 0 && (
              <Pill
                id="patient-tags-filter-count"
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
                text={`${patientTags.length}`}
              />
            )}
          </Flex>
        </Button>
      </Box>

      <TagFilterPopover
        minWidth="11em"
        closeIcon
        {...bindPopover(patientTagsPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric('Clinic - Patient tag filter close', { clinicId: selectedClinicId, pageName });
        }}
        onClose={handleCloseDropdown}
      >
        { patientTagsPopupFilterState.isOpen &&
          <DropdownContent
            patientTags={patientTags}
            onClose={handleCloseDropdown}
            onChange={onChange}
            onClickEditTags={onClickEditTags}
          />
        }
      </TagFilterPopover>
    </>
  );
};

export default TagFilterDropdown;

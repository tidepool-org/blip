import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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

const TagsFilter = ({
  activeTags = [],
  setActiveTags = noop,
}) => {
  const { t } = useTranslation();
  const { showTideDashboard } = useFlags();

  const patientTagsPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'patientTagFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const sortedTagFilterOptions = useMemo(() => {
    return map(clinic?.patientTags, ({ id, name }) => ({ id, label: name }))
      .toSorted((a, b) => utils.compareLabels(a.label, b.label));
  }, [clinic?.patientTags]);

  const [pendingTags, setPendingTags] = useState(activeTags);

  const isFilteringForZeroTags = isEqual(pendingTags, SPECIAL_FILTER_STATES.ZERO_TAGS);

  return (
    <>
      <Box
        onClick={() => {
          if (!patientTagsPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('patient tags filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="patient-tags-filter-trigger"
          selected={activeTags.length > 0}
          {...bindTrigger(patientTagsPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by patient tags"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          <Flex sx={{ alignItems: 'center', gap: 1 }}>
            {showTideDashboard && !clinic?.patientTags?.length && <Icon
              variant="static"
              icon={InfoOutlinedIcon}
              sx={{ fontSize: '14px' }}
            />}

            {t('Tags')}

            {activeTags.length > 0 && (
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
                text={`${activeTags.length}`}
              />
            )}
          </Flex>
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(patientTagsPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Patient tag filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => {
          patientTagsPopupFilterState.close();
          setPendingTags(activeTags);
        }}
      >
        <DialogContent px={2} pt={1} pb={3} mt={3} sx={{ maxHeight: '400px', maxWidth: '240px' }} dividers>
          <Box variant="containers.small">
            <Box mb={2}>
              <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 1, fontWeight: 'medium' }}>
                {t('Tags')}
              </Text>
              { sortedTagFilterOptions.length > 0 &&
                <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 0, fontStyle: 'italic', maxWidth: '208px', whiteSpace: 'wrap', lineHeight: 1 }}>
                  {t('Only patients with ALL of the tags you select below will be shown.')}
                </Text>
              }
            </Box>

            { // Render a list of checkboxes
              sortedTagFilterOptions.map(({ id, label }) => {
                const isChecked = pendingTags?.includes(id);

                return (
                  <Box mt={1} className="tag-filter-option" key={`tag-filter-option-${id}`}>
                    <Checkbox
                      id={`tag-filter-option-checkbox-${id}`}
                      data-testid={`tag-filter-option-checkbox-${id}`}
                      label={<Text sx={{ fontSize: 0, fontWeight: 'normal' }}>{label}</Text>}
                      checked={isChecked}
                      onChange={() => {
                        if (isFilteringForZeroTags) {
                          setPendingTags([id]);
                        } else if (isChecked) {
                          setPendingTags(pendingTags => without(pendingTags, id));
                        } else {
                          setPendingTags(pendingTags => [...pendingTags, id]);
                        }
                      }}
                    />
                  </Box>
                );
              })
            }

            { // Display an option to filter for patients with zero tags
              sortedTagFilterOptions.length > 0 &&
              <Box mt={2} mx={-2} pt={3} px={2} sx={{ borderTop: borders.divider }} className="clinic-site-filter-option" key="clinic-site-filter-option-PWDS_WITH_ZERO_TAGS">
                <Checkbox
                  id="tag-filter-option-checkbox-PWDS_WITH_ZERO_TAGS"
                  data-testid="tag-filter-option-checkbox-PWDS_WITH_ZERO_TAGS"
                  label={<Text sx={{ fontSize: 0, fontWeight: 'normal' }}>
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
              <Box>
                <Box sx={{ fontSize: 1, color: colors.gray50, lineHeight: 1 }}>
                  {t('Tags help you segment your patient population based on criteria you define, such as clinician, type of diabetes, or care groups.')}
                </Box>

              </Box>
            }
          </Box>
        </DialogContent>

        { sortedTagFilterOptions.length > 0 &&
          <DialogActions sx={{ justifyContent: 'space-around', padding: 2 }} p={1}>
            <Button
              id="clear-patient-tags-filter"
              sx={{ fontSize: 1 }}
              variant="textSecondary"
              onClick={() => {
                trackMetric(prefixPopHealthMetric('Patient tag filter clear'), { clinicId: selectedClinicId });
                setPendingTags([]);
                setActiveTags([]);
                patientTagsPopupFilterState.close();
              }}
            >
              {t('Clear')}
            </Button>

            <Button id="apply-patient-tags-filter" sx={{ fontSize: 1 }} variant="textPrimary" onClick={() => {
              trackMetric(prefixPopHealthMetric('Patient tag filter apply'), { clinicId: selectedClinicId });
              setActiveTags(pendingTags);
              patientTagsPopupFilterState.close();
            }}>
              {t('Apply')}
            </Button>
          </DialogActions>
        }

      </Popover>
    </>
  );
};

export default TagsFilter;

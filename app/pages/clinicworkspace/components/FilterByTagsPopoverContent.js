import React from 'react';

import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import without from 'lodash/without';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import EditIcon from '@material-ui/icons/EditRounded';
import { Link as RouterLink } from 'react-router-dom';

import Button from '../../../components/elements/Button';
import Checkbox from '../../../components/elements/Checkbox';

import {
  DialogContent,
  DialogActions,
} from '../../../components/elements/Dialog';

import { SPECIAL_FILTER_STATES } from '../ClinicPatients';

import { borders, colors } from '../../../themes/baseTheme';

const FilterByTagsPopoverContent = ({
  tagOptions = [],
  selectedTagIds = [],
  onChange = noop,
  onClear = noop,
  onApply = noop,
  onClickEdit = null,
}) => {
  const { t } = useTranslation();
  const isFilteringForZeroTags = isEqual(selectedTagIds, SPECIAL_FILTER_STATES.ZERO_TAGS);

  return (
    <>
      <DialogContent px={2} pt={1} pb={3} mt={3} sx={{ maxHeight: '400px', maxWidth: '240px' }} dividers>
        <Box variant="containers.small">
          <Box mb={2}>
            <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 1, fontWeight: 'medium' }}>
              {t('Tags')}
            </Text>
            { tagOptions.length > 0 &&
              <Text sx={{ display: 'block', position: 'relative', top: -2, color: colors.gray50, fontSize: 0, fontStyle: 'italic', maxWidth: '208px', whiteSpace: 'wrap', lineHeight: 1 }}>
                {t('Only patients with ALL of the tags you select below will be shown.')}
              </Text>
            }
          </Box>

          { // Render a list of checkboxes
            tagOptions.map(({ id, label }) => {
              const isChecked = selectedTagIds.includes(id);

              return (
                <Box mt={1} className="tag-filter-option" key={`tag-filter-option-${id}`}>
                  <Checkbox
                    id={`tag-filter-option-checkbox-${id}`}
                    data-testid={`tag-filter-option-checkbox-${id}`}
                    label={<Text sx={{ fontSize: 0, fontWeight: 'normal' }}>{label}</Text>}
                    checked={isChecked}
                    onChange={() => {
                      if (isFilteringForZeroTags) {
                        onChange([id]);
                      } else if (selectedTagIds.includes(id)) {
                        onChange(without(selectedTagIds, id));
                      } else {
                        onChange([...selectedTagIds, id]);
                      }
                    }}
                  />
                </Box>
              );
            })
          }

          { // Display an option to filter for patients with zero tags
            tagOptions.length > 0 &&
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
                    onChange([]);
                  } else {
                    onChange(SPECIAL_FILTER_STATES.ZERO_TAGS);
                  }
                }}
              />
            </Box>
          }

          { // If no tags exist, display a message
            tagOptions.length <= 0 &&
            <Box>
              <Box sx={{ fontSize: 1, color: colors.gray50, lineHeight: 1 }}>
                {t('Tags help you segment your patient population based on criteria you define, such as clinician, type of diabetes, or care groups.')}
              </Box>
              { !onClickEdit &&
                <Box mt={3} pt={3} sx={{ borderTop: `1px solid ${colors.gray05}`, fontSize: 0, color: colors.gray50, lineHeight: 1 }}>
                  <Trans t={t}>
                    Tags can only be created by your Workspace Admins. Not sure who the admins are? Check the Clinic Members list in your&nbsp;
                    <RouterLink to='/clinic-admin' style={{ color: colors.purpleBright }}>Workspace Settings.</RouterLink>
                  </Trans>
                </Box>
              }
            </Box>
          }
        </Box>
      </DialogContent>

      { tagOptions.length > 0 &&
        <DialogActions sx={{ justifyContent: 'space-around', padding: 2 }} p={1}>
          <Button
            id="clear-patient-tags-filter"
            sx={{ fontSize: 1 }}
            variant="textSecondary"
            onClick={onClear}
          >
            {t('Clear')}
          </Button>

          <Button id="apply-patient-tags-filter" sx={{ fontSize: 1 }} variant="textPrimary" onClick={onApply}>
            {t('Apply')}
          </Button>
        </DialogActions>
      }

      {!!onClickEdit &&
        <DialogActions p={1} sx={{ borderTop: borders.divider }} py={2} px={0}>
          <Button
            id="show-edit-clinic-patient-tags-dialog"
            icon={EditIcon}
            iconPosition="left"
            iconLabel="Edit patient tags"
            sx={{ fontSize: 1 }}
            variant="textPrimary"
            onClick={onClickEdit}
          >
            {t('Edit Tags')}
          </Button>

        </DialogActions>
      }
    </>
  );
};

export default FilterByTagsPopoverContent;

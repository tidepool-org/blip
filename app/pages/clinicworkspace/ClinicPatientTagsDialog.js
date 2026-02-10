import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import utils from '../../core/utils';

import noop from 'lodash/noop';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';

import { prefixPopHealthMetric } from './ClinicPatients';
import { clinicPatientTagSchema, maxClinicPatientTags } from '../../core/clinicUtils';
import { borders, colors } from '../../themes/baseTheme';

import DeleteIcon from '@material-ui/icons/DeleteRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';

import { getCommonFormikFieldProps } from '../../core/forms';
import { useTranslation } from 'react-i18next';

import Button from '../../components/elements/Button';
import { Box, Flex, Text, Grid } from 'theme-ui';
import { Formik, Form } from 'formik';
import Icon from '../../components/elements/Icon';
import TextInput from '../../components/elements/TextInput';
import { Body1 } from '../../components/elements/FontStyles';

const ClinicPatientsTagDialog = ({
  onClose = noop,
  trackMetric = noop,
  onCreate = noop,
  onUpdate = noop,
  onDelete = noop,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const patientTagsFilterOptions = useMemo(() => {
    const options = map(clinic?.patientTags, ({ id, name }) => ({ id, label: name }));

    return orderBy(options, 'label');
  }, [clinic?.patientTags]);

  const orderedTags = clinic?.patientTags?.toSorted((a, b) => utils.compareLabels(a.name, b.name)) || [];

  return (
    <Dialog
      id="editClinicPatientTags"
      aria-labelledby="dialog-title"
      open={true}
      onClose={onClose}
    >
      <Box variant="containers.small" mb={0} sx={{ width: ['100%', '100%'] }}>
        <DialogTitle
          divider
          onClose={() => {
            trackMetric(prefixPopHealthMetric('Edit clinic tags close'), { clinicId: selectedClinicId });
            onClose();
          }}
        >
          <Body1 sx={{ fontWeight: 'medium', fontSize: 3 }}>{t('Edit Tags')}</Body1>
        </DialogTitle>

        <DialogContent pt={0} divider={false} sx={{ minWidth: '512px', maxHeight: '70vh' }}>
          <Formik
            initialValues={{ name: '' }}
            onSubmit={onCreate}
            validationSchema={clinicPatientTagSchema}
          >
            {patientTagFormikContext => (
              <Form id="patient-tag-add">
                <Box mt={3}>
                  <Text sx={{ fontSize: 1, color: 'text.primary', fontWeight: 'medium' }}>
                    {t('Add a Tag')}{' - '}
                  </Text>
                  <Text sx={{ fontSize: 0, color: 'text.primary' }}>
                    {t('You may add up to {{ maxClinicPatientTags }} tags', { maxClinicPatientTags })}
                  </Text>
                </Box>
                <Flex mb={3} mt={1} sx={{ gap: 2, position: 'relative' }}>
                  <TextInput
                    themeProps={{
                      width: '100%',
                      sx: { width: '100%', input: { height: '38px', py: '0 !important' } },
                      flex: 1,
                      fontSize: '12px',
                    }}
                    disabled={clinic?.patientTags?.length >= maxClinicPatientTags}
                    maxLength={20}
                    placeholder={t('Add a Tag')}
                    captionProps={{ mt: 0, fontSize: '10px', color: colors.grays[4] }}
                    variant="condensed"
                    {...getCommonFormikFieldProps('name', patientTagFormikContext)}
                  />

                  <Button
                    disabled={!patientTagFormikContext.values.name.trim().length || clinic?.patientTags?.length >= maxClinicPatientTags || !patientTagFormikContext.isValid}
                    type="submit"
                    sx={{
                      height: '32px',
                      position: 'absolute',
                      top: 1,
                      right: 1,
                    }}
                  >
                    {t('Add')}
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>

          { patientTagsFilterOptions.length > 0 &&
            <>
              <Box>
                <Text sx={{ fontSize: 1, color: 'text.primary', fontWeight: 'medium' }}>
                  {t('Tags ({{ count }})', { count: clinic?.patientTags?.length || '0' })}{' - '}
                </Text>
                <Text sx={{ fontSize: 0, color: 'text.primary' }}>
                  {t('Click on the edit icon to rename the tag or trash icon to delete it.')}
                </Text>
              </Box>
              <Box mt={1} mb={0}>
                <Text sx={{ fontSize: 0, color: colors.gray50, fontStyle: 'italic' }}>
                  {t('Name')}
                </Text>
              </Box>
            </>
          }

          <Box mt={1} id="clinic-patients-edit-tag-list">
            {
              orderedTags.map(({ id, name }) => (
                <Grid
                  key={`edit-tags-list-${id}`}
                  py={2}
                  sx={{
                    gridTemplateColumns: '1fr 72px 16px',
                    borderTop: `1px solid ${colors.gray05}`,
                    alignItems: 'center',
                  }}>
                  <Flex sx={{ alignItems: 'center'}}>
                    <Text className="tag-text" sx={{ fontSize: 1, color: 'text.primary' }}>{name}</Text>
                    <Icon
                      id={`edit-tag-button-${id}`}
                      data-testid={`edit-tag-button-${id}`}
                      icon={EditIcon}
                      sx={{ fontSize: 1, marginLeft: 2 }}
                      onClick={() => onUpdate(id)}
                    />
                  </Flex>
                  <Box>

                  </Box>
                  <Flex sx={{ justifyContent: 'flex-end' }}>
                    <Icon
                      id={`delete-tag-button-${id}`}
                      data-testid={`delete-tag-button-${id}`}
                      icon={DeleteIcon}
                      sx={{ fontSize: 1 }}
                      onClick={() => onDelete(id)}
                    />
                  </Flex>
                </Grid>
              ))
            }
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: borders.divider, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            id="edit-patient-tags-dialog-done"
            variant="secondary"
            sx={{ minWidth: '120px'}}
            onClick={onClose}
          >
            {t('Done')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClinicPatientsTagDialog;

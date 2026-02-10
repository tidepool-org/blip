import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import utils from '../../core/utils';

import noop from 'lodash/noop';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';

import { prefixPopHealthMetric } from './ClinicPatients';
import { maxWorkspaceClinicSites, clinicSiteSchema } from '../../core/clinicUtils';
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

const ClinicSitesDialog = ({
  onClose = noop,
  trackMetric = noop,
  onCreate = noop,
  onUpdate = noop,
  onDelete = noop,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const clinicSitesFilterOptions = useMemo(() => {
    const options = map(clinic?.sites, ({ id, name }) => ({ id, label: name }));

    return orderBy(options, 'label');
  }, [clinic?.sites]);

  const orderedSites = clinic?.sites?.toSorted((a, b) => utils.compareLabels(a.name, b.name)) || [];

  return (
    <Dialog
      id="editClinicSitesDialog"
      aria-labelledby="dialog-title"
      open={true}
      onClose={onClose}
    >
      <Box variant="containers.small" mb={0} sx={{ width: ['100%', '100%'] }}>
        <DialogTitle
          divider
          onClose={() => {
            trackMetric(prefixPopHealthMetric('Edit clinic sites dialog close'), { clinicId: selectedClinicId });
            onClose();
          }}
        >
          <Body1 sx={{ fontWeight: 'medium', fontSize: 3 }}>{t('Edit Sites')}</Body1>
        </DialogTitle>

        <DialogContent pt={0} divider={false} sx={{ minWidth: '512px', maxHeight: '70vh' }}>
          <Formik
            initialValues={{ name: '' }}
            onSubmit={onCreate}
            validationSchema={clinicSiteSchema}
          >
            {clinicSitesFormikContext => (
              <Form id="patient-site-add">
                <Box mt={3}>
                  <Text sx={{ fontSize: 1, color: 'text.primary', fontWeight: 'medium' }}>
                    {t('Add a Site')}{' - '}
                  </Text>
                  <Text sx={{ fontSize: 0, color: 'text.primary' }}>
                    {t('You may add up to {{ maxWorkspaceClinicSites }} sites', { maxWorkspaceClinicSites })}
                  </Text>
                </Box>
                <Flex mb={3} mt={1} sx={{ gap: 2, position: 'relative' }}>
                  <TextInput
                    themeProps={{
                      width: '100%',
                      sx: {
                        width: '100%',
                        input: {
                          height: '38px',
                          py: '0 !important',
                          paddingRight: '90px', // creates visual space for the Add Button
                        },
                      },
                      flex: 1,
                      fontSize: '12px',
                    }}
                    disabled={clinic?.sites?.length >= maxWorkspaceClinicSites}
                    maxLength={200}
                    placeholder={t('Add a Site')}
                    captionProps={{ mt: 0, fontSize: '10px', color: colors.grays[4] }}
                    variant="condensed"
                    {...getCommonFormikFieldProps('name', clinicSitesFormikContext)}
                  />

                  <Button
                    disabled={!clinicSitesFormikContext.values.name.trim().length || clinic?.sites?.length >= maxWorkspaceClinicSites || !clinicSitesFormikContext.isValid}
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

          { clinicSitesFilterOptions.length > 0 &&
            <>
              <Box>
                <Text sx={{ fontSize: 1, color: 'text.primary', fontWeight: 'medium' }}>
                  {t('Sites ({{ count }})', { count: clinic?.sites?.length || '0' })}{' - '}
                </Text>
                <Text sx={{ fontSize: 0, color: 'text.primary' }}>
                  {t('Click on the edit icon to rename the site or trash icon to delete it.')}
                </Text>
              </Box>
              <Box mt={1} mb={0}>
                <Text sx={{ fontSize: 0, color: colors.gray50, fontStyle: 'italic' }}>
                  {t('Name')}
                </Text>
              </Box>
            </>
          }

          <Box mt={1} id="clinic-patients-edit-site-list">
            {
              orderedSites.map(({ id, name }) => (
                <Grid
                  key={`edit-sites-list-${id}`}
                  py={2}
                  sx={{
                    gridTemplateColumns: '1fr 72px 16px',
                    borderTop: `1px solid ${colors.gray05}`,
                    alignItems: 'center',
                  }}
                >
                  <Flex sx={{ alignItems: 'center'}}>
                    <Text className="clinic-site-text" sx={{ fontSize: 1, color: 'text.primary' }}>{name}</Text>
                    <Icon
                      id={`edit-site-button-${id}`}
                      data-testid={`edit-site-button-${id}`}
                      icon={EditIcon}
                      sx={{ fontSize: 1, marginLeft: 2 }}
                      onClick={() => onUpdate(id)}
                    />
                  </Flex>
                  <Box>

                  </Box>
                  <Flex sx={{ justifyContent: 'flex-end' }}>
                    <Icon
                      id={`delete-site-button-${id}`}
                      data-testid={`delete-site-button-${id}`}
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
            id="edit-sites-dialog-done"
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

export default ClinicSitesDialog;

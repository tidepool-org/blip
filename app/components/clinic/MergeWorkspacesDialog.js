import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { colors as vizColors } from '@tidepool/viz';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import { Box, Flex, Label, Link, Text } from 'theme-ui';

import Button from '../elements/Button';
import Icon from '../elements/Icon';
import Pill from '../elements/Pill';
import { Body1, Caption, MediumTitle, Subheading } from '../elements/FontStyles';
import { Dialog, DialogTitle, DialogContent, DialogActions, DIALOG_FULL_SCREEN_QUERY as mobile } from '../elements/Dialog';
import MergeWorkspacesConfirmDialog from './MergeWorkspacesConfirmDialog';
import { selectElementStyleOverrides } from './PatientForm/styles';
import { colors } from '../../themes/baseTheme';
import { clinicPatientTagSchema, clinicSiteSchema } from '../../core/clinicUtils';
import { URL_MERGE_WORKSPACES_INFO } from '../../core/constants';
import utils from '../../core/utils';

const toNameOptions = items => utils.sortByLabel((items || []).map(({ name }) => ({ label: name, value: name })), 'label');
const toOption = name => (name ? { label: name, value: name } : null);

const nameError = (schema, name) => {
  try {
    schema.validateSync({ name: name.trim() });
    return null;
  } catch (error) {
    return error.message;
  }
};

// Menus render in a body portal above the dialog (z-index 1310) so the dialog's scrolling content never clips them.
const selectProps = {
  styles: { ...selectElementStyleOverrides, menuPortal: base => ({ ...base, zIndex: 1311 }) },
  isClearable: true,
  menuPortalTarget: document.body,
  menuPosition: 'fixed',
};

const labelStyles = { fontSize: 1, fontWeight: 'medium', color: vizColors.blue50, lineHeight: 1.75 };

const panelStyles = { flex: 1, minWidth: 0, flexDirection: 'column', gap: 2, p: 3, border: 'card', borderRadius: 'default' };

const SectionHeading = ({ number, optional = false, disabled = false, children }) => {
  const { t } = useTranslation();

  return (
    <Flex sx={{ alignItems: 'center', gap: 2 }}>
      <Flex
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          borderRadius: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 0,
          fontWeight: 'bold',
          bg: disabled ? 'lightestGrey' : 'indigo00',
          color: disabled ? 'gray50' : 'indigo50',
        }}
      >
        {number}
      </Flex>
      <Subheading sx={{ fontWeight: 'bold', color: disabled ? 'gray50' : 'text.primary' }}>
        {children}
        {optional && <Text as="span" sx={{ fontWeight: 'regular' }}> {t('(optional)')}</Text>}
      </Subheading>
    </Flex>
  );
};

SectionHeading.propTypes = {
  number: PropTypes.number.isRequired,
  optional: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

const MergeWorkspacesDialog = ({
  open,
  onClose,
  workspaces = [],
  onGenerateReport,
  generatingReport = false,
  onMerge,
  merging = false,
}) => {
  const { t } = useTranslation();
  const [sourceId, setSourceId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [sourcePatientTag, setSourcePatientTag] = useState(null);
  const [sourcePatientSite, setSourcePatientSite] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const targetClinic = useSelector(state => state.blip.clinics?.[targetId]);

  const handleSourceChange = option => setSourceId(option?.value || null);

  const handleTargetChange = (option) => {
    setTargetId(option?.value || null);
    setSourcePatientTag(null);
    setSourcePatientSite(null);
  };

  const reset = () => {
    handleSourceChange(null);
    handleTargetChange(null);
    setConfirming(false);
  };

  const options = useMemo(
    () => utils.sortByLabel(workspaces.map(({ id, name }) => ({ label: name, value: id })), 'label'),
    [workspaces]
  );

  const tagOptions = useMemo(() => toNameOptions(targetClinic?.patientTags), [targetClinic?.patientTags]);
  const siteOptions = useMemo(() => toNameOptions(targetClinic?.sites), [targetClinic?.sites]);
  const sourceName = options.find(option => option.value === sourceId)?.label;
  const targetName = options.find(option => option.value === targetId)?.label;

  // New names follow the same rules as the workspace's own tag and site forms.
  const creatableSelectProps = schema => ({
    ...selectProps,
    formatCreateLabel: name => t('Create "{{name}}"', { name: name.trim() }),
    isValidNewOption: (name, _value, existing) => !nameError(schema, name)
      && !existing.some(({ label }) => label.toLowerCase() === name.trim().toLowerCase()),
    noOptionsMessage: ({ inputValue }) => (inputValue && nameError(schema, inputValue)) || t('No options'),
  });

  const workspaceSelectProps = { ...selectProps, placeholder: t('Select a workspace') };

  return (
    <>
      <Dialog
        id="mergeWorkspacesDialog"
        aria-labelledby="mergeWorkspacesDialog-title"
        maxWidth="md"
        fullWidth
        disablePortal
        open={open}
        onClose={onClose}
        TransitionProps={{ onExited: reset }}
      >
        <DialogTitle onClose={onClose}>
          <MediumTitle id="mergeWorkspacesDialog-title">{t('Merge Workspaces')}</MediumTitle>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Body1 sx={{ fontWeight: 'medium' }}>
            {t('Merging moves every patient from one workspace into another, then permanently deletes the workspace they came from.')}&nbsp;
            <Link
              id="merge-workspaces-support-link"
              href={URL_MERGE_WORKSPACES_INFO}
              target="_blank"
              rel="noreferrer noopener"
              sx={{ fontSize: 1, fontWeight: 'medium' }}
            >
              {t('Learn more about how merging works')}
            </Link>
          </Body1>

          <Flex sx={{ flexDirection: 'column', gap: 3 }}>
            <SectionHeading number={1}>{t('Choose the workspaces')}</SectionHeading>
            <Flex sx={{ gap: 2, [mobile]: { flexDirection: 'column' } }}>
              <Flex sx={panelStyles}>
                <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Label htmlFor="merge-workspaces-from" sx={{ ...labelStyles, width: 'auto' }}>{t('Merge from')}</Label>
                  <Pill text={t('Deleted after merge')} label={t('Deleted after merge')} colorPalette={colors.status.declined} />
                </Flex>
                <Select
                  {...workspaceSelectProps}
                  name="merge-workspaces-from"
                  inputId="merge-workspaces-from"
                  classNamePrefix="MergeWorkspacesFrom"
                  value={options.find(option => option.value === sourceId) || null}
                  onChange={handleSourceChange}
                  options={options.filter(option => option.value !== targetId)}
                />
                <Caption>
                  {t('Its patients move to the workspace you merge into. If an MRN or a site name clashes, the copy from this workspace is the one that gets renamed.')}
                </Caption>
              </Flex>
              <Icon
                aria-hidden="true"
                tabIndex={-1}
                variant="static"
                icon={ArrowForwardRoundedIcon}
                label={t('Merges into')}
                sx={{
                  flexShrink: 0,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  fontSize: 2,
                  borderRadius: 'full',
                  border: '1px solid',
                  borderColor: 'blueGray10',
                  bg: 'white',
                  color: 'indigo30',
                  [mobile]: { transform: 'rotate(90deg)' },
                }}
              />
              <Flex sx={panelStyles}>
                <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Label htmlFor="merge-workspaces-into" sx={{ ...labelStyles, width: 'auto' }}>{t('Merge into')}</Label>
                  <Pill text={t('Stays')} label={t('Stays')} colorPalette={colors.status.pending} />
                </Flex>
                <Select
                  {...workspaceSelectProps}
                  name="merge-workspaces-into"
                  inputId="merge-workspaces-into"
                  classNamePrefix="MergeWorkspacesInto"
                  value={options.find(option => option.value === targetId) || null}
                  onChange={handleTargetChange}
                  options={options.filter(option => option.value !== sourceId)}
                />
                <Caption>
                  {t('This workspace stays and receives all patients. Its own patients, tags and sites are not changed.')}
                </Caption>
              </Flex>
            </Flex>
          </Flex>

          <Flex sx={{ flexDirection: 'column', gap: 3 }}>
            <SectionHeading number={2} optional>{t('Check what will change')}</SectionHeading>
            <Flex
              variant="containers.infoWell"
              sx={{ py: 3, [mobile]: { flexDirection: 'column', alignItems: 'stretch', '& > .icon': { display: 'none' } } }}
            >
              <Icon className="icon" aria-hidden="true" tabIndex={-1} variant="static" icon={InfoRoundedIcon} label={t('Info')} />
              <Body1 sx={{ flex: 1 }}>
                {t('The Merge Report lists the patients in both workspaces and any duplicates the merge would create. Downloading it does not merge anything.')}
                {!targetId && <>&nbsp;{t('Choose a workspace to merge into to download one.')}</>}
              </Body1>
              <Button
                id="merge-workspaces-report"
                variant="secondary"
                icon={GetAppRoundedIcon}
                iconPosition="left"
                disabled={!targetId}
                processing={generatingReport}
                onClick={() => onGenerateReport({ targetId, sourceId })}
                sx={{ flexShrink: 0 }}
              >
                {t('Download Merge Report')}
              </Button>
            </Flex>
          </Flex>

          <Flex sx={{ flexDirection: 'column', gap: 3 }}>
            <SectionHeading number={3} optional disabled={!sourceId || !targetId}>{t('Label the moved patients')}</SectionHeading>
            {sourceId && targetId ? (
              <>
                <Body1>
                  {t('Give every patient from {{source}} one tag and one site so they are easy to find after the merge. A new tag or site is created in {{target}} if it doesn\'t already exist there.', { source: sourceName, target: targetName })}
                </Body1>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 3, [mobile]: { gridTemplateColumns: '1fr' } }}>
                  <Box>
                    <Label htmlFor="merge-workspaces-tag" sx={labelStyles}>{t('Tag')}</Label>
                    <CreatableSelect
                      {...creatableSelectProps(clinicPatientTagSchema)}
                      name="merge-workspaces-tag"
                      inputId="merge-workspaces-tag"
                      classNamePrefix="MergeWorkspacesTag"
                      placeholder={t('Select or create a tag')}
                      value={toOption(sourcePatientTag)}
                      onChange={option => setSourcePatientTag(option?.value || null)}
                      onCreateOption={name => setSourcePatientTag(name.trim())}
                      options={tagOptions}
                    />
                  </Box>
                  <Box>
                    <Label htmlFor="merge-workspaces-site" sx={labelStyles}>{t('Site')}</Label>
                    <CreatableSelect
                      {...creatableSelectProps(clinicSiteSchema)}
                      name="merge-workspaces-site"
                      inputId="merge-workspaces-site"
                      classNamePrefix="MergeWorkspacesSite"
                      placeholder={t('Select or create a site')}
                      value={toOption(sourcePatientSite)}
                      onChange={option => setSourcePatientSite(option?.value || null)}
                      onCreateOption={name => setSourcePatientSite(name.trim())}
                      options={siteOptions}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <Body1 sx={{ color: 'gray50' }}>
                {t('Once both workspaces are chosen, you can give every moved patient one tag and one site.')}
              </Body1>
            )}
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button variant="textSecondary" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            id="merge-workspaces-merge"
            variant="primary"
            disabled={!sourceId || !targetId}
            onClick={() => setConfirming(true)}
          >
            {t('Merge')}
          </Button>
        </DialogActions>
      </Dialog>
      <MergeWorkspacesConfirmDialog
        open={open && confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => onMerge({ sourceId, targetId, sourcePatientTag, sourcePatientSite, confirmed: true })}
        processing={merging}
        sourceName={sourceName}
        targetName={targetName}
        sourcePatientTag={sourcePatientTag}
        sourcePatientSite={sourcePatientSite}
      />
    </>
  );
};

MergeWorkspacesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workspaces: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  onGenerateReport: PropTypes.func.isRequired,
  generatingReport: PropTypes.bool,
  onMerge: PropTypes.func.isRequired,
  merging: PropTypes.bool,
};

export default MergeWorkspacesDialog;

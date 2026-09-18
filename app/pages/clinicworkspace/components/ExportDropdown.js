import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import noop from 'lodash/noop';

import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import ViewQuiltOutlinedIcon from '@material-ui/icons/ViewQuiltOutlined';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import PatientListIcon from '../../../core/icons/PatientListIcon.svg';
import { trackMetric } from '../../../core/metricUtils';
import { summaryPeriodOptions } from '../../../core/clinicUtils';
import { useExportPatientListMutation } from '../../../redux/features/patientListExport/patientListExportApi';
import { useToasts } from '../../../providers/ToastProvider';

const ExportDropdown = ({
  period,
  showRpmReport = false,
  showPatientListExport = false,
  onSelectRpmReport = noop,
}) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const [exportPatientList, { isLoading }] = useExportPatientListMutation();

  const popupState = usePopupState({ variant: 'popover', popupId: 'exportDropdown' });

  const handleSelectRpmReport = () => {
    popupState.close();
    onSelectRpmReport();
  };

  const handleExportPatientList = async () => {
    popupState.close();
    trackMetric('Clinic - Export patient list', { clinicId: selectedClinicId, period });

    try {
      const { csv, filename } = await exportPatientList({ clinicId: selectedClinicId, period }).unwrap();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      a.download = filename;
      a.click();
      setToast({ message: t('Your patient list will download shortly.'), variant: 'success' });
    } catch {
      setToast({ message: t('We were unable to generate your report. Please try again.'), variant: 'danger' });
    }
  };

  return (
    <>
      <Button
        id="export-dropdown-trigger"
        variant="filter"
        selected={popupState.isOpen}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Export options"
        processing={isLoading}
        sx={{ fontSize: 0, lineHeight: 1.3 }}
        {...bindTrigger(popupState)}
      >
        {t('Export')}
      </Button>

      <Popover
        minWidth="15em"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        {...bindPopover(popupState)}
      >
        {showRpmReport && (
          <Button
            id="open-rpm-report-config"
            className="action-list-item"
            variant="actionListItem"
            iconPosition="left"
            icon={ViewQuiltOutlinedIcon}
            iconLabel="RPM Report"
            onClick={handleSelectRpmReport}
          >
            {t('RPM Report')}
          </Button>
        )}

        {showPatientListExport && (
          <Button
            id="export-patient-list"
            className="action-list-item"
            variant="actionListItem"
            iconPosition="left"
            iconSrc={PatientListIcon}
            iconLabel="Patient List"
            onClick={handleExportPatientList}
          >
            {t('Patient List')}
          </Button>
        )}
      </Popover>
    </>
  );
};

ExportDropdown.propTypes = {
  period: PropTypes.oneOf(summaryPeriodOptions.map(opt => opt.value)).isRequired,
  showRpmReport: PropTypes.bool,
  showPatientListExport: PropTypes.bool,
  onSelectRpmReport: PropTypes.func,
};

export default ExportDropdown;

/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';
import _ from 'lodash';
import ClipboardButton from 'react-clipboard.js';

import styles from './Tandem.css';

import Header from './common/Header';
import Table from './common/Table';
import CollapsibleContainer from './common/CollapsibleContainer';
import { MGDL_UNITS, MMOLL_UNITS } from '../../utils/constants';
import { deviceName } from '../../utils/settings/data';
import * as tandemData from '../../utils/settings/tandemData';
import { tandemText } from '../../utils/settings/textData';

import i18next from 'i18next';
const t = i18next.t.bind(i18next);

const Tandem = (props) => {
  const {
    bgUnits,
    copySettingsClicked,
    openedSections,
    pumpSettings,
    timePrefs,
    toggleProfileExpansion,
    user,
    deviceDisplayName,
  } = props;

  function openSection(sectionName) {
    return _.get(openedSections, sectionName, false);
  }

  const tables = _.map(tandemData.basalSchedules(pumpSettings), (schedule) => {
    const basal = tandemData.basal(schedule, pumpSettings, bgUnits, styles);

    return (
      <div className="settings-table-container" key={basal.scheduleName}>
        <CollapsibleContainer
          label={basal.title}
          labelClass={styles.collapsibleLabel}
          opened={openSection(basal.scheduleName)}
          toggleExpansion={_.partial(toggleProfileExpansion, basal.scheduleName)}
          twoLineLabel={false}
        >
          <Table
            rows={basal.rows}
            columns={basal.columns}
            tableStyle={styles.profileTable}
          />
        </CollapsibleContainer>
      </div>
    );
  });

  return (
    <div>
      <ClipboardButton
        className={styles.copyButton}
        button-title={t('For email or notes')}
        data-clipboard-target="#copySettingsText"
        onClick={copySettingsClicked}
      >
        <p>{t('Copy as text')}</p>
      </ClipboardButton>
      <Header
        deviceDisplayName={deviceDisplayName}
        deviceMeta={tandemData.deviceMeta(pumpSettings, timePrefs)}
      />
      <div>
        <span className={styles.title}>{t('Profile Settings')}</span>
        {tables}
      </div>
      <pre className={styles.copyText} id="copySettingsText">
        {tandemText(user, pumpSettings, bgUnits)}
      </pre>
    </div>
  );
};

Tandem.propTypes = {
  bgUnits: PropTypes.oneOf([MMOLL_UNITS, MGDL_UNITS]).isRequired,
  copySettingsClicked: PropTypes.func.isRequired,
  deviceKey: PropTypes.oneOf(['tandem']).isRequired,
  deviceDisplayName: PropTypes.string.isRequired,
  openedSections: PropTypes.object.isRequired,
  pumpSettings: PropTypes.shape({
    activeSchedule: PropTypes.string.isRequired,
    units: PropTypes.object.isRequired,
    deviceId: PropTypes.string.isRequired,
    basalSchedules: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.arrayOf(
          PropTypes.shape({
            start: PropTypes.number.isRequired,
            rate: PropTypes.number.isRequired,
          }),
        ),
      }).isRequired,
    ).isRequired,
    bgTargets: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          start: PropTypes.number.isRequired,
          target: PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
    carbRatios: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          start: PropTypes.number.isRequired,
          amount: PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
    insulinSensitivities: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          start: PropTypes.number.isRequired,
          amount: PropTypes.number.isRequired,
        })
      ).isRequired,
    ).isRequired,
  }).isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool.isRequired,
    timezoneName: PropTypes.string,
  }).isRequired,
  toggleProfileExpansion: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

Tandem.defaultProps = {
  deviceDisplayName: deviceName('tandem'),
  deviceKey: 'tandem',
};

export default Tandem;

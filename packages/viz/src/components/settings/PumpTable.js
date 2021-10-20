import i18next from "i18next";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import * as datetime from "../../utils/datetime";
import styles from "./Diabeloop.css";

const t = i18next.t.bind(i18next);
const DEFAULT_VALUE = "-";

class PumpTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { pump } = this.props;

    if ( pump === null) {
      return null;
    }

    const pumpExpirationDate = this.formatDate(pump.expirationDate);

    return (
      <table id="settings-table-pump" className={styles.pumpTable}>
        <caption id="settings-table-pump-title" className={styles.bdlgSettingsHeader}>
          {t("Pump")}
        </caption>
        <tbody>
          <tr>
            <td id="settings-table-pump-manufacturer">{t("Manufacturer")}</td>
            <td id="settings-table-pump-manufacturer-value">{pump.manufacturer}</td>
          </tr>
          <tr>
            <td id="settings-table-pump-serial">{t("Serial Number")}</td>
            <td id="settings-table-pump-serial-value">{pump.serialNumber}</td>
          </tr>
          <tr>
            <td id="settings-table-pump-swversion">{t("Pump version")}</td>
            <td id="settings-table-pump-swversion-value">{pump.swVersion}</td>
          </tr>
          <tr>
            <td id="settings-table-pump-expdate">{t("Pump cartridge expiration date")}</td>
            <td id="settings-table-pump-expdate-value" data-isodate={pump.expirationDate}>{pumpExpirationDate}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  formatDate(value) {
    const { timePrefs } = this.props;
    if (_.isEmpty(value)) {
      return DEFAULT_VALUE;
    }

    return datetime.formatLocalizedFromUTC(value, timePrefs, t("MMM D, YYYY"));
  }
}

// if the value is not present
PumpTable.defaultProps = {
  pump : {
    manufacturer: DEFAULT_VALUE,
    serialNumber: DEFAULT_VALUE,
    swVersion: DEFAULT_VALUE,
    expirationDate: DEFAULT_VALUE,
  }
};

PumpTable.propTypes = {
  pump : PropTypes.shape({
    manufacturer: PropTypes.string.isRequired,
    serialNumber: PropTypes.string.isRequired,
    swVersion: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
  }).isRequired,
  timePrefs: PropTypes.shape({
    timezoneAware: PropTypes.bool.isRequired,
    timezoneName: PropTypes.string,
  }).isRequired,
};


export default PumpTable;

import i18next from "i18next";
import PropTypes from "prop-types";
import React from "react";
import styles from "./Diabeloop.css";

const t = i18next.t.bind(i18next);
const DEFAULT_VALUE = "-";

class TerminalTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { device } = this.props;

    if (device === null) {
      return null;
    }

    return (
      <table id="settings-table-terminal" className={styles.deviceTable}>
        <caption id="settings-table-terminal-device-name" className={styles.bdlgSettingsHeader}>
          {device.name}
        </caption>
        <tbody>
          <tr>
            <td id="settings-table-terminal-manufacturer">{t("Manufacturer")}</td>
            <td id="settings-table-terminal-manufacturer-value">{device.manufacturer}</td>
          </tr>
          <tr>
            <td id="settings-table-terminal-deviceid">{t("Identifier")}</td>
            <td id="settings-table-terminal-deviceid-value">{device.deviceId}</td>
          </tr>
          <tr>
            <td id="settings-table-terminal-imei">{t("IMEI")}</td>
            <td id="settings-table-terminal-imei-value">{device.imei}</td>
          </tr>
          <tr>
            <td id="settings-table-terminal-swversion">{t("Software version")}</td>
            <td id="settings-table-terminal-swversion-value">{device.swVersion}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

// if the value is not present
TerminalTable.defaultProps = {
  device: {
    deviceId: DEFAULT_VALUE,
    imei: DEFAULT_VALUE,
    name: DEFAULT_VALUE,
    manufacturer: DEFAULT_VALUE,
    swVersion: DEFAULT_VALUE
  }
};

TerminalTable.propTypes = {
  device: PropTypes.shape({
    deviceId: PropTypes.string.isRequired,
    imei: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    manufacturer: PropTypes.string.isRequired,
    swVersion: PropTypes.string.isRequired,
  }).isRequired,
};

export default TerminalTable;

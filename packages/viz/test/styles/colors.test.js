
import { expect } from "chai";

import colors from "../../src/styles/colors.css";

describe("colors", () => {
  it("should export all required colors", () => {
    expect(colors.bolus).to.equal("#6FC3BB");
    expect(colors.bolusMeal).to.equal("var(--bolus-meal)");
    expect(colors.bolusMicro).to.equal("var(--bolus-micro)");
    expect(colors.bolusManual).to.equal("var(--bolus-manual)");
    expect(colors.basal).to.equal("#19A0D7");
    expect(colors.basalHeader).to.equal("#DCF1F9");
    expect(colors.basalAutomated).to.equal("#00D3E6");
    expect(colors.basalManual).to.equal("#A8C8D4");
    expect(colors.statDark).to.equal("#27385B");
    expect(colors.statDefault).to.equal("#727375");
    expect(colors.statDisabled).to.equal("#E7E9EE");
    expect(colors.veryLow).to.equal("#DA3A1B");
    expect(colors.low).to.equal("#E98D7C");
    expect(colors.target).to.equal("#9FCC93");
    expect(colors.high).to.equal("#F9D83E");
    expect(colors.veryHigh).to.equal("#FFA700");
    expect(colors.insulin).to.equal("#0096D1");
    expect(colors.white).to.equal("#FFFFFF");
    expect(colors.axis).to.equal("#E7E9EE");
    expect(colors.muted).to.equal("#C1C9D6");
    expect(colors.rescuecarbs).to.equal("#FA9494");
    expect(colors.deviceEvent).to.equal("#727375");
    expect(colors.physicalActivity).to.equal("#00D3E6");
    expect(colors.confidentialMode).to.equal("#B4B4B4");
    expect(colors.smbg).to.equal("#6480FB");
    expect(colors.smbgHeader).to.equal("#E8ECFE");
    expect(colors.siteChange).to.equal("#FCD144");
    expect(colors.grey).to.equal("#6D6D6D");
    expect(colors.lightGrey).to.equal("#979797");
    expect(colors.darkGrey).to.equal("#4E4E4F");

  });
});

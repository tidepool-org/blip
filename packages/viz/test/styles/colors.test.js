import colors from '../../src/styles/colors.css';
import _ from 'lodash';

describe('colors', () => {
  it('should export all required colors', () => {
    expect(_.toLower(colors.bolus)).to.equal('var(--bolus)');
    expect(_.toLower(colors.bolusMeal)).to.equal('var(--bolus-meal)');
    expect(_.toLower(colors.bolusMicro)).to.equal('var(--bolus-micro)');
    expect(_.toLower(colors.bolusManual)).to.equal('var(--bolus-manual)');
    expect(_.toLower(colors.basal)).to.equal('#19a0d7');
    expect(_.toLower(colors.basalManual)).to.equal('#a8c8d4');
    expect(_.toLower(colors.statDark)).to.equal('#27385b');
    expect(_.toLower(colors.statDefault)).to.equal('#727375');
    expect(_.toLower(colors.statDisabled)).to.equal('#e7e9ee');
    expect(_.toLower(colors.veryLow)).to.equal('var(--bg-very-low)');
    expect(_.toLower(colors.low)).to.equal('var(--bg-low)');
    expect(_.toLower(colors.target)).to.equal('var(--bg-target)');
    expect(_.toLower(colors.high)).to.equal('var(--bg-high)');
    expect(_.toLower(colors.veryHigh)).to.equal('var(--bg-very-high)');
    expect(_.toLower(colors.insulin)).to.equal('#0096d1');
    expect(_.toLower(colors.white)).to.equal('#ffffff');
    expect(_.toLower(colors.axis)).to.equal('#e7e9ee');
    expect(_.toLower(colors.muted)).to.equal('#c1c9d6');
  });
});

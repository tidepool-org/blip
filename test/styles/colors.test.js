import colors from '../../src/styles/colors.css';
import _ from 'lodash';

describe('colors', () => {
  it('should export all required colors', () => {
    expect(_.toLower(colors.bolus)).to.equal('#6fc3bb');
    expect(_.toLower(colors.basal)).to.equal('#19a0d7');
    expect(_.toLower(colors.basalAutomated)).to.equal('#00e9fa');
    expect(_.toLower(colors.statDark)).to.equal('#27385b');
    expect(_.toLower(colors.statDefault)).to.equal('#727375');
    expect(_.toLower(colors.statDisabled)).to.equal('#e7e9ee');
    expect(_.toLower(colors.veryLow)).to.equal('#fb5951');
    expect(_.toLower(colors.low)).to.equal('#ff8b7c');
    expect(_.toLower(colors.target)).to.equal('#76d3a6');
    expect(_.toLower(colors.high)).to.equal('#bb9ae7');
    expect(_.toLower(colors.veryHigh)).to.equal('#8c65d6');
    expect(_.toLower(colors.insulin)).to.equal('#0096d1');
    expect(_.toLower(colors.white)).to.equal('#ffffff');
    expect(_.toLower(colors.axis)).to.equal('#e7e9ee');
    expect(_.toLower(colors.muted)).to.equal('#c1c9d6');
  });
});

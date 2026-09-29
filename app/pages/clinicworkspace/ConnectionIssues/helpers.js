import moment from 'moment-timezone';

export const getDaysAgo = (time) => {
    if (!time) return null;

    const targetTime = moment.utc(time, moment.ISO_8601, true);

    if (!targetTime.isValid()) return null;

    const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    const startOfTargetDay = targetTime.tz(browserTimezone).startOf('day');
    const startOfCurrentDay = moment.utc().tz(browserTimezone).startOf('day');

    return startOfCurrentDay.diff(startOfTargetDay, 'days');
};

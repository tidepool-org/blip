import { capitalize } from '../utils';
import i18next from '../language';

const t = i18next.t.bind(i18next);

// Generic validation
export const isRequired = (field = t('this field')) => capitalize(t('{{field}} is required.', {field}));
export const isTooShort = (min, field = t('this field')) => capitalize(t('{{field}} must be at least {{min}} characters long.', {field, min}));
export const isTooLong = (max, field = t('this field')) => capitalize(t('{{field}} must be at most {{max}} characters long.', {field, max}));
export const containsWhiteSpaces = (field = 'this field') => capitalize(t('{{field}} must not contain white spaces.', {field}));

// Email validation
export const invalidEmail = (field = t('this field')) => capitalize(t('{{field}} is invalid.', {field}));

// Password validation
export const noPassword = () => t('You have not entered a password.');
export const passwordsDontMatch = () => t('Passwords don\'t match.');

// Date validation
export const incompleteDate = (field = t('this field')) => capitalize(t('{{field}} is not a complete date.', {field}));
export const invalidDate = () => t('Hmm, this date doesn’t look right');
export const futureDate = (field = t('this field')) => capitalize(t('{{field}} cannot be in the future!', {field}));

//Birthday specific validation
export const noBirthday = () => t('You have not specified your birthday!');
export const invalidBirthday = () => t('You have not specified a valid birthday!');
export const mustBeAfterBirthday = (field) => capitalize(t('Hmm, {{field}} usually comes after birthday.', {field}));
export const underaged = () => t('You must be at least 13 years old.');

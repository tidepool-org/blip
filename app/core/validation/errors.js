import { capitalize } from '../utils';

// Generic validation
export const isRequired = (field = 'this field') => capitalize(`${field} is required.`);
export const isTooShort = (min, field = 'this field') => capitalize(`${field} must be at least ${min} characters long.`);
export const isTooLong = (max, field = 'this field') => capitalize(`${field} must be at most ${max} characters long.`);
export const containsWhiteSpaces = (field = 'this field') => capitalize(`${field} must not contain white spaces.`);

// Email validation
export const invalidEmail = (field = 'this field') => capitalize(`${field} is invalid.`);

// Password validation
export const noPassword = () => 'You have not entered a password.';
export const passwordsDontMatch = () => 'Passwords don\'t match.';

// Date validation
export const incompleteDate = (field = 'this field') => capitalize(`${field} is not a complete date.`);
export const invalidDate = () => 'Hmm, this date doesn’t look right';
export const futureDate = (field = 'this field') => capitalize(`${field} cannot be in the future!`);

//Birthday specific validation
export const noBirthday = () => 'You have not specified your birthday!';
export const invalidBirthday = () => 'You have not specified a valid birthday!';
export const mustBeAfterBirthday = (field) => capitalize(`Hmm, ${field} usually comes after birthday.`);
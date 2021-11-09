import zxcvbn from "zxcvbn";
import _ from "lodash";
import appConfig from "../config";
import { t } from "../language";

export interface CheckPasswordStrengthResults {
  onError: boolean;
  helperText: string;
  score: number;
}

export function checkPasswordStrength(password: string): CheckPasswordStrengthResults {
  let onError = false;
  let helperText = "";
  const { score } = zxcvbn(password);

  if (_.isEmpty(password.trim()) || password.length < appConfig.PWD_MIN_LENGTH) {
    onError = true;
    helperText = t("password-too-short", { minLength: appConfig.PWD_MIN_LENGTH });
  } else if (score < 3) {
    onError = true;
    helperText = t("password-too-weak");
  } else if (score > 3) {
    helperText = t("password-very-strong");
  } else {
    helperText = t("password-strong");
  }
  return { onError, helperText, score };
}

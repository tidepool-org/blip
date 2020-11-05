## Common
export API_HOST='http://localhost:8009'
export WEBPACK_DEVTOOL='source-map'
export PORT='3000'

# Diabeloop specific
export I18N_ENABLED='true'
export ALLOW_CHANGE_PASSWORD='false'
export ALLOW_SIGNUP_PATIENT='false'
export ALLOW_PATIENT_CHANGE_EMAIL='false'
export ALLOW_PATIENT_CHANGE_PASSWORD='false'
export ALLOW_PATIENT_CHANGE_NAME='true'
export HIDE_DONATE='true'
export HIDE_DEXCOM_BANNER='true'
export HIDE_UPLOAD_LINK='true'
export CAN_SEE_PWD_LOGIN='true'
export BRANDING='diabeloop'
export PASSWORD_MIN_LENGTH='10'
export PASSWORD_MAX_LENGTH='72'
export MAX_FAILED_LOGIN_ATTEMPTS='5'
export DELAY_BEFORE_NEXT_LOGIN_ATTEMPT='1'
export LATEST_TERMS='1970-01-01'

# External services:
# URL to HELP system
export HELP_LINK='disabled'
# url to web server hosting the asset files
# such as terms of use, data privacy, etc.
export ASSETS_URL='https://example.com/'
# Metrics service to use (disabled, highwater, matomo)
export METRICS_SERVICE='disabled'
# Metrics service Matomo URL (used only when METRICS_SERVICE='matomo'):
export MATOMO_TRACKER_URL='disabled'
export MATOMO_TRACKER_SITEID='0'
export SUPPORT_EMAIL_ADDRESS='support@example.com'
export SUPPORT_WEB_ADDRESS='https://example.com/'
# Crowdin translation service (enabled / disabled):
export CROWDIN='disabled'

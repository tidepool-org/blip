## Common
export API_HOST='http://localhost:8009'
export WEBPACK_DEVTOOL='source-map'
export PORT='3000'

# Tidepool specific
export I18N_ENABLED='false'
export ALLOW_CHANGE_PASSWORD='true'
export ALLOW_SIGNUP_PATIENT='true'
export ALLOW_PATIENT_CHANGE_EMAIL='true'
export ALLOW_PATIENT_CHANGE_PASSWORD='true'
export HIDE_DONATE='false'
export HIDE_DEXCOM_BANNER='false'
export HIDE_UPLOAD_LINK='false'
export CAN_SEE_PWD_LOGIN='false'
export BRANDING='tidepool'
export PASSWORD_MIN_LENGTH='8'
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
export REGULATORY_WEB_ADDRESS='https://example.com/'
# Crowdin translation service (enabled / disabled):
export CROWDIN='disabled'

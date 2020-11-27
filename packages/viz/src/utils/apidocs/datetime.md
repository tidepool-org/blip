
> @tidepool/viz@0.8.2-alpha apidocs /Users/clintbeacock/Sites/tidepool/viz
> jsdoc2md "src/utils/datetime.js"

## Functions

<dl>
<dt><a href="#getTimezoneFromTimePrefs">getTimezoneFromTimePrefs(timePrefs)</a> ⇒ <code>String</code></dt>
<dd><p>getTimezoneFromTimePrefs</p>
</dd>
<dt><a href="#formatBirthdate">formatBirthdate(patient)</a> ⇒ <code>String</code></dt>
<dd><p>formatBirthdate</p>
</dd>
<dt><a href="#formatClocktimeFromMsPer24">formatClocktimeFromMsPer24(duration, [format])</a> ⇒ <code>String</code></dt>
<dd><p>formatClocktimeFromMsPer24</p>
</dd>
<dt><a href="#formatCurrentDate">formatCurrentDate()</a> ⇒ <code>String</code></dt>
<dd><p>formatCurrentDate</p>
</dd>
<dt><a href="#formatDiagnosisDate">formatDiagnosisDate(patient)</a> ⇒ <code>String</code></dt>
<dd><p>formatDiagnosisDate</p>
</dd>
<dt><a href="#formatDuration">formatDuration(duration)</a> ⇒ <code>String</code></dt>
<dd><p>formatDuration</p>
</dd>
<dt><a href="#formatLocalizedFromUTC">formatLocalizedFromUTC(utc, timePrefs, [format])</a> ⇒ <code>String</code></dt>
<dd><p>formatLocalizedFromUTC</p>
</dd>
<dt><a href="#getHammertimeFromDatumWithTimePrefs">getHammertimeFromDatumWithTimePrefs(datum, timePrefs)</a> ⇒ <code>Number</code></dt>
<dd><p>getHammertimeFromDatumWithTimePrefs</p>
</dd>
<dt><a href="#getLocalizedCeiling">getLocalizedCeiling(utc, timePrefs)</a> ⇒ <code>Object</code></dt>
<dd><p>getLocalizedCeiling</p>
</dd>
</dl>

<a name="getTimezoneFromTimePrefs"></a>

## getTimezoneFromTimePrefs(timePrefs) ⇒ <code>String</code>
getTimezoneFromTimePrefs

**Kind**: global function  
**Returns**: <code>String</code> - timezoneName  

| Param | Type | Description |
| --- | --- | --- |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |

<a name="formatBirthdate"></a>

## formatBirthdate(patient) ⇒ <code>String</code>
formatBirthdate

**Kind**: global function  
**Returns**: <code>String</code> - formatted birthdate, e.g., 'Jul 4, 1975'; empty String if none found  

| Param | Type | Description |
| --- | --- | --- |
| patient | <code>Object</code> | Tidepool patient object containing profile |

<a name="formatClocktimeFromMsPer24"></a>

## formatClocktimeFromMsPer24(duration, [format]) ⇒ <code>String</code>
formatClocktimeFromMsPer24

**Kind**: global function  
**Returns**: <code>String</code> - formatted clocktime, e.g., '12:05 pm'  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>Number</code> | positive integer representing a time of day                            in milliseconds within a 24-hr day |
| [format] | <code>String</code> | optional moment display format string; default is 'h:mm a' |

<a name="formatCurrentDate"></a>

## formatCurrentDate() ⇒ <code>String</code>
formatCurrentDate

**Kind**: global function  
**Returns**: <code>String</code> - formatted current date, e.g., 'Jul 4, 2017';  
<a name="formatDiagnosisDate"></a>

## formatDiagnosisDate(patient) ⇒ <code>String</code>
formatDiagnosisDate

**Kind**: global function  
**Returns**: <code>String</code> - formatted diagnosis date, e.g., 'Jul 4, 1975'; empty String if none found  

| Param | Type | Description |
| --- | --- | --- |
| patient | <code>Object</code> | Tidepool patient object containing profile |

<a name="formatDuration"></a>

## formatDuration(duration) ⇒ <code>String</code>
formatDuration

**Kind**: global function  
**Returns**: <code>String</code> - formatted duration, e.g., '1¼ hr'  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>Number</code> | positive integer duration in milliseconds |

<a name="formatLocalizedFromUTC"></a>

## formatLocalizedFromUTC(utc, timePrefs, [format]) ⇒ <code>String</code>
formatLocalizedFromUTC

**Kind**: global function  
**Returns**: <code>String</code> - formatted datetime, e.g., 'Sunday, January 1'  

| Param | Type | Description |
| --- | --- | --- |
| utc | <code>String</code> | Zulu timestamp (Integer hammertime also OK) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |
| [format] | <code>String</code> | optional moment display format string; default is 'dddd, MMMM D' |

<a name="getHammertimeFromDatumWithTimePrefs"></a>

## getHammertimeFromDatumWithTimePrefs(datum, timePrefs) ⇒ <code>Number</code>
getHammertimeFromDatumWithTimePrefs

**Kind**: global function  
**Returns**: <code>Number</code> - Integer hammertime (i.e., UTC time in milliseconds)  

| Param | Type | Description |
| --- | --- | --- |
| datum | <code>Object</code> | a Tidepool datum with a time (required) and deviceTime (optional) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |

<a name="getLocalizedCeiling"></a>

## getLocalizedCeiling(utc, timePrefs) ⇒ <code>Object</code>
getLocalizedCeiling

**Kind**: global function  
**Returns**: <code>Object</code> - a JavaScript Date, the closest (future) midnight according to timePrefs;
                 if utc is already local midnight, returns utc  

| Param | Type | Description |
| --- | --- | --- |
| utc | <code>String</code> | Zulu timestamp (Integer hammertime also OK) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |



> @tidepool/viz@0.7.14 apidocs /Users/janabeck/Tidepool/viz
> jsdoc2md "src/utils/datetime.js"

## Functions

<dl>
<dt><a href="#getTimezoneFromTimePrefs">getTimezoneFromTimePrefs(timePrefs)</a> ⇒ <code>String</code></dt>
<dd><p>getTimezoneFromTimePrefs</p>
</dd>
<dt><a href="#getHammertimeFromDatumWithTimePrefs">getHammertimeFromDatumWithTimePrefs(datum, timePrefs)</a> ⇒ <code>Number</code></dt>
<dd><p>getHammertimeFromDatumWithTimePrefs</p>
</dd>
<dt><a href="#getTimezoneAwareCeiling">getTimezoneAwareCeiling(utc, timePrefs)</a> ⇒ <code>Object</code></dt>
<dd><p>getTimezoneAwareCeiling</p>
</dd>
<dt><a href="#formatClocktimeFromMsPer24">formatClocktimeFromMsPer24(duration, [format])</a> ⇒ <code>String</code></dt>
<dd><p>formatClocktimeFromMsPer24</p>
</dd>
<dt><a href="#formatTimezoneAwareFromUTC">formatTimezoneAwareFromUTC(utc, timePrefs, [format])</a> ⇒ <code>String</code></dt>
<dd><p>formatTimezoneAwareFromUTC</p>
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

<a name="getHammertimeFromDatumWithTimePrefs"></a>

## getHammertimeFromDatumWithTimePrefs(datum, timePrefs) ⇒ <code>Number</code>
getHammertimeFromDatumWithTimePrefs

**Kind**: global function  
**Returns**: <code>Number</code> - Integer hammertime (i.e., UTC time in milliseconds)  

| Param | Type | Description |
| --- | --- | --- |
| datum | <code>Object</code> | a Tidepool datum with a time (required) and deviceTime (optional) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |

<a name="getTimezoneAwareCeiling"></a>

## getTimezoneAwareCeiling(utc, timePrefs) ⇒ <code>Object</code>
getTimezoneAwareCeiling

**Kind**: global function  
**Returns**: <code>Object</code> - a JavaScript Date, the closest (future) midnight according to timePrefs;
                 if utc is already local midnight, returns utc  

| Param | Type | Description |
| --- | --- | --- |
| utc | <code>String</code> | Zulu timestamp (Integer hammertime also OK) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |

<a name="formatClocktimeFromMsPer24"></a>

## formatClocktimeFromMsPer24(duration, [format]) ⇒ <code>String</code>
formatClocktimeFromMsPer24

**Kind**: global function  
**Returns**: <code>String</code> - formatted clocktime, e.g., '12:05 pm'  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>Number</code> | positive integer representing a time of day                            in milliseconds within a 24-hr day |
| [format] | <code>String</code> | optional moment display format string; default is 'h:mm a' |

<a name="formatTimezoneAwareFromUTC"></a>

## formatTimezoneAwareFromUTC(utc, timePrefs, [format]) ⇒ <code>String</code>
formatTimezoneAwareFromUTC

**Kind**: global function  
**Returns**: <code>String</code> - formatted datetime, e.g., 'Sunday, January 1'  

| Param | Type | Description |
| --- | --- | --- |
| utc | <code>String</code> | Zulu timestamp (Integer hammertime also OK) |
| timePrefs | <code>Object</code> | object containing timezoneAware Boolean and timezoneName String |
| [format] | <code>String</code> | optional moment display format string; default is 'dddd, MMMM D' |


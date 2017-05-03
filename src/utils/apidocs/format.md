
> @tidepool/viz@0.7.16 apidocs /Volumes/Tidepool/viz
> jsdoc2md "src/utils/format.js"

## Functions

<dl>
<dt><a href="#formatBgValue">formatBgValue(val, bgPrefs, [outOfRangeThresholds])</a> ⇒ <code>String</code></dt>
<dd><p>formatBgValue</p>
</dd>
<dt><a href="#formatDecimalNumber">formatDecimalNumber(val, [places])</a> ⇒ <code>String</code></dt>
<dd><p>formatDecimalNumber</p>
</dd>
</dl>

<a name="formatBgValue"></a>

## formatBgValue(val, bgPrefs, [outOfRangeThresholds]) ⇒ <code>String</code>
formatBgValue

**Kind**: global function  
**Returns**: <code>String</code> - formatted blood glucose value  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>Number</code> | integer or float blood glucose value in either mg/dL or mmol/L |
| bgPrefs | <code>Object</code> | object containing bgUnits String and bgBounds Object |
| [outOfRangeThresholds] | <code>Object</code> | optional thresholds for `low` and `high` values;                                          derived from annotations in PwD's data, so may not exist |

<a name="formatDecimalNumber"></a>

## formatDecimalNumber(val, [places]) ⇒ <code>String</code>
formatDecimalNumber

**Kind**: global function  
**Returns**: <code>String</code> - numeric value rounded to the desired number of decimal places  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>Number</code> | numeric value to format |
| [places] | <code>Number</code> | optional number of decimal places to display;                            if not provided, will display as integer (0 decimal places) |


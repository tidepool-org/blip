
> @tidepool/viz@0.8.1 apidocs /Users/jebeck/Tidepool/viz
> jsdoc2md "src/utils/format.js"

## Functions

<dl>
<dt><a href="#formatBgValue">formatBgValue(val, bgPrefs, [outOfRangeThresholds])</a> ⇒ <code>String</code></dt>
<dd><p>formatBgValue</p>
</dd>
<dt><a href="#formatDecimalNumber">formatDecimalNumber(val, [places])</a> ⇒ <code>String</code></dt>
<dd><p>formatDecimalNumber</p>
</dd>
<dt><a href="#formatPercentage">formatPercentage(val)</a> ⇒ <code>String</code></dt>
<dd><p>formatPercentage</p>
</dd>
<dt><a href="#removeTrailingZeroes">removeTrailingZeroes(val)</a> ⇒ <code>String</code></dt>
<dd><p>removeTrailingZeroes</p>
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

<a name="formatPercentage"></a>

## formatPercentage(val) ⇒ <code>String</code>
formatPercentage

**Kind**: global function  
**Returns**: <code>String</code> - percentage  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>Number</code> | raw decimal proportion, range of 0.0 to 1.0 |

<a name="removeTrailingZeroes"></a>

## removeTrailingZeroes(val) ⇒ <code>String</code>
removeTrailingZeroes

**Kind**: global function  
**Returns**: <code>String</code> - - formatted decimal value w/o trailing zero-indexes  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>String</code> | formatted decimal value, may have trailing zeroes |



> @tidepool/viz@0.8.1 apidocs /Users/jebeck/Tidepool/viz
> jsdoc2md "src/utils/bloodglucose.js"

## Functions

<dl>
<dt><a href="#classifyBgValue">classifyBgValue(bgBounds, bgValue, classificationType)</a> ⇒ <code>String</code></dt>
<dd><p>classifyBgValue</p>
</dd>
<dt><a href="#convertToMmolL">convertToMmolL(bgVal)</a> ⇒ <code>Number</code></dt>
<dd><p>convertToMmolL</p>
</dd>
<dt><a href="#reshapeBgClassesToBgBounds">reshapeBgClassesToBgBounds(bgPrefs)</a> ⇒ <code>Object</code></dt>
<dd><p>reshapeBgClassesToBgBounds</p>
</dd>
</dl>

<a name="classifyBgValue"></a>

## classifyBgValue(bgBounds, bgValue, classificationType) ⇒ <code>String</code>
classifyBgValue

**Kind**: global function
**Returns**: <code>String</code> - bgClassification - low, target, high

| Param | Type | Description |
| --- | --- | --- |
| bgBounds | <code>Object</code> | object describing boundaries for blood glucose categories |
| bgValue | <code>Number</code> | integer or float blood glucose value in either mg/dL or mmol/L |
| classificationType | <code>String</code> | 'threeWay' or 'fiveWay' |

<a name="convertToMmolL"></a>

## convertToMmolL(bgVal) ⇒ <code>Number</code>
convertToMmolL

**Kind**: global function
**Returns**: <code>Number</code> - convertedBgVal - blood glucose value in mmol/L, unrounded

| Param | Type | Description |
| --- | --- | --- |
| bgVal | <code>Number</code> | blood glucose value in mg/dL |

<a name="reshapeBgClassesToBgBounds"></a>

## reshapeBgClassesToBgBounds(bgPrefs) ⇒ <code>Object</code>
reshapeBgClassesToBgBounds

**Kind**: global function
**Returns**: <code>Object</code> - bgBounds - @tidepool/viz-style bgBounds

| Param | Type | Description |
| --- | --- | --- |
| bgPrefs | <code>Object</code> | bgPrefs object from blip containing tideline-style bgClasses |


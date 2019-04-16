
> @tidepool/viz@0.8.1 apidocs /Users/jebeck/Tidepool/viz
> jsdoc2md "src/utils/bolus.js"

## Functions

<dl>
<dt><a href="#fixFloatingPoint">fixFloatingPoint(numeric)</a> ⇒ <code>Number</code></dt>
<dd><p>fixFloatingPoint</p>
</dd>
<dt><a href="#getBolusFromInsulinEvent">getBolusFromInsulinEvent(insulinEvent)</a> ⇒ <code>Object</code></dt>
<dd><p>getBolusFromInsulinEvent</p>
</dd>
<dt><a href="#getCarbs">getCarbs(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getCarbs</p>
</dd>
<dt><a href="#getProgrammed">getProgrammed(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getProgrammed</p>
</dd>
<dt><a href="#getRecommended">getRecommended(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getRecommended</p>
</dd>
<dt><a href="#getDelivered">getDelivered(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getDelivered</p>
</dd>
<dt><a href="#getDuration">getDuration(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getDuration</p>
</dd>
<dt><a href="#getExtended">getExtended(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getExtended</p>
</dd>
<dt><a href="#getExtendedPercentage">getExtendedPercentage(insulinEvent)</a> ⇒ <code>String</code></dt>
<dd><p>getExtendedPercentage</p>
</dd>
<dt><a href="#getMaxDuration">getMaxDuration(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getMaxDuration</p>
</dd>
<dt><a href="#getMaxValue">getMaxValue(insulinEvent)</a> ⇒ <code>Number</code></dt>
<dd><p>getMaxValue</p>
</dd>
<dt><a href="#getNormalPercentage">getNormalPercentage(insulinEvent)</a> ⇒ <code>String</code></dt>
<dd><p>getNormalPercentage</p>
</dd>
<dt><a href="#getTotalBolus">getTotalBolus(insulinEvents)</a> ⇒ <code>Number</code></dt>
<dd><p>getTotalBolus</p>
</dd>
<dt><a href="#hasExtended">hasExtended(insulinEvent)</a> ⇒ <code>Boolean</code></dt>
<dd><p>hasExtended</p>
</dd>
<dt><a href="#isInterruptedBolus">isInterruptedBolus(insulinEvent)</a> ⇒ <code>Boolean</code></dt>
<dd><p>isInterruptedBolus</p>
</dd>
<dt><a href="#isOverride">isOverride(insulinEvent)</a> ⇒ <code>Boolean</code></dt>
<dd><p>isOverride</p>
</dd>
<dt><a href="#isUnderride">isUnderride(insulinEvent)</a> ⇒ <code>Boolean</code></dt>
<dd><p>isUnderride</p>
</dd>
</dl>

<a name="fixFloatingPoint"></a>

## fixFloatingPoint(numeric) ⇒ <code>Number</code>
fixFloatingPoint

**Kind**: global function
**Returns**: <code>Number</code> - numeric value rounded to 3 decimal places

| Param | Type | Description |
| --- | --- | --- |
| numeric | <code>Number</code> | value |

<a name="getBolusFromInsulinEvent"></a>

## getBolusFromInsulinEvent(insulinEvent) ⇒ <code>Object</code>
getBolusFromInsulinEvent

**Kind**: global function
**Returns**: <code>Object</code> - a Tidepool bolus object

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool wizard or bolus object |

<a name="getCarbs"></a>

## getCarbs(insulinEvent) ⇒ <code>Number</code>
getCarbs

**Kind**: global function
**Returns**: <code>Number</code> - grams of carbs input into bolus calculator
                 NaN if bolus calculator not used; null if no carbInput

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool wizard or bolus object |

<a name="getProgrammed"></a>

## getProgrammed(insulinEvent) ⇒ <code>Number</code>
getProgrammed

**Kind**: global function
**Returns**: <code>Number</code> - value of insulin programmed for delivery in the given insulinEvent

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getRecommended"></a>

## getRecommended(insulinEvent) ⇒ <code>Number</code>
getRecommended

**Kind**: global function
**Returns**: <code>Number</code> - total recommended insulin dose

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getDelivered"></a>

## getDelivered(insulinEvent) ⇒ <code>Number</code>
getDelivered

**Kind**: global function
**Returns**: <code>Number</code> - units of insulin delivered in this insulinEvent

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getDuration"></a>

## getDuration(insulinEvent) ⇒ <code>Number</code>
getDuration

**Kind**: global function
**Returns**: <code>Number</code> - duration value in milliseconds

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getExtended"></a>

## getExtended(insulinEvent) ⇒ <code>Number</code>
getExtended

**Kind**: global function
**Returns**: <code>Number</code> - units of insulin delivered over an extended duration

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool wizard or bolus object |

<a name="getExtendedPercentage"></a>

## getExtendedPercentage(insulinEvent) ⇒ <code>String</code>
getExtendedPercentage

**Kind**: global function
**Returns**: <code>String</code> - percentage of combo bolus delivered later

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getMaxDuration"></a>

## getMaxDuration(insulinEvent) ⇒ <code>Number</code>
getMaxDuration

**Kind**: global function
**Returns**: <code>Number</code> - duration value in milliseconds

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getMaxValue"></a>

## getMaxValue(insulinEvent) ⇒ <code>Number</code>
getMaxValue

**Kind**: global function
**Returns**: <code>Number</code> - max programmed or recommended value wrt the insulinEvent

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getNormalPercentage"></a>

## getNormalPercentage(insulinEvent) ⇒ <code>String</code>
getNormalPercentage

**Kind**: global function
**Returns**: <code>String</code> - percentage of combo bolus delivered immediately

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="getTotalBolus"></a>

## getTotalBolus(insulinEvents) ⇒ <code>Number</code>
getTotalBolus

**Kind**: global function
**Returns**: <code>Number</code> - total bolus insulin in units

| Param | Type | Description |
| --- | --- | --- |
| insulinEvents | <code>Array</code> | Array of Tidepool bolus or wizard objects |

<a name="hasExtended"></a>

## hasExtended(insulinEvent) ⇒ <code>Boolean</code>
hasExtended

**Kind**: global function
**Returns**: <code>Boolean</code> - whether the bolus has an extended delivery portion

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="isInterruptedBolus"></a>

## isInterruptedBolus(insulinEvent) ⇒ <code>Boolean</code>
isInterruptedBolus

**Kind**: global function
**Returns**: <code>Boolean</code> - whether the bolus was interrupted or not

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="isOverride"></a>

## isOverride(insulinEvent) ⇒ <code>Boolean</code>
isOverride

**Kind**: global function
**Returns**: <code>Boolean</code> - whether the bolus programmed was larger than the calculated recommendation

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |

<a name="isUnderride"></a>

## isUnderride(insulinEvent) ⇒ <code>Boolean</code>
isUnderride

**Kind**: global function
**Returns**: <code>Boolean</code> - whether the bolus programmed was smaller than the calculated recommendation

| Param | Type | Description |
| --- | --- | --- |
| insulinEvent | <code>Object</code> | a Tidepool bolus or wizard object |


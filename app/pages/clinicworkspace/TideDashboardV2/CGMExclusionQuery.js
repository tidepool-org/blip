// Builds mutually exclusive query params for CGM categories.

// Rules are registered in priority order. Each rule's query params include negations
// of all higher-priority rules, so patients match at most one category.

export default class CGMExclusionQuery {
  constructor() {
    this.rules = {};
    this.queryParams = {};
  }

  getComplementaryOperator(operator) {
    switch (true) {
      case operator === '>=': return  '<';
      case operator === '<=': return  '>';
      case operator === '>':  return '<=';
      case operator === '<':  return '>=';
    }
  }

  // Each rule is adjusted for the half-percent rounding cutoff e.g. if querying
  // for X >= 4%, we need to include patients that have X >= 3.5%, since anything
  // above 3.6% gets rounded to 4% in the view
  getAdjustedThreshold(value, operator) {
    const rounded = Math.round(value * 100) / 100; // round to 2 decimal places

    if (operator === '>=' || operator === '<') {
      return Math.round((rounded - 0.005) * 1000) / 1000;
    } else if (operator === '<=' || operator === '>') {
      return Math.round((rounded + 0.005) * 1000) / 1000;
    }
  }

  addRule(name, param, operator, value) {
    const threshold = this.getAdjustedThreshold(value, operator);

    const queryParamsForRule = {};

    // For every existing rule, we need to negate the corresponding query
    for (const rule of Object.values(this.rules)) {
      const compOperator = this.getComplementaryOperator(rule.operator);
      queryParamsForRule[rule.param] = `${compOperator}${String(rule.threshold)}`;
    }

    // Add the new query after existing queries have been negated
    queryParamsForRule[param] = `${operator}${String(threshold)}`;

    // Store the new query params for retrieval by getQueryParams()
    this.rules[name] = { param, operator, threshold };
    this.queryParams[name] = queryParamsForRule;

    return this;
  }

  getQueryParams(name) {
    return this.queryParams[name] || {};
  }

  getRule(name) {
    return this.rules[name] || {};
  }
};

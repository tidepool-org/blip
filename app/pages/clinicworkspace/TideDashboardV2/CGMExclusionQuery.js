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

  addRule(name, param, operator, threshold) {
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
};

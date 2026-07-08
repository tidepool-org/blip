// Builds mutually exclusive query params for CGM categories.
// Rules are registered in priority order. Each rule's query params include
// negations of all higher-priority rules, so patients match at most one category.

export default class CGMExclusionQuery {
  constructor() {
    this.rules = [];
    this.computedParams = {};
  }

  negate(threshold) {
    switch (true) {
      case threshold.startsWith('>='): return threshold.replace('>=', '<');
      case threshold.startsWith('<='): return threshold.replace('<=', '>');
      case threshold.startsWith('>'):  return threshold.replace('>', '<=');
      case threshold.startsWith('<'):  return threshold.replace('<', '>=');

      default: return threshold;
    }
  }

  addRule(category, paramKey, threshold) {
    const queryParams = {};

    // For every existing rule, we need to negate the corresponding query
    for (const rule of this.rules) {
      queryParams[rule.paramKey] = this.negate(rule.threshold);
    }

    // Add the new query
    queryParams[paramKey] = threshold;

    // Store the new query params for retrieval by getQueryParams()
    this.computedParams[category] = queryParams;
    this.rules.push({ category, paramKey, threshold });

    return this;
  }

  getQueryParams(category) {
    return this.computedParams[category] || {};
  }
};

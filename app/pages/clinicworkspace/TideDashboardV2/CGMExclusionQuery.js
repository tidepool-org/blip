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
    const negations = {};

    // For each existing rule, we need to negate that query in the new query params
    for (const rule of this.rules) {
      negations[rule.paramKey] = this.negate(rule.threshold);
    }

    // Store the new query params
    const categoryQueryParams = { ...negations, [paramKey]: threshold };
    this.computedParams[category] = categoryQueryParams;
    this.rules.push({ category, paramKey, threshold });

    return this;
  }

  getQueryParams(category) {
    return this.computedParams[category] || {};
  }
};

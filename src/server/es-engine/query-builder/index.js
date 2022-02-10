class Querybuilder {
  constructor() {
    this.currentIndex = '';
    this.sortQueryParams = [];
    this.likeQueryParams = [];
    this.mustQueryParams = [];
    this.mustMultiFilters = [];
    this.mustNotQueryParams = [];
    this.mustWildcardQueryParams = [];
    this.termsAggregationParams = {};
    this.highlightParams = {};
    this.from = '';
    this.size = '';
  }

  index(index) {
    this.currentIndex = index;
  }

  sortBy(sortParamObject) {
    const param = {
      [sortParamObject.field]: {
        order: sortParamObject.direction,
      },
    };

    if (sortParamObject.nestedPath) {
      param[sortParamObject.field].nested = {
        path: sortParamObject.nestedPath,
      };
    }

    this.sortQueryParams.push(param);
  }

  wildcard(searchtermObject) {
    searchtermObject.fields.forEach((searchTermField) => {
      const param = {
        wildcard: {
          [searchTermField]: `*${searchtermObject.value}*`,
        },
      };

      // temporär geändert
      this.mustQueryParams.push(param);
    });
  }

  must(filterObject) {
    let param = {
      terms: {
        [filterObject.valueField]: filterObject.values,
      },
    };

    if (filterObject.nestedPath) {
      param = {
        nested: {
          path: filterObject.nestedPath,
          query: {
            bool: {
              must: {
                ...param,
              },
            },
          },
        },
      };
    }
    this.mustQueryParams.push(param);
  }

  mustMulti(filterObject) {
    this.must(filterObject);
    this.mustMultiFilters.push(filterObject);
  }

  mustNot(filterObject) {
    let param = {
      terms: {
        [filterObject.valueField]: filterObject.values,
      },
    };

    if (filterObject.nestedPath) {
      param = {
        nested: {
          path: filterObject.nestedPath,
          query: {
            bool: {
              must_not: {
                ...param,
              },
            },
          },
        },
      };
    }
    this.mustNotQueryParams.push(param);
  }

  mustWildcard(filterObject) {
    let param = {
      wildcard: {
        [filterObject.valueField]: `*${filterObject.values}*`,
      },
    };

    if (filterObject.nestedPath) {
      param = {
        nested: {
          path: filterObject.nestedPath,
          query: {
            bool: {
              must_not: {
                ...param,
              },
            },
          },
        },
      };
    }

    this.mustWildcardQueryParams.push(param);
  }

  range(filterObject) {
    let param = {
      range: {
        [filterObject.valueField]: {
          [filterObject.operator]: filterObject.values,
        },
      },
    };

    if (filterObject.nestedPath) {
      param = {
        nested: {
          path: filterObject.nestedPath,
          query: {
            bool: {
              must: {
                ...param,
              },
            },
          },
        },
      };
    }

    // Todo Distinction between must and must not (lte - nlte)
    this.mustQueryParams.push(param);
  }

  highlight(filterObject) {
    this.highlightParams[filterObject.valueField] = {};
  }

  paginate(from, size) {
    this.from = from;
    this.size = size;
  }

  termsAggregation(aggregationObject) {
    let currentAggs = {
      terms: {
        field: aggregationObject.displayValue,
        size: 1000,
      },
      aggs: {
        [aggregationObject.key]: {
          terms: {
            field: aggregationObject.value,
            size: 1,
          },
        },
      },
    };

    if (aggregationObject.nestedPath) {
      const copyCurrentAggs = { ...currentAggs };
      currentAggs = {
        nested: {
          path: aggregationObject.nestedPath,
        },
        aggs: {
          [aggregationObject.key]: copyCurrentAggs,
        },
      };
    }

    this.termsAggregationParams[aggregationObject.key] = currentAggs;
  }

  getFilteredMustParams(exludeField) {
    return [...this.mustQueryParams].filter((param) => Object.keys(param.terms)[0] !== exludeField);
  }

  getMustMultiFilters() {
    return this.mustMultiFilters;
  }

  get query() {
    const results = [];

    let result = {};

    // unfiltered Items
    if (this.termsAggregationParams.length > 0) {
      result = { index: this.currentIndex };
      results.push(result);

      result = {
        from: 0,
        size: 0,
        aggs: this.termsAggregationParams,
      };
      results.push(result);
    }

    result = { index: this.currentIndex };
    results.push(result);

    // filtered items
    result = {
      from: this.from,
      size: this.size,
      highlight: {
        fields: this.highlightParams,
      },
      sort: this.sortQueryParams,
      query: {
        bool: {
          must: this.mustQueryParams,
          must_not: this.mustNotQueryParams,
          should: this.mustWildcardQueryParams,
        },
      },
      aggs: this.termsAggregationParams,
    };
    results.push(result);

    // filtered Items for multi param filters
    this.mustMultiFilters.forEach((multiFilter) => {
      result = { index: this.currentIndex };
      results.push(result);

      result = {
        from: 0,
        size: 0,
        query: {
          bool: {
            must: this.getFilteredMustParams(multiFilter.valueField),
            must_not: this.mustNotQueryParams,
            should: this.mustWildcardQueryParams,
          },
        },
        aggs: this.termsAggregationParams,
      };
      results.push(result);
    });

    return results;
  }
}

module.exports = Querybuilder;

const SortParam = require('../../../entities/sortparam');

class Querybuilder {
  constructor() {
    this.currentIndex = '';
    this.sortQueryParams = [];
    this.likeQueryParams = [];
    this.mustQueryParams = [];
    this.mustMultiFilters = [];
    this.mustNotQueryParams = [];
    this.shouldInnerMustWildcardQueryParams = [];
    this.mustWildcardQueryParams = [];
    this.softRangeParams = [];
    this.softRangeParam_a = [];
    this.softRangeParam_b = [];
    this.termsAggregationParams = {};
    this.filterAggregationParams = [];
    this.highlightParams = {};
    this.from = '';
    this.size = '';
  }

  index(index) {
    this.currentIndex = index;
  }

  sortBy(sortParamObject, filterObject = null) {
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

    if (filterObject) {
      // pattern
      // *******
      // {
      //   "sort": [
      //     {
      //       "filterInfos.attribution.order": {
      //         "order": "asc",
      //         "nested": {
      //           "path": "filterInfos.attribution",
      //           "filter": {
      //             "bool": {
      //               "must": {
      //                 "terms": {
      //                     "filterInfos.attribution.id": [
      //                         "attribution.circle_of_lucas_cranach_the_elder"
      //                     ]
      //                 }
      //               }
      //             }
      //           }
      //         }
      //       }
      //     }
      //   ]
      // }
      param[sortParamObject.field].nested.filter = {
        bool: {
          must: {
            terms: {
              [filterObject.valueField]: filterObject.values,
            },
          },
        },
      };
    }
    this.sortQueryParams.push(param);
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
    if (filterObject.sortBy) {
      const sortObject = new SortParam(filterObject.sortBy, 'asc', filterObject.nestedPath);
      this.sortBy(sortObject, filterObject);
    }
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

  shouldInnerMustWildcard(filterObject) {
    const param = Querybuilder.wildcard(filterObject);
    this.shouldInnerMustWildcardQueryParams.push(param);
  }

  mustWildcard(filterObject) {
    const param = Querybuilder.wildcard(filterObject);
    this.mustWildcardQueryParams.push(param);
  }

  static wildcard(filterObject) {
    let param = {
      wildcard: {
        [filterObject.valueField]: {
          value: `*${filterObject.values}*`,
          case_insensitive: true,
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
    return param;
  }

  // TODO ausfüllen
  softRange(filterObjectLowerRange, filterObjectUpperRange) {
    // pattern
    // *******
    // {
    //   range: {
    //     'dating.begin': {
    //       gte: '1520',
    //     },
    //   },
    // },
    this.softRangeParam_a.push(
      {
        range: {
          [filterObjectLowerRange.valueField]: {
            [filterObjectLowerRange.operator]: filterObjectLowerRange.values,
          },
        },
      },
    );

    // pattern:
    // ********
    // bool: {
    //   should: [
    //     {
    //       range: {
    //         'dating.begin': {
    //           gte: '1520',
    //         },
    //       },
    //     },
    //     {
    //       range: {
    //         'dating.end': {
    //           gte: '1520',
    //         },
    //       },
    //     },
    //   ],
    // },


    this.softRangeParam_b.push(
      {
        bool: {
          should: [
            {
              range: {
                [filterObjectLowerRange.valueField]: {
                  [filterObjectLowerRange.operator]: filterObjectLowerRange.values,
                },
              },
            },
            {
              range: {
                [filterObjectUpperRange.valueField]: {
                  [filterObjectUpperRange.operator]: filterObjectUpperRange.values,
                },
              },
            },
          ],
        },
      },
    );

    const param = {
      bool: {
        should: [
          {
            bool: {
              must: this.softRangeParam_a,
              boost: 1.0,
            },
          },
          {
            bool: {
              must: this.softRangeParam_b,
            },
          },
        ],
      },
    };
    this.softRangeParams = param;
  }

  notRange(filterObject) {
    // cut the character 'n' at the beginning of the operator
    const operator = filterObject.operator.replace(/^n/, '');
    let param = {
      range: {
        [filterObject.valueField]: {
          [operator]: filterObject.values,
        },
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

  range(filterObject) {
    let param = {};
    const ranges = [];
    // If several filter objects are passed, then these are linked together via Or operators
    if (Array.isArray(filterObject)) {
      filterObject.forEach((element) => {
        ranges.push({
          range: {
            [element.valueField]: {
              [element.operator]: element.values,
            },
          },
        });
      });
      param = {
        bool: {
          should: ranges,
        },
      };
    } else {
      param = {
        range: {
          [filterObject.valueField]: {
            [filterObject.operator]: filterObject.values,
          },
        },
      };
    }

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
        size: 3000,
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

  filterAggregation(filterObject) {
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
    this.filterAggregationParams.push(param);
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

    // unfiltered Items, only if aggregations are added
    if (Object.keys(this.termsAggregationParams).length > 0) {
      result = { index: this.currentIndex };
      results.push(result);

      result = {
        from: 0,
        size: 0,
        aggs: this.termsAggregationParams,
      };

      if (this.filterAggregationParams.length > 0) {
        result.query = {
          bool: {
            must: this.filterAggregationParams,
          },
        };
      }

      results.push(result);
    }

    // filtered items
    result = { index: this.currentIndex };
    results.push(result);

    result = {
      from: this.from,
      size: this.size,
      highlight: {
        fields: this.highlightParams,
      },
      sort: this.sortQueryParams,
      query: {
        bool: {
          must: this.mustQueryParams
            .concat(this.mustWildcardQueryParams)
            .concat(this.softRangeParams)
            .concat({
              bool: {
                should: this.shouldInnerMustWildcardQueryParams,
              },
            }),
          must_not: this.mustNotQueryParams,
        },
      },
      aggs: this.termsAggregationParams,
    };
    results.push(result);

    // filtered Items for multi param filters, only if aggregations are added
    this.mustMultiFilters.forEach((multiFilter) => {
      result = { index: this.currentIndex };
      results.push(result);

      result = {
        from: 0,
        size: 0,
        query: {
          bool: {
            must: this.getFilteredMustParams(multiFilter.valueField)
              .concat(this.mustWildcardQueryParams)
              .concat(this.softRangeParams)
              .concat({
                bool: {
                  should: this.shouldInnerMustWildcardQueryParams,
                },
              }),
            must_not: this.mustNotQueryParams,
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

class Querybuilder {
  constructor() {
    this.currentIndex = '';
    this.sortQuerieParams = [];
    this.likeQueryParams = [];
    this.mustQueryParams = [];
    this.mustMultiFields = [];
    this.mustNotQueryParams = [];
    this.mustWildcardQueryParams = [];
    this.highlightParams = {};
    this.from = '';
    this.size = '';
  }

  index(index) {
    this.currentIndex = index;
  }

  sortBy(sortParamObject) {
    this.sortQuerieParams.push({
      [sortParamObject.field]: {
        order: sortParamObject.direction,
      },
    });
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
    const param = {
      terms: {
        [filterObject.valueField]: filterObject.values,
      },
    };
    this.mustQueryParams.push(param);
  }

  mustMulti(filterObject) {
    this.must(filterObject);
    this.mustMultiFields.push(filterObject.valueField);
  }

  mustNot(filterObject) {
    const param = {
      terms: {
        [filterObject.valueField]: filterObject.values,
      },
    };
    this.mustNotQueryParams.push(param);
  }

  mustWildcard(filterObject) {
    const param = {
      wildcard: {
        [filterObject.valueField]: `*${filterObject.values}*`,
      },
    };
    this.mustWildcardQueryParams.push(param);
  }

  highlight(filterObject) {
    this.highlightParams[filterObject.valueField] = {};
  }

  paginate(from, size) {
    this.from = from;
    this.size = size;
  }

  getFilteredMustParams(exludeField) {
    return [...this.mustQueryParams].filter((param) => Object.keys(param.terms)[0] !== exludeField);
  }

  get query() {
    const results = [];

    let result = {};

    result = { index: this.currentIndex };
    results.push(result);

    // unfiltered Items
    result = {
      from: 0,
      size: 0,
    };
    results.push(result);

    result = { index: this.currentIndex };
    results.push(result);

    // filtered items
    result = {
      from: this.from,
      size: this.size,
      highlight: {
        fields: this.highlightParams,
      },
      sort: this.sortQuerieParams,
      query: {
        bool: {
          must: this.mustQueryParams,
          must_not: this.mustNotQueryParams,
          should: this.mustWildcardQueryParams,
        },
      },
    };
    results.push(result);

    // filtered Items for multi param filters
    this.mustMultiFields.forEach((multiField) => {
      result = { index: this.currentIndex };
      results.push(result);

      result = {
        from: 0,
        size: 0,
        query: {
          bool: {
            must: this.getFilteredMustParams(multiField),
            must_not: this.mustNotQueryParams,
            should: this.mustWildcardQueryParams,
          },
        },
      };
      results.push(result);
    });

    return results;
  }
}

module.exports = Querybuilder;

class Querybuilder {
  constructor() {
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

  get query() {
    const results = [];

    // unfiltered Items
    let result = {
      from: 0,
      size: 0,
    };
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
          // temporär entfernt
          // should: this.likeQueryParams,
        },
      },
    };

    results.push(result);

    return results;
  }
}

module.exports = Querybuilder;

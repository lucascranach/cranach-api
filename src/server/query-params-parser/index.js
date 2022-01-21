const {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defautSortDirection,
  specialParams,
  getAllowedFilters,
  getSearchTermFields,
  getDefaultSortField,
  getSortableFields,
} = require('../mappings');

const SortParam = require('../../entities/sortparam');
const FilterParam = require('../../entities/filterparam');
const SearchtermParam = require('../../entities/searchtermparam');

function validateSearchTermParams(req, res, next) {
  const searchtermParam = req.query.searchterm;
  const searchtermFields = getSearchTermFields().map(mapping => mapping.value);

  if (!searchtermParam) {
    return next();
  }

  if (!req.api) {
    req.api = {};
  }

  req.api.searchtermParam = new SearchtermParam(searchtermFields, searchtermParam);
  return next();
}

function validateSortParams(req, res, next) {
  const filterParamsQuery = req.query;
  const sortableFields = getSortableFields();
  const resultSortParams = [];

  if (!filterParamsQuery.sort_by) {
    const defaultSortField = getDefaultSortField();
    resultSortParams.push(new SortParam(defaultSortField.value, defautSortDirection));
  } else {
    if (Array.isArray(filterParamsQuery.sort_by)) {
      res.status(500).json({ success: false, error: 'Serveral sort params are not allowed' });
      res.end();
    }

    const [sortFieldParam, sortDirectionParam] = filterParamsQuery.sort_by.split('.');

    if (sortDirectionParam) {
      if (!availableSortTypes[sortDirectionParam]) {
        // TODO: Error Objekt erzeugen, in in welches die Error Nachricht
        //       reingereicht wird und welches dann die Ausgabe erzeugt
        res.status(500).json({ success: false, error: `Not allowed sort direction <${sortDirectionParam}>` });
        res.end();
      }
    }

    // TODO auslagern in Mapping => funktion isSortable definieren
    const sortField = sortableFields.find(
      (sortableField) => sortableField.key === sortFieldParam,
    );

    resultSortParams.push(new SortParam(sortField.value, sortDirectionParam));

    if (!sortField) {
      res.status(500).json({ success: false, error: `Not allowed sort field <${sortFieldParam}>` });
      res.end();
    }
  }

  if (!req.api) {
    req.api = {};
  }
  req.api.sortParams = resultSortParams;
  next();
}

function validateFilterParams(req, res, next) {
  const filterParamsQuery = req.query;
  const filterParamsKeys = Object.keys(filterParamsQuery);
  const resultFilterParams = [];
  const allowedFilters = getAllowedFilters();

  filterParamsKeys.forEach((filterParamKey) => {
    // Split filter param from query
    // eslint-disable-next-line prefer-const
    let [filterKey, filterType = defaultFilterType] = filterParamKey.split(':');

    if (specialParams.includes(filterKey)) {
      return;
    }

    const filterTypeGroup = availableFilterTypes[filterType];
    if (filterTypeGroup === undefined) {
      res.status(500).json({ success: false, error: `Not allowed filter type <${filterType}>` });
    }

    const filteredFilter = allowedFilters.filter(
      (allowedFilter) => allowedFilter.key === filterKey,
    );

    if (filteredFilter.length > 1) {
      res.status(500).json({ success: false, error: `filter key <${filterKey}> assigned serveral times` });
    }

    if (filteredFilter.length === 0) {
      res.status(500).json({ success: false, error: `Not allowed filter key <${filterKey}>` });
    }

    if (!filteredFilter[0].filter_types.includes(filterTypeGroup)) {
      res.status(500).json({ success: false, error: `Not allowed filter type <${filterType}> for filter key <${filterKey}>` });
    }

    let filterValues = [];

    // Ranges and Wildcard search allows only one filter value
    if ((filterTypeGroup === 'range') || (filterTypeGroup === 'differ')) {
      filterValues = filterParamsQuery[filterParamKey];
    } else {
      filterValues = filterParamsQuery[filterParamKey].split(',');
    }

    const sortBy = filteredFilter[0].nestedPath && filteredFilter[0].sortBy
      ? filteredFilter[0].sortBy
      : null;

    const filter = new FilterParam(
      filterKey,
      filterValues,
      filterType,
      filterTypeGroup,
      filteredFilter[0].value,
      filteredFilter[0].nestedPath || null,
      sortBy,
    );

    resultFilterParams.push(filter);
  });

  if (!req.api) {
    req.api = {};
  }

  req.api.filterParams = resultFilterParams;
  next();
}

module.exports = {
  validateSearchTermParams,
  validateFilterParams,
  validateSortParams,
};
